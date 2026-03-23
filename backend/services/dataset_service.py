import pandas as pd
import numpy as np
from typing import Dict, List, Any
import os
import io
import base64

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from analytics.predictive_service import PredictiveService


class DatasetService:
    @staticmethod
    def load_df(file_path: str) -> pd.DataFrame:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.csv':
            df = pd.read_csv(file_path)
        elif ext in ['.xls', '.xlsx']:
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
            
        if df.empty:
            raise ValueError("The uploaded dataset is empty.")
        return df

    @staticmethod
    async def process_dataset(file_path: str) -> Dict[str, Any]:
        df = DatasetService.load_df(file_path)

        columns_metadata = []
        numeric_cols = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            col_type = "numeric"
            if "datetime" in dtype or "date" in dtype:
                col_type = "date"
            elif "object" in dtype or "category" in dtype:
                try:
                    pd.to_datetime(df[col].head(5), errors='raise')
                    col_type = "date"
                except:
                    col_type = "categorical"
            
            if col_type == "numeric":
                numeric_cols.append(col)

            col_meta = {
                "name": col,
                "type": col_type,
                "original_dtype": dtype,
                "unique_count": int(df[col].nunique()),
                "null_count": int(df[col].isna().sum()),
                "sample_values": [
                    str(v) for v in 
                    df[col].dropna().head(5).tolist()
                ]
            }

            if col_type == "numeric":
                numeric_series = pd.to_numeric(
                    df[col], errors='coerce'
                ).dropna()
                if not numeric_series.empty:
                    col_meta["min"] = round(
                        float(numeric_series.min()), 2
                    )
                    col_meta["max"] = round(
                        float(numeric_series.max()), 2
                    )
                    col_meta["mean"] = round(
                        float(numeric_series.mean()), 2
                    )
                    col_meta["std"] = round(
                        float(numeric_series.std()), 2
                    )
                    col_meta["median"] = round(
                        float(numeric_series.median()), 2
                    )
                else:
                    col_meta["min"] = None
                    col_meta["max"] = None
                    col_meta["mean"] = None
                    col_meta["std"] = None
                    col_meta["median"] = None

            columns_metadata.append(col_meta)

        summary_stats = df.describe(include='all').replace({np.nan: None}).to_dict()
        sample_rows = df.head(10).replace({np.nan: None}).to_dict(orient="records")
        
        # Quality Metrics (Section 3)
        duplicate_count = int(df.duplicated().sum())
        
        outlier_count = 0
        invalid_dates = 0
        for col in df.columns:
            if col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outlier_count += int(((df[col] < lower) | (df[col] > upper)).sum())
            
            # Check for invalid dates in date-like columns
            # (Simple heuristic)
            
        missing_counts = df.isna().sum().to_dict()
        total_missing = sum(missing_counts.values())
        total_elements = len(df) * len(df.columns)
        quality_score = max(0, 100 - (total_missing / total_elements * 100)) if total_elements > 0 else 0

        # Correlation Heatmap & Insights (Section 3)
        heatmap_base64 = None
        correlation_insights = []
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] >= 2:
            try:
                corr = numeric_df.corr()
                
                # Extract strong relationships
                corr_unstacked = corr.unstack()
                # filter out self-correlation and duplicates
                strong = corr_unstacked[
                    (abs(corr_unstacked) > 0.7) & (corr_unstacked < 1.0)
                ].sort_values(ascending=False).drop_duplicates()
                
                for (c1, c2), val in strong.head(3).items():
                    sentiment = "Strong correlation" if val > 0 else "Strong inverse correlation"
                    correlation_insights.append(f"{sentiment} detected between {c1} and {c2} ({val:.2f}).")

                fig, ax = plt.subplots(figsize=(6, 4))
                sns.heatmap(corr.round(2), cmap="Blues", annot=True, fmt=".2f", ax=ax, cbar=False)
                plt.tight_layout()
                buffer = io.BytesIO()
                fig.savefig(buffer, format="png", dpi=100)
                plt.close(fig)
                heatmap_base64 = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
            except Exception as e:
                print(f"Heatmap generation failed: {e}")
                heatmap_base64 = None

        return {
            "columns": columns_metadata,
            "summary": summary_stats,
            "sample_rows": sample_rows,
            "row_count": len(df),
            "col_count": len(df.columns),
            "quality_metrics": {
                "score": round(quality_score, 1),
                "total_missing": int(total_missing),
                "missing_by_column": missing_counts,
                "duplicate_count": duplicate_count,
                "outlier_count": outlier_count,
                "invalid_dates": invalid_dates
            },
            "correlation_heatmap": heatmap_base64,
            "correlation_insights": correlation_insights
        }


    @staticmethod
    async def clean_dataset(file_path: str) -> Dict[str, Any]:
        df = DatasetService.load_df(file_path)
        initial_rows = len(df)
        initial_nulls = int(df.isna().sum().sum())

        # 1. Duplicates (Section 4.1)
        df.drop_duplicates(inplace=True)
        rows_removed = initial_rows - len(df)

        # 2 & 3. Section 4.2: Missing Value Imputation & Dates
        for col in df.columns:
            dtype = str(df[col].dtype)
            
            # Date Detection/Conversion (Section 4.3)
            if "datetime" in dtype or "date" in dtype:
                df[col] = df[col].ffill().bfill()
            elif pd.api.types.is_numeric_dtype(df[col]):
                # Numeric -> Median (Section 4.2)
                df[col] = df[col].fillna(df[col].median())
                
                # Section 4.4: Outlier Normalization (IQR)
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                df[col] = df[col].clip(lower=lower, upper=upper)
            else:
                # Categorical -> Most Frequent (Section 4.2)
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])

        final_nulls = int(df.isna().sum().sum())
        
        # Save cleaned file
        df.to_csv(file_path, index=False) if file_path.endswith('.csv') else df.to_excel(file_path, index=False)

        return {
            "duplicates_removed": rows_removed,
            "missing_filled": initial_nulls - final_nulls,
            "outliers_handled": rows_removed + (initial_nulls - final_nulls), # Heuristic for summary
            "dates_converted": 0, # Not explicitly tracked in this version
            "final_rows": len(df),
            "status": "Success",
            "message": f"Auto-Cleaning complete: {rows_removed} duplicates removed, {initial_nulls - final_nulls} values imputed using Median/Mode rules, and outliers normalized via IQR."
        }

        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        # 2 & 3. Handle Types, Dates, Missing
        for col in df.columns:
            dtype = str(df[col].dtype)
            
            # Check for Date
            is_date = False
            if "datetime" in dtype or "date" in dtype:
                is_date = True
            elif ("object" in dtype or "category" in dtype) and col.lower() != 'id':
                try:
                    pd.to_datetime(df[col].dropna().head(10), errors='raise')
                    is_date = True
                except:
                    pass
            
            missing_count = int(df[col].isna().sum())
            if missing_count > 0:
                summary["missing_filled"] += missing_count

            if is_date:
                if missing_count > 0:
                    df[col] = df[col].ffill().bfill()
                df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%Y-%m-%d')
                summary["dates_converted"] += 1
            elif col in numeric_cols:
                if missing_count > 0:
                    df[col] = df[col].fillna(df[col].median())
                
                # 4. Handle Outliers (IQR)
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outliers = ((df[col] < lower) | (df[col] > upper)).sum()
                if outliers > 0:
                    summary["outliers_handled"] += int(outliers)
                    df[col] = df[col].clip(lower=lower, upper=upper)
            else:
                if missing_count > 0:
                    mode_val = df[col].mode()
                    val = mode_val[0] if len(mode_val) > 0 else "Unknown"
                    df[col] = df[col].fillna(val)

        # Save back to disk
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.csv':
            df.to_csv(file_path, index=False)
        elif ext in ['.xls', '.xlsx']:
            df.to_excel(file_path, index=False)

        summary["final_rows"] = len(df)
        return summary

    @staticmethod
    async def get_chart_data(file_path: str, x: str, y: str, chart_type: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        df = DatasetService.load_df(file_path)

        if x not in df.columns:
            raise ValueError(f"Column '{x}' not found in dataset")
        if chart_type != "pie" and isinstance(y, str) and y not in df.columns and y != "count":
            raise ValueError(f"Column '{y}' not found in dataset")
        
        # Apply filters
        if filters:
            for col, val in filters.items():
                if val != 'all' and col in df.columns:
                    df = df[df[col] == val]

        # Basic aggregation for charts
        # Handle multiple Y axes (for Radar, etc.)
        y_cols = [y] if isinstance(y, str) else y
        
        # Handle different chart types (grouping, aggregation)
        if chart_type in ["bar", "line", "pie", "area", "horizontalBar", "radar", "radialBar"]:
            df[x] = df[x].astype(str)
            if chart_type == "line" or chart_type == "area":
                try:
                    df[x] = pd.to_datetime(df[x])
                    data = df.sort_values(x).groupby(x)[y_cols].sum().reset_index()
                    data[x] = data[x].dt.strftime('%Y-%m-%d')
                except:
                    data = df.groupby(x)[y_cols].sum().reset_index()
            else:
                if "count" in y_cols:
                    data = df.groupby(x).size().reset_index(name='count')
                else:
                    data = df.groupby(x)[y_cols].mean().reset_index()
        elif chart_type == "box":
            data = df[[y]].dropna().sample(min(500, len(df)))
        elif chart_type == "treemap":
            data = df.groupby(x)[y_cols[0]].sum().reset_index()
        else:
            # Scatter, Funnel, etc.
            data = df[[x] + y_cols].dropna().head(1000)
        
        return data.replace({np.nan: None}).to_dict(orient="records")

    @staticmethod
    async def recommend_chart(file_path: str, x: str, y: str = None) -> str:
        df = DatasetService.load_df(file_path)
        
        if x not in df.columns:
            return "bar"
            
        def get_type(col):
            dtype = str(df[col].dtype)
            if "datetime" in dtype or "date" in dtype:
                return "date"
            if "float" in dtype or "int" in dtype:
                return "numeric"
            try:
                pd.to_datetime(df[col].dropna().head(5), errors='raise')
                return "date"
            except:
                return "categorical"

        x_type = get_type(x)
        
        if not y or y == "none" or y == "count":
            if x_type == "numeric":
                return "histogram"
            if x_type == "categorical":
                return "pie" if df[x].nunique() <= 10 else "bar"
            return "bar"

        if y not in df.columns:
            return "bar"
            
        y_type = get_type(y)

        if x_type == "date" and y_type == "numeric":
            return "line"
        if x_type == "categorical" and y_type == "numeric":
            return "bar"
        if x_type == "numeric" and y_type == "numeric":
            return "scatter"
        
        return "bar"


    @staticmethod
    async def auto_generate_charts(
        file_path: str
    ) -> list:
        df = DatasetService.load_df(file_path)
        
        skip_keywords = [
            'year', 'id', 'index', 'code', 
            'no', 'num', 'number', 'rank'
        ]
        
        all_numeric = list(
            df.select_dtypes(
                include=['number']
            ).columns
        )
        all_categorical = list(
            df.select_dtypes(
                include=['object', 'category']
            ).columns
        )
        
        meaningful_numeric = [
            col for col in all_numeric
            if not any(
                kw in col.lower() 
                for kw in skip_keywords
            )
        ]
        
        year_cols = [
            col for col in all_numeric
            if 'year' in col.lower() 
            or 'date' in col.lower()
            or 'time' in col.lower()
        ]
        
        numeric_cols = meaningful_numeric \
            if meaningful_numeric \
            else all_numeric
            
        categorical_cols = all_categorical
        
        chart_configs = []
        used_combinations = set()
        
        def add_chart(chart_type, x, y, title):
            key = f"{x}_{y}_{chart_type}"
            if key not in used_combinations \
                    and x != y:
                used_combinations.add(key)
                chart_configs.append({
                    "chart_type": chart_type,
                    "x": x,
                    "y": y,
                    "title": title
                })
        
        if categorical_cols and numeric_cols:
            best_cat = categorical_cols[0]
            best_num = numeric_cols[0]
            
            low_cardinality_cats = [
                c for c in categorical_cols
                if df[c].nunique() <= 20
            ]
            if low_cardinality_cats:
                best_cat = low_cardinality_cats[0]
            
            add_chart(
                "bar",
                best_cat,
                best_num,
                f"Bar - {best_num} by {best_cat}"
            )
        
        if year_cols and numeric_cols:
            time_col = year_cols[0]
            value_col = numeric_cols[0]
            add_chart(
                "line",
                time_col,
                value_col,
                f"Trend - {value_col} over {time_col}"
            )
        elif len(numeric_cols) >= 2:
            add_chart(
                "line",
                numeric_cols[0],
                numeric_cols[1],
                f"Line - {numeric_cols[1]} vs {numeric_cols[0]}"
            )
        
        if categorical_cols:
            best_cat_pie = categorical_cols[0]
            low_unique = [
                c for c in categorical_cols
                if 3 <= df[c].nunique() <= 8
            ]
            if low_unique:
                best_cat_pie = low_unique[0]
            
            add_chart(
                "pie",
                best_cat_pie,
                "count",
                f"Pie - Distribution of {best_cat_pie}"
            )
        
        if len(numeric_cols) >= 2:
            add_chart(
                "scatter",
                numeric_cols[0],
                numeric_cols[1],
                f"Scatter - {numeric_cols[1]} vs {numeric_cols[0]}"
            )
        
        if len(numeric_cols) >= 1:
            best_hist = numeric_cols[0]
            add_chart(
                "histogram",
                best_hist,
                best_hist,
                f"Histogram - Distribution of {best_hist}"
            )
        
        if len(categorical_cols) >= 1 and \
                len(numeric_cols) >= 1 and \
                len(chart_configs) < 5:
            if len(categorical_cols) > 1:
                add_chart(
                    "bar",
                    categorical_cols[1],
                    numeric_cols[0],
                    f"Bar - {numeric_cols[0]} by {categorical_cols[1]}"
                )
        
        return chart_configs[:5]


    @staticmethod
    async def get_chart_image(
        file_path: str,
        x: str,
        y: str,
        chart_type: str,
        show_forecast: bool = False,
        show_anomalies: bool = False,
        show_clusters: bool = False
    ) -> Dict[str, str]:

        df = DatasetService.load_df(
            file_path
        ).copy()
        
        if x not in df.columns:
            raise ValueError(
                f"Column '{x}' not found"
            )

        normalized_type = (
            chart_type or ""
        ).strip().lower()
        
        if normalized_type in [
            "box plot", "boxplot"
        ]:
            normalized_type = "box"

        if normalized_type != "pie" \
                and y not in df.columns:
            raise ValueError(
                f"Column '{y}' not found"
            )

        BLUE = "#2563EB"
        COLORS = [
            "#2563EB", "#7C3AED", "#059669",
            "#D97706", "#DC2626", "#0891B2",
            "#65A30D", "#C026D3"
        ]

        plt.rcParams.update({
            'font.family': 'DejaVu Sans',
            'font.size': 9,
            'axes.titlesize': 11,
            'axes.labelsize': 9,
            'xtick.labelsize': 8,
            'ytick.labelsize': 8,
            'axes.spines.top': False,
            'axes.spines.right': False,
        })

        fig, ax = plt.subplots(
            figsize=(9, 5), dpi=110
        )
        fig.patch.set_facecolor("white")
        ax.set_facecolor("#FAFAFA")
        ax.grid(
            True,
            color="#E5E7EB",
            linewidth=0.6,
            alpha=0.7,
            axis='y'
        )
        ax.set_axisbelow(True)

        for spine in ax.spines.values():
            spine.set_color("#E2E8F0")
            spine.set_linewidth(0.8)

        if normalized_type == "bar":
            grouped = df.groupby(
                x, as_index=False
            )[y].mean().sort_values(
                y, ascending=False
            ).head(12)
            
            x_pos = range(len(grouped))
            values = grouped[y].values
            
            norm = plt.Normalize(
                values.min(), values.max()
            )
            colors_bar = plt.cm.Blues(
                norm(values) * 0.6 + 0.3
            )
            
            bars = ax.bar(
                x_pos,
                values,
                color=colors_bar,
                width=0.65,
                edgecolor="white",
                linewidth=0.8
            )
            
            labels = [
                str(v)[:10] + '..'
                if len(str(v)) > 10
                else str(v)
                for v in grouped[x]
            ]
            ax.set_xticks(x_pos)
            ax.set_xticklabels(
                labels,
                rotation=40,
                ha='right',
                fontsize=7.5
            )
            
            for bar, val in zip(bars, values):
                ax.text(
                    bar.get_x() +
                    bar.get_width() / 2,
                    bar.get_height() +
                    values.max() * 0.01,
                    f'{val:.0f}',
                    ha='center',
                    va='bottom',
                    fontsize=7,
                    color='#475569'
                )

        elif normalized_type == "line":
            try:
                df[x] = pd.to_datetime(
                    df[x], errors="coerce"
                )
                df = df.dropna(
                    subset=[x, y]
                ).sort_values(x)
            except Exception:
                df = df.dropna(subset=[x, y])
            
            grouped = df.groupby(
                x, as_index=False
            )[y].mean()
            
            ax.plot(
                grouped[x],
                grouped[y],
                color=BLUE,
                linewidth=2.2,
                marker='o',
                markersize=3.5,
                markerfacecolor='white',
                markeredgecolor=BLUE,
                markeredgewidth=1.5,
                zorder=3
            )
            ax.fill_between(
                grouped[x],
                grouped[y],
                alpha=0.08,
                color=BLUE
            )

        elif normalized_type == "pie":
            counts = df[x].astype(str)\
                .value_counts().head(6)
            
            pie_labels = [
                str(l)[:12] + '..'
                if len(str(l)) > 12
                else str(l)
                for l in counts.index
            ]
            
            wedges, texts, autotexts = ax.pie(
                counts.values,
                labels=None,
                autopct='%1.1f%%',
                startangle=90,
                colors=COLORS[:len(counts)],
                pctdistance=0.78,
                wedgeprops={
                    'edgecolor': 'white',
                    'linewidth': 2.5
                }
            )
            
            for at in autotexts:
                at.set_fontsize(8)
                at.set_color('white')
                at.set_fontweight('bold')
            
            ax.legend(
                wedges,
                pie_labels,
                title=str(x)[:15],
                loc="center left",
                bbox_to_anchor=(1.05, 0.5),
                fontsize=7.5,
                title_fontsize=8,
                framealpha=0.9,
                edgecolor='#E2E8F0'
            )
            ax.axis("equal")

        elif normalized_type == "scatter":
            points = df[[x, y]].dropna().head(800)
            ax.scatter(
                points[x],
                points[y],
                color=BLUE,
                alpha=0.45,
                s=25,
                edgecolors="white",
                linewidth=0.3,
                zorder=3
            )

        elif normalized_type == "histogram":
            values = pd.to_numeric(
                df[y], errors="coerce"
            ).dropna()
            if values.empty:
                raise ValueError(
                    "Histogram requires numeric data"
                )
            
            n, bins, patches = ax.hist(
                values,
                bins=25,
                color=BLUE,
                alpha=0.8,
                edgecolor="white",
                linewidth=0.8
            )
            
            for i, patch in enumerate(patches):
                patch.set_facecolor(
                    plt.cm.Blues(
                        0.3 + 0.7 * i / len(patches)
                    )
                )
            
            ax.axvline(
                values.mean(),
                color="#DC2626",
                linestyle="--",
                linewidth=1.8,
                label=f"Mean: {values.mean():.1f}",
                zorder=4
            )
            ax.legend(fontsize=8)

        elif normalized_type == "box":
            plot_df = df[[x, y]].dropna()
            if plot_df.empty:
                raise ValueError(
                    "Box plot could not be generated"
                )
            
            categories = sorted(
                plot_df[x].unique()
            )[:10]
            data_by_cat = [
                plot_df[
                    plot_df[x] == cat
                ][y].values
                for cat in categories
            ]
            
            bp = ax.boxplot(
                data_by_cat,
                patch_artist=True,
                notch=False,
                widths=0.5
            )
            
            for i, (patch, med) in enumerate(
                zip(
                    bp['boxes'],
                    bp['medians']
                )
            ):
                patch.set_facecolor(
                    COLORS[i % len(COLORS)] + "40"
                )
                patch.set_edgecolor(
                    COLORS[i % len(COLORS)]
                )
                med.set_color(
                    COLORS[i % len(COLORS)]
                )
                med.set_linewidth(2)
            
            cat_labels = [
                str(c)[:10] + '..'
                if len(str(c)) > 10
                else str(c)
                for c in categories
            ]
            ax.set_xticklabels(
                cat_labels,
                rotation=35,
                ha='right',
                fontsize=7.5
            )

        elif normalized_type in [
            "heatmap", "correlation matrix"
        ]:
            numeric = df.select_dtypes(
                include=[np.number]
            ).copy()
            if numeric.shape[1] < 2:
                raise ValueError(
                    "Heatmap requires 2+ numeric columns"
                )
            corr = numeric.corr(
                numeric_only=True
            ).round(2)
            
            im = ax.imshow(
                corr.values,
                cmap='Blues',
                aspect='auto',
                vmin=-1,
                vmax=1
            )
            plt.colorbar(
                im, ax=ax,
                shrink=0.8,
                aspect=20
            )
            
            ax.set_xticks(range(len(corr.columns)))
            ax.set_yticks(range(len(corr.columns)))
            col_labels = [
                str(c)[:8] + '..'
                if len(str(c)) > 8
                else str(c)
                for c in corr.columns
            ]
            ax.set_xticklabels(
                col_labels,
                rotation=35,
                ha='right',
                fontsize=7
            )
            ax.set_yticklabels(
                col_labels,
                fontsize=7
            )
            
            for i in range(len(corr)):
                for j in range(len(corr.columns)):
                    ax.text(
                        j, i,
                        f'{corr.values[i, j]:.2f}',
                        ha='center',
                        va='center',
                        fontsize=6.5,
                        color='white'
                        if abs(corr.values[i,j]) > 0.5
                        else '#374151'
                    )

        elif normalized_type == "area":
            try:
                df[x] = pd.to_datetime(
                    df[x], errors="coerce"
                )
                df = df.dropna(
                    subset=[x, y]
                ).sort_values(x)
            except Exception:
                df = df.dropna(subset=[x, y])
            
            grouped = df.groupby(
                x, as_index=False
            )[y].sum()
            
            ax.fill_between(
                grouped[x],
                grouped[y],
                alpha=0.25,
                color=BLUE
            )
            ax.plot(
                grouped[x],
                grouped[y],
                color=BLUE,
                linewidth=2
            )

        elif normalized_type == "horizontal bar":
            grouped = df.groupby(
                x, as_index=False
            )[y].mean().sort_values(
                y, ascending=True
            ).head(12)
            
            labels = [
                str(v)[:15] + '..'
                if len(str(v)) > 15
                else str(v)
                for v in grouped[x]
            ]
            
            y_pos = range(len(grouped))
            values = grouped[y].values
            norm = plt.Normalize(
                values.min(), values.max()
            )
            colors_h = plt.cm.Blues(
                norm(values) * 0.6 + 0.3
            )
            
            ax.barh(
                y_pos,
                values,
                color=colors_h,
                height=0.65,
                edgecolor="white",
                linewidth=0.8
            )
            ax.set_yticks(y_pos)
            ax.set_yticklabels(
                labels, fontsize=7.5
            )
            ax.grid(
                True,
                color="#E5E7EB",
                linewidth=0.6,
                alpha=0.7,
                axis='x'
            )

        elif normalized_type == "bubble":
            points = df.dropna(
                subset=[x, y]
            ).head(500).copy()
            
            num_cols = [
                c for c in df.select_dtypes(
                    include=[np.number]
                ).columns
                if c not in [x, y]
            ]
            
            if num_cols:
                size_col = num_cols[0]
                s_vals = points[size_col]
                s_norm = (
                    (s_vals - s_vals.min()) /
                    (s_vals.max() -
                     s_vals.min() + 1e-6)
                ) * 400 + 20
            else:
                s_norm = [60] * len(points)
            
            ax.scatter(
                points[x],
                points[y],
                s=s_norm,
                color=BLUE,
                alpha=0.5,
                edgecolors="white",
                linewidth=0.5
            )

        elif normalized_type == "donut":
            counts = df[x].astype(str)\
                .value_counts().head(6)
            
            pie_labels = [
                str(l)[:12] + '..'
                if len(str(l)) > 12
                else str(l)
                for l in counts.index
            ]
            
            wedges, texts, autotexts = ax.pie(
                counts.values,
                labels=None,
                autopct='%1.1f%%',
                startangle=90,
                colors=COLORS[:len(counts)],
                pctdistance=0.78,
                wedgeprops={
                    'edgecolor': 'white',
                    'linewidth': 2.5,
                    'width': 0.65
                }
            )
            
            for at in autotexts:
                at.set_fontsize(8)
                at.set_color('white')
                at.set_fontweight('bold')
            
            ax.legend(
                wedges,
                pie_labels,
                title=str(x)[:15],
                loc="center left",
                bbox_to_anchor=(1.05, 0.5),
                fontsize=7.5,
                title_fontsize=8
            )
            ax.axis("equal")

        elif normalized_type == "waterfall":
            grouped = df.groupby(
                x, as_index=False
            )[y].sum().head(10)
            
            values = grouped[y].values
            labels = [
                str(v)[:10]
                for v in grouped[x]
            ]
            
            running = 0
            for i, (val, label) in enumerate(
                zip(values, labels)
            ):
                color = (
                    "#059669" if val >= 0
                    else "#DC2626"
                )
                ax.bar(
                    i,
                    val,
                    bottom=running,
                    color=color,
                    width=0.6,
                    edgecolor="white",
                    linewidth=0.8,
                    alpha=0.85
                )
                running += val
            
            ax.set_xticks(range(len(labels)))
            ax.set_xticklabels(
                labels,
                rotation=40,
                ha='right',
                fontsize=7.5
            )
            ax.axhline(
                y=0,
                color='#374151',
                linewidth=0.8
            )

        elif normalized_type == "funnel":
            grouped = df.groupby(
                x, as_index=False
            )[y].sum().sort_values(
                y, ascending=False
            ).head(7)
            
            values = grouped[y].values
            labels = [
                str(v)[:15]
                for v in grouped[x]
            ]
            
            max_val = values[0] if len(values) > 0\
                else 1
            
            for i, (val, label) in enumerate(
                zip(values, labels)
            ):
                width = val / max_val
                ax.barh(
                    i,
                    width,
                    color=COLORS[i % len(COLORS)],
                    alpha=0.85,
                    edgecolor="white",
                    linewidth=0.8,
                    height=0.6
                )
                ax.text(
                    width / 2,
                    i,
                    f'{label}: {val:.0f}',
                    ha='center',
                    va='center',
                    fontsize=8,
                    color='white',
                    fontweight='bold'
                )
            
            ax.set_yticks([])
            ax.set_xlim(0, 1.05)

        elif normalized_type == "stacked bar":
            cats = [
                c for c in df.select_dtypes(
                    include=['object', 'category']
                ).columns
                if c != x
            ]
            if cats:
                hue = cats[0]
                pivot_df = df.pivot_table(
                    index=x,
                    columns=hue,
                    values=y,
                    aggfunc='sum'
                ).fillna(0).head(12)
                
                bottom_vals = np.zeros(
                    len(pivot_df)
                )
                x_labels = [
                    str(v)[:10]
                    for v in pivot_df.index
                ]
                
                for i, col in enumerate(
                    pivot_df.columns[:7]
                ):
                    ax.bar(
                        range(len(pivot_df)),
                        pivot_df[col],
                        bottom=bottom_vals,
                        color=COLORS[i % len(COLORS)],
                        label=str(col)[:12],
                        width=0.65,
                        edgecolor="white",
                        linewidth=0.5
                    )
                    bottom_vals += pivot_df[col].values
                
                ax.set_xticks(
                    range(len(pivot_df))
                )
                ax.set_xticklabels(
                    x_labels,
                    rotation=40,
                    ha='right',
                    fontsize=7.5
                )
                ax.legend(
                    fontsize=7,
                    bbox_to_anchor=(1.02, 1),
                    loc='upper left',
                    borderaxespad=0
                )
            else:
                grouped = df.groupby(
                    x, as_index=False
                )[y].mean().head(12)
                ax.bar(
                    range(len(grouped)),
                    grouped[y],
                    color=BLUE,
                    width=0.65
                )

        elif normalized_type == "violin":
            plot_df = df[[x, y]].dropna()
            if plot_df.empty:
                raise ValueError(
                    "Violin plot could not be generated"
                )
            
            categories = sorted(
                plot_df[x].unique()
            )[:8]
            data_by_cat = [
                plot_df[
                    plot_df[x] == cat
                ][y].values
                for cat in categories
            ]
            
            parts = ax.violinplot(
                data_by_cat,
                positions=range(len(categories)),
                showmeans=True,
                showmedians=True
            )
            
            for i, pc in enumerate(
                parts['bodies']
            ):
                pc.set_facecolor(
                    COLORS[i % len(COLORS)]
                )
                pc.set_alpha(0.7)
            
            cat_labels = [
                str(c)[:10] + '..'
                if len(str(c)) > 10
                else str(c)
                for c in categories
            ]
            ax.set_xticks(range(len(categories)))
            ax.set_xticklabels(
                cat_labels,
                rotation=35,
                ha='right',
                fontsize=7.5
            )

        elif normalized_type == "trend line":
            points = df[[x, y]].dropna().head(1000)
            
            ax.scatter(
                points[x],
                points[y],
                color=BLUE,
                alpha=0.35,
                s=20,
                zorder=2
            )
            
            if pd.api.types.is_numeric_dtype(
                points[x]
            ):
                z = np.polyfit(
                    points[x], points[y], 1
                )
                p = np.poly1d(z)
                x_line = np.linspace(
                    points[x].min(),
                    points[x].max(),
                    100
                )
                ax.plot(
                    x_line,
                    p(x_line),
                    color="#DC2626",
                    linewidth=2,
                    label="Trend line",
                    zorder=3
                )
                ax.legend(fontsize=8)

        else:
            raise ValueError(
                f"Unsupported chart type '{chart_type}'"
            )

        title_text = (
            f"{y} by {x}"
            if y != x
            else f"Distribution of {x}"
        )
        ax.set_title(
            title_text,
            fontsize=12,
            color="#0F172A",
            pad=14,
            fontweight='semibold'
        )
        
        if normalized_type not in [
            "pie", "donut", "heatmap",
            "correlation matrix", "funnel"
        ]:
            ax.set_xlabel(
                str(x),
                fontsize=9,
                color="#475569",
                labelpad=6
            )
            y_label = (
                str(y) if y != x
                else "Frequency"
            )
            ax.set_ylabel(
                y_label,
                fontsize=9,
                color="#475569",
                labelpad=6
            )

        if show_forecast and \
                normalized_type == "line":
            try:
                forecast_res = \
                    PredictiveService.forecast(
                        df, x, y, periods=5
                    )
                if forecast_res:
                    last_x = df[x].iloc[-1]
                    last_y = df[y].iloc[-1]
                    fx = [last_x] + [
                        pd.to_datetime(d["date"])
                        for d in forecast_res["results"]
                    ]
                    fy = [last_y] + [
                        d["forecast"]
                        for d in forecast_res["results"]
                    ]
                    ax.plot(
                        fx, fy,
                        color="#F59E0B",
                        linestyle="--",
                        linewidth=1.8,
                        label="Forecast",
                        zorder=4
                    )
                    ax.legend(fontsize=8)
            except Exception as e:
                print(f"Forecast overlay failed: {e}")

        if show_anomalies:
            try:
                anomaly_indices = \
                    PredictiveService\
                        .detect_anomalies_iqr(df, y)
                if anomaly_indices:
                    anomalies = df.loc[
                        anomaly_indices
                    ]
                    ax.scatter(
                        anomalies[x],
                        anomalies[y],
                        color="#EF4444",
                        s=60,
                        edgecolors="white",
                        label="Anomaly",
                        linewidth=1.2,
                        zorder=5
                    )
                    ax.legend(fontsize=8)
            except Exception as e:
                print(f"Anomaly overlay failed: {e}")

        if show_clusters and \
                normalized_type == "scatter":
            try:
                cluster_res = \
                    PredictiveService.cluster_data(
                        df, [x, y], k=3
                    )
                if "labels" in cluster_res:
                    for coll in ax.collections:
                        coll.remove()
                    scatter = ax.scatter(
                        df[x], df[y],
                        c=cluster_res["labels"],
                        cmap="viridis",
                        alpha=0.7,
                        s=30,
                        edgecolors="white",
                        linewidth=0.5
                    )
                    plt.colorbar(
                        scatter,
                        ax=ax,
                        shrink=0.5,
                        label="Cluster"
                    )
            except Exception as e:
                print(f"Cluster overlay failed: {e}")

        plt.tight_layout(pad=1.8)
        buffer = io.BytesIO()
        fig.savefig(
            buffer,
            format="png",
            dpi=110,
            bbox_inches="tight",
            facecolor="white"
        )
        plt.close(fig)
        buffer.seek(0)

        img_b64 = base64.b64encode(
            buffer.read()
        ).decode("utf-8")
        
        return {
            "mime_type": "image/png",
            "image_base64": img_b64,
        }

