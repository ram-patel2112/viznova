import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from typing import List, Dict, Any

class PredictiveService:
    @staticmethod
    @staticmethod
    def forecast(df: pd.DataFrame, time_col: str, target_col: str, periods: int = 5) -> Dict[str, Any]:
        # Ensure target is numeric
        df = df.copy()
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        df = df.dropna(subset=[target_col])
        
        if df.empty:
            return {"results": [], "explanation": "Insufficient numeric data for forecasting."}

        # Prepare X (time as index)
        X = np.arange(len(df)).reshape(-1, 1)
        y = df[target_col].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict future
        future_X = np.arange(len(df), len(df) + periods).reshape(-1, 1)
        future_y = model.predict(future_X)
        
        forecast_results = []
        try:
             # Try to handle dates if possible
             last_date = pd.to_datetime(df[time_col].iloc[-1])
             for i, val in enumerate(future_y):
                 new_date = last_date + pd.DateOffset(days=i+1)
                 forecast_results.append({
                     "date": new_date.isoformat(),
                     "forecast": float(val)
                 })
        except:
            for i, val in enumerate(future_y):
                 forecast_results.append({
                     "date": f"T+{i+1}",
                     "forecast": float(val)
                 })
        
        # Section 8 Narrative for Forecast
        trend = "upward" if future_y[-1] > y[-1] else "downward"
        growth = ((future_y[-1] - y[-1]) / y[-1] * 100) if y[-1] != 0 else 0
        score = int(model.score(X, y) * 100) if len(X) > 1 else 50
        trend_word = "upward" if trend == "upward" else "downward"
        growth_word = "growth" if trend == "upward" else "decline"
        explanation = (
            f"Forecast Analysis Results\n\n"
            f"Using linear regression on {target_col} "
            f"over {len(df)} data points, the model "
            f"predicts a {trend_word} trend over the "
            f"next {periods} periods.\n\n"
            f"Key Findings:\n"
            f"- Current average: {y.mean():.2f}\n"
            f"- Predicted {growth_word}: {abs(growth):.1f}%\n"
            f"- Starting value: {float(y[-1]):.2f}\n"
            f"- Projected end value: {float(future_y[-1]):.2f}\n"
            f"- Model confidence score: {score}%\n\n"
            f"Interpretation: The {target_col} data "
            f"shows a consistent {trend_word} pattern. "
            f"{'This suggests positive momentum in the dataset.' if trend == 'upward' else 'This suggests a declining pattern that may require attention.'} "
            f"The forecast is based on historical "
            f"linear trends and assumes similar "
            f"conditions going forward."
        )
                 
        return {"results": forecast_results, "explanation": explanation}

    @staticmethod
    def detect_anomalies_iqr(df: pd.DataFrame, col: str) -> List[int]:
        if col not in df.columns:
            return []
        
        series = pd.to_numeric(df[col], errors='coerce').dropna()
        if series.empty:
            return []
            
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        anomalies = series[(series < lower_bound) | (series > upper_bound)]
        return anomalies.index.tolist()

    @staticmethod
    def detect_anomalies(df: pd.DataFrame, target_cols: List[str]) -> Dict[str, Any]:
        usable_cols = [col for col in target_cols if col in df.columns]
        if not usable_cols:
            return {"indices": [], "explanation": "No valid columns for anomaly detection."}

        numeric_df = df[usable_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
        if numeric_df.empty:
            return {"indices": [], "explanation": "No numeric data found for scanning."}
            
        model = IsolationForest(contamination=0.05, random_state=42)
        preds = model.fit_predict(numeric_df)
        anomaly_indices = np.where(preds == -1)[0].tolist()
        
        # Section 8 Narrative for Anomaly
        if anomaly_indices:
            pct = (
                len(anomaly_indices) / len(numeric_df)
            ) * 100
            shown = str(anomaly_indices[:5])
            more = (
                '...' if len(anomaly_indices) > 5 else ''
            )
            explanation = (
                f"Anomaly Detection Results\n\n"
                f"Using Isolation Forest algorithm, "
                f"the system scanned {len(numeric_df)} "
                f"records across {len(usable_cols)} "
                f"columns: {', '.join(usable_cols)}.\n\n"
                f"Key Findings:\n"
                f"- Total anomalies detected: "
                f"{len(anomaly_indices)}\n"
                f"- Anomaly rate: {pct:.1f}% of dataset\n"
                f"- Affected columns: "
                f"{', '.join(usable_cols)}\n"
                f"- Sample anomaly indices: "
                f"{shown}{more}\n\n"
                f"Interpretation: These "
                f"{len(anomaly_indices)} data points "
                f"deviate significantly from the normal "
                f"statistical distribution. Possible "
                f"causes include data entry errors, "
                f"genuine outliers, system recording "
                f"issues, or unusual real-world events. "
                f"Manual review of flagged records is "
                f"recommended to determine if they "
                f"represent valid data or errors that "
                f"need correction."
            )
        else:
            explanation = (
                f"Anomaly Detection Results\n\n"
                f"Using Isolation Forest algorithm, "
                f"the system scanned {len(numeric_df)} "
                f"records across {len(usable_cols)} "
                f"columns: {', '.join(usable_cols)}.\n\n"
                f"Key Findings:\n"
                f"- Total anomalies detected: 0\n"
                f"- Anomaly rate: 0% of dataset\n"
                f"- All records within normal range\n\n"
                f"Interpretation: No significant "
                f"anomalies detected. All data points "
                f"fall within the 95% confidence "
                f"boundary. The dataset appears clean "
                f"and consistent with no unusual "
                f"patterns requiring attention."
            )

        return {"indices": anomaly_indices, "explanation": explanation}

    @staticmethod
    def cluster_data(df: pd.DataFrame, target_cols: List[str], k: int = 3) -> Dict[str, Any]:
        usable_cols = [col for col in target_cols if col in df.columns]
        if not usable_cols:
            return {"clusters": [], "cluster_count": 0, "explanation": "Insufficient data for clustering."}

        numeric_df = df[usable_cols].apply(pd.to_numeric, errors='coerce').dropna()
        if numeric_df.empty or len(numeric_df) < k:
            return {"clusters": [], "cluster_count": 0, "explanation": "Insufficient data points for clustering."}

        k = max(2, min(int(k), len(numeric_df)))
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(numeric_df)

        cluster_rows = []
        for i, (idx, row) in enumerate(numeric_df.iterrows()):
            point = {"index": int(idx), "cluster": int(labels[i])}
            for col in usable_cols:
                point[col] = float(row[col])
            cluster_rows.append(point)

        centers = []
        for i, center in enumerate(model.cluster_centers_):
            center_obj = {"cluster": int(i)}
            for j, col in enumerate(usable_cols):
                center_obj[col] = float(center[j])
            centers.append(center_obj)

        # Section 8 Narrative for Clustering
        cluster_sizes = {}
        for label in labels:
            cluster_sizes[int(label)] = (
                cluster_sizes.get(int(label), 0) + 1
            )

        size_desc = "\n".join([
            f"  - Cluster {k}: {v} records"
            for k, v in sorted(cluster_sizes.items())
        ])

        center_desc = "\n".join([
            f"  - Cluster {i}: "
            + ", ".join([
                f"{col}={center[j]:.2f}"
                for j, col in enumerate(usable_cols)
            ])
            for i, center in enumerate(
                model.cluster_centers_
            )
        ])

        explanation = (
            f"Clustering Analysis Results\n\n"
            f"Using K-Means algorithm with k={k} "
            f"clusters, the system analyzed "
            f"{len(numeric_df)} records based on "
            f"{len(usable_cols)} features: "
            f"{', '.join(usable_cols)}.\n\n"
            f"Cluster Distribution:\n"
            f"{size_desc}\n\n"
            f"Cluster Centers:\n"
            f"{center_desc}\n\n"
            f"Interpretation: The data has been "
            f"divided into {k} distinct behavioral "
            f"groups based on feature similarity. "
            f"Records within the same cluster share "
            f"similar characteristics across the "
            f"analyzed columns. This segmentation "
            f"can help identify patterns and groups "
            f"within your dataset."
        )

        return {
            "clusters": cluster_rows,
            "cluster_count": int(k),
            "features": usable_cols,
            "centroids": centers,
            "labels": labels.tolist(),
            "explanation": explanation
        }

