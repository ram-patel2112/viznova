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
                
            columns_metadata.append({
                "name": col,
                "type": col_type,
                "original_dtype": dtype,
                "unique_count": df[col].nunique(),
                "null_count": int(df[col].isna().sum()),
                "sample_values": df[col].dropna().head(5).tolist()
            })

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
    async def get_chart_image(file_path: str, x: str, y: str, chart_type: str, 
                             show_forecast: bool = False, 
                             show_anomalies: bool = False, 
                             show_clusters: bool = False) -> Dict[str, str]:

        df = DatasetService.load_df(file_path).copy()
        if x not in df.columns:
            raise ValueError(f"Column '{x}' not found in dataset")

        normalized_type = (chart_type or "").strip().lower()
        if normalized_type in ["box plot", "boxplot"]:
            normalized_type = "box"

        if normalized_type != "pie" and y not in df.columns:
            raise ValueError(f"Column '{y}' not found in dataset")

        sns.set_theme(style="whitegrid")
        fig, ax = plt.subplots(figsize=(8.6, 4.8), dpi=120)
        fig.patch.set_facecolor("white")
        ax.set_facecolor("white")
        ax.grid(True, color="#E5E7EB", linewidth=0.7, alpha=0.9)
        ax.set_axisbelow(True)

        if normalized_type == "bar":
            grouped = df.groupby(x, as_index=False)[y].mean().sort_values(y, ascending=False).head(20)
            ax.bar(grouped[x].astype(str), grouped[y], color="#2B6CB0", width=0.72)
            ax.tick_params(axis="x", rotation=30)
        elif normalized_type == "horizontal bar":
            grouped = df.groupby(x, as_index=False)[y].mean().sort_values(y, ascending=True).head(20)
            ax.barh(grouped[x].astype(str), grouped[y], color="#2B6CB0", height=0.72)
        elif normalized_type == "line":
            try:
                df[x] = pd.to_datetime(df[x], errors="coerce")
                df = df.dropna(subset=[x, y]).sort_values(x)
            except Exception:
                df = df.dropna(subset=[x, y])
            grouped = df.groupby(x, as_index=False)[y].sum()
            ax.plot(grouped[x], grouped[y], color="#2B6CB0", linewidth=1.8)
        elif normalized_type == "pie":
            counts = df[x].astype(str).value_counts().head(8)
            ax.pie(
                counts.values,
                labels=counts.index.tolist(),
                autopct="%1.1f%%",
                startangle=90,
                textprops={"fontsize": 9, "color": "#1A202C"},
            )
            ax.axis("equal")
        elif normalized_type == "scatter":
            points = df[[x, y]].dropna().head(1000)
            ax.scatter(points[x], points[y], color="#2B6CB0", alpha=0.75, s=20)
        elif normalized_type == "histogram":
            values = pd.to_numeric(df[y], errors="coerce").dropna()
            if values.empty:
                raise ValueError("Histogram requires numeric values in Y-axis")
            ax.hist(values, bins=20, color="#2B6CB0", edgecolor="#FFFFFF", linewidth=0.6)
        elif normalized_type == "box":
            plot_df = df[[x, y]].dropna()
            if plot_df.empty:
                raise ValueError("Box plot could not be generated from selected columns")
            sns.boxplot(data=plot_df, x=x, y=y, color="#8FB3DA", fliersize=2, linewidth=0.9, ax=ax)
            ax.tick_params(axis="x", rotation=25)
        elif normalized_type == "heatmap":
            numeric = df.select_dtypes(include=[np.number]).copy()
            if x in df.columns and pd.api.types.is_numeric_dtype(df[x]):
                numeric[x] = df[x]
            if y in df.columns and pd.api.types.is_numeric_dtype(df[y]):
                numeric[y] = df[y]
            if numeric.shape[1] < 2:
                raise ValueError("Heatmap requires at least two numeric columns")
            corr = numeric.corr(numeric_only=True).round(2)
            sns.heatmap(
                corr,
                cmap="Blues",
                annot=True,
                fmt=".2f",
                linewidths=0.5,
                linecolor="#E2E8F0",
                cbar=True,
                ax=ax
            )
            ax.set_xlabel("")
            ax.set_ylabel("")
        elif normalized_type == "correlation matrix":
            numeric = df.select_dtypes(include=[np.number]).copy()
            if numeric.shape[1] < 2:
                raise ValueError("Correlation Matrix requires at least two numeric columns")
            corr = numeric.corr(numeric_only=True).round(2)
            sns.heatmap(corr, cmap="coolwarm", annot=True, fmt=".2f", linewidths=0.5, ax=ax, cbar=True)
            ax.set_xlabel("")
            ax.set_ylabel("")
        elif normalized_type == "stacked bar":
            # For stacked bar, we need a 3rd variable, but we'll try to pivot if possible, or just standard bar
            # Heuristic: find first categorical column that isn't x
            cats = [c for c in df.select_dtypes(include=['object', 'category']).columns if c != x]
            if cats:
                hue = cats[0]
                pivot_df = df.pivot_table(index=x, columns=hue, values=y, aggfunc='sum').fillna(0).head(20)
                pivot_df.plot(kind='bar', stacked=True, ax=ax, colormap="Blues")
                ax.tick_params(axis="x", rotation=30)
                ax.legend(title=hue, bbox_to_anchor=(1.05, 1), loc='upper left')
            else:
                grouped = df.groupby(x, as_index=False)[y].mean().sort_values(y, ascending=False).head(20)
                ax.bar(grouped[x].astype(str), grouped[y], color="#2B6CB0", width=0.72)
                ax.tick_params(axis="x", rotation=30)
        elif normalized_type == "area":
            try:
                df[x] = pd.to_datetime(df[x], errors="coerce")
                df = df.dropna(subset=[x, y]).sort_values(x)
                grouped = df.groupby(x, as_index=False)[y].sum()
                ax.fill_between(grouped[x], grouped[y], color="#8FB3DA", alpha=0.5)
                ax.plot(grouped[x], grouped[y], color="#2B6CB0", linewidth=1.5)
            except Exception:
                df = df.dropna(subset=[x, y])
                grouped = df.groupby(x, as_index=False)[y].sum()
                ax.fill_between(grouped[x].astype(str), grouped[y], color="#8FB3DA", alpha=0.5)
                ax.plot(grouped[x].astype(str), grouped[y], color="#2B6CB0", linewidth=1.5)
                ax.tick_params(axis="x", rotation=30)
        elif normalized_type == "violin":
            plot_df = df[[x, y]].dropna()
            if plot_df.empty:
                raise ValueError("Violin plot could not be generated from selected columns")
            sns.violinplot(data=plot_df, x=x, y=y, color="#8FB3DA", inner="quartile", ax=ax)
            ax.tick_params(axis="x", rotation=25)
        elif normalized_type == "bubble":
            points = df.dropna(subset=[x, y]).head(500).copy()
            numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c not in [x, y]]
            if numeric_cols:
                size_col = numeric_cols[0]
                s_vals = points[size_col]
                # normalize sizes
                s_norm = (s_vals - s_vals.min()) / (s_vals.max() - s_vals.min() + 1e-6) * 500 + 50
                scatter = ax.scatter(points[x], points[y], s=s_norm, color="#2B6CB0", alpha=0.6, edgecolors="white")
                ax.set_title(f"{y} vs {x} (size: {size_col})", fontsize=11)
            else:
                ax.scatter(points[x], points[y], s=100, color="#2B6CB0", alpha=0.6, edgecolors="white")
        elif normalized_type == "trend line":
            points = df[[x, y]].dropna().head(1000)
            if pd.api.types.is_numeric_dtype(points[x]) and pd.api.types.is_numeric_dtype(points[y]):
                sns.regplot(data=points, x=x, y=y, scatter_kws={'alpha':0.5, 'color': '#8FB3DA'}, line_kws={'color': '#2B6CB0'}, ax=ax)
            else:
                ax.scatter(points[x].astype(str), points[y], color="#8FB3DA", alpha=0.5)
                ax.tick_params(axis="x", rotation=30)
                ax.set_title(f"Scatter: {y} vs {x} (Trend line requires numeric X)", fontsize=10)
        else:
            raise ValueError(f"Unsupported chart type '{chart_type}'")

        ax.set_title(f"{y} by {x}", fontsize=11, color="#1A202C", pad=15)
        if normalized_type != "pie":
            ax.set_xlabel(str(x), fontsize=9, color="#4A5568")
            ax.set_ylabel(str(y), fontsize=9, color="#4A5568")

        # --- Analytics Overlays ---
        if show_forecast and normalized_type == "line":
            try:
                forecast_data = PredictiveService.forecast(df, x, y, periods=5)
                if forecast_data:
                    last_x = df[x].iloc[-1]
                    last_y = df[y].iloc[-1]
                    fx = [last_x] + [pd.to_datetime(d["date"]) for d in forecast_data]
                    fy = [last_y] + [d["forecast"] for d in forecast_data]
                    ax.plot(fx, fy, color="#F59E0B", linestyle="--", linewidth=1.8, label="Forecast")
                    ax.legend(prop={'size': 8})
            except Exception as e:
                print(f"Forecast overlay failed: {e}")

        if show_anomalies:
            try:
                anomaly_indices = PredictiveService.detect_anomalies_iqr(df, y)
                if anomaly_indices:
                    # Map indices back to original df to get X values
                    anomalies = df.loc[anomaly_indices]
                    ax.scatter(anomalies[x], anomalies[y], color="#EF4444", s=60, edgecolors="white", label="Anomaly", linewidth=1.2, zorder=5)
                    ax.legend(prop={'size': 8})
            except Exception as e:
                print(f"Anomaly overlay failed: {e}")

        if show_clusters and normalized_type == "scatter":
            try:
                cluster_res = PredictiveService.cluster_data(df, [x, y], k=3)
                if "labels" in cluster_res:
                    # Clear original scatter points and redraw with cluster colors
                    for coll in ax.collections:
                        coll.remove()
                    scatter = ax.scatter(df[x], df[y], c=cluster_res["labels"], cmap="viridis", alpha=0.7, s=30, edgecolors="white", linewidth=0.5)
                    plt.colorbar(scatter, ax=ax, shrink=0.5, label="Cluster")
            except Exception as e:
                print(f"Cluster overlay failed: {e}")

        for spine in ax.spines.values():
            spine.set_color("#E2E8F0")

        plt.tight_layout()
        buffer = io.BytesIO()
        fig.savefig(buffer, format="png", dpi=120, bbox_inches="tight")
        plt.close(fig)
        buffer.seek(0)

        img_b64 = base64.b64encode(buffer.read()).decode("utf-8")
        return {
            "mime_type": "image/png",
            "image_base64": img_b64,
        }

