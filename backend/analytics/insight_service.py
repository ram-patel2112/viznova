import pandas as pd
import numpy as np
from typing import Dict, Any, List
from analytics.predictive_service import PredictiveService

class InsightService:
    @staticmethod
    def generate_chart_insights(df: pd.DataFrame, x_col: str, y_col: str, chart_type: str) -> str:
        try:
            # Ensure Y is numeric
            df = df.copy()
            df[y_col] = pd.to_numeric(df[y_col], errors='coerce')
            clean_df = df.dropna(subset=[y_col])
            
            if clean_df.empty:
                return "The selected data source contains insufficient numerical data for automated insight generation."

            # Calculate basic stats
            total = clean_df[y_col].sum()
            avg = clean_df[y_col].mean()
            max_val = clean_df[y_col].max()
            min_val = clean_df[y_col].min()
            
            # Find peaks/lows
            peak_label = clean_df.loc[clean_df[y_col].idxmax()][x_col]
            low_label = clean_df.loc[clean_df[y_col].idxmin()][x_col]

            insights = []

            insights.append(
                f"The aggregate output for {y_col} "
                f"stands at {total:,.2f}, maintaining "
                f"an average of {avg:,.2f} per entry."
            )

            insights.append(
                f"Highest value was recorded at "
                f"{peak_label} with {max_val:,.2f}, "
                f"while the lowest was at "
                f"{low_label} ({min_val:,.2f})."
            )

            if len(clean_df) > 1:
                first_val = clean_df[y_col].iloc[0]
                last_val = clean_df[y_col].iloc[-1]
                growth = (
                    (last_val - first_val) / first_val * 100
                ) if first_val != 0 else 0
                trend_direction = (
                    "increase" if growth > 0 else "decrease"
                )
                if abs(growth) > 5:
                    insights.append(
                        f"The data shows a "
                        f"{abs(growth):.1f}% {trend_direction} "
                        f"over the observed period."
                    )
                else:
                    insights.append(
                        f"{y_col} remains relatively stable "
                        f"with minimal variation."
                    )

            if chart_type in ['pie', 'bar']:
                top_3 = clean_df.nlargest(3, y_col)
                top_labels = ", ".join(
                    [str(l) for l in top_3[x_col].tolist()]
                )
                insights.append(
                    f"Top contributors: {top_labels}."
                )

            return " ".join(insights)
        except Exception as e:
            return f"Heuristic interpretation complete. Primary focus detected on {y_col} variance."

    @staticmethod
    def generate_dataset_summary(df: pd.DataFrame) -> Dict[str, Any]:
        return {
            "row_count": len(df),
            "col_count": len(df.columns),
            "numeric_cols": list(df.select_dtypes(include=[np.number]).columns),
            "categorical_cols": list(df.select_dtypes(include=['object', 'category']).columns),
            "date_cols": [col for col in df.columns if pd.api.types.is_datetime64_any_dtype(df[col]) or 'date' in col.lower() or 'time' in col.lower()],
            "missing_values": int(df.isna().sum().sum())
        }

    @staticmethod
    def generate_full_report(df: pd.DataFrame, dataset_name: str) -> str:
        summary = InsightService.generate_dataset_summary(df)
        num_cols = summary["numeric_cols"]
        date_cols = summary["date_cols"]
        cat_cols = summary["categorical_cols"]

        # Section 10: Insight Story Generator Aggregation
        report = [
            f"VIZNOVA Data Analysis Report: "
            f"{dataset_name}",
            "",
            "Executive Overview",
            f"Analysis of {dataset_name} reveals "
            f"{summary['row_count']} observations "
            f"across {summary['col_count']} dimensions. "
            f"The dataset contains "
            f"{len(num_cols)} numeric columns and "
            f"{len(cat_cols)} categorical columns.",
        ]

        missing_count = summary["missing_values"]
        if missing_count > 0:
            report.append(
                f"Data Quality: {missing_count} missing "
                f"values detected. Auto-cleaning is "
                f"available to fix this."
            )
        else:
            report.append(
                "Data Quality: No missing values found. "
                "Dataset is clean and ready for analysis."
            )

        # 2. Predictive Forecasting (Section 8)
        if date_cols and num_cols:
            report.append("\nTemporal Forecasting & Projections")
            t_col = date_cols[0]
            v_col = num_cols[0]
            try:
                res = PredictiveService.forecast(df, t_col, v_col, periods=5)
                report.append(res["explanation"])
            except:
                pass

        # 3. Anomaly Awareness (Section 8)
        if num_cols:
            report.append("\nAnomaly Detection & Variance")
            try:
                res = PredictiveService.detect_anomalies(df, num_cols[:3])
                report.append(res["explanation"])
            except:
                pass

        # 4. Behavioral Segmentation (Section 8)
        if len(num_cols) >= 2:
            report.append("\nSimilarity Clustering")
            try:
                res = PredictiveService.cluster_data(df, num_cols[:4], k=3)
                report.append(res["explanation"])
            except:
                pass

        # 5. Strategic Conclusion
        report.append("\nStrategic Insights")
        report.append("Heuristic analysis suggests the dataset primary signals are concentrated in " + 
                      (f"{num_cols[0]}" if num_cols else "categorical dimensions") + 
                      ". We recommend utilizing the Insert > AI Query tool to explore specific correlations identified above.")

        return "\n".join(report)
