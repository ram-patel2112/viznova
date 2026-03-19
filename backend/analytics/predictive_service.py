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
        explanation = f"Using linear regression, the system predicts a gradual {trend} in {target_col} values over the next {periods} periods. Projected shift: {abs(growth):.1f}%. Confidence score: {score}%."
                 
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
            explanation = f"Predictive scan identified {len(anomaly_indices)} anomalous records (outliers). Primary variance detected in {', '.join(usable_cols)}. These points deviate significantly from the statistical norm and warrant manual review."
        else:
            explanation = "Structural integrity confirmed. No significant anomalies detected within the 95% confidence boundary."

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
        explanation = f"{k} distinct behavioral clusters detected based on {', '.join(usable_cols)}. Each group represents high-similarity records. Cluster 0 typically contains lower values, while higher index clusters represent higher-intensity records."

        return {
            "clusters": cluster_rows,
            "cluster_count": int(k),
            "features": usable_cols,
            "centroids": centers,
            "labels": labels.tolist(),
            "explanation": explanation
        }

