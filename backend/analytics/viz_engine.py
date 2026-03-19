from typing import List, Dict, Any

class VisualizationEngine:
    @staticmethod
    def suggest_visualizations(columns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        suggestions = []
        
        categorical_cols = [c["name"] for c in columns if c["type"] == "categorical"]
        numeric_cols = [c["name"] for c in columns if c["type"] == "numeric"]
        date_cols = [c["name"] for c in columns if c["type"] == "date"]

        # 1. Bar charts: Categorical vs Numeric
        for cat in categorical_cols:
            for num in numeric_cols:
                suggestions.append({
                    "title": f"Average {num} by {cat}",
                    "type": "bar",
                    "x": cat,
                    "y": num
                })
                # 2. Horizontal Bar
                suggestions.append({
                    "title": f"Ranking of {num} by {cat}",
                    "type": "bar",
                    "x": cat,
                    "y": num
                })

        # 3. Line charts: Time-series
        for date_col in date_cols:
            for num in numeric_cols:
                suggestions.append({
                    "title": f"{num} Trend over {date_col}",
                    "type": "line",
                    "x": date_col,
                    "y": num
                })
                # 4. Area Chart
                suggestions.append({
                    "title": f"Cumulative {num} Flow",
                    "type": "area",
                    "x": date_col,
                    "y": num
                })

        # 5. Pie charts: Distribution
        for cat in categorical_cols:
            suggestions.append({
                "title": f"{cat} Composition",
                "type": "pie",
                "x": cat,
                "y": "count"
            })

        # 6. Scatter Charts: Relationships
        if len(numeric_cols) >= 2:
            suggestions.append({
                "title": f"Correlation: {numeric_cols[0]} vs {numeric_cols[1]}",
                "type": "scatter",
                "x": numeric_cols[0],
                "y": numeric_cols[1]
            })
            # 7. Scatter with Trendline
            suggestions.append({
                "title": f"Regression Analysis: {numeric_cols[0]} & {numeric_cols[1]}",
                "type": "scatterTrend",
                "x": numeric_cols[0],
                "y": numeric_cols[1]
            })

        # 8. Radar Chart (Multiple Numerics)
        if len(numeric_cols) >= 3 and categorical_cols:
            suggestions.append({
                "title": "Multivariate Analysis",
                "type": "radar",
                "x": categorical_cols[0],
                "y": numeric_cols[:5] # Take up to 5 metrics
            })

        # 9. Treemap (Hierarchical)
        if len(categorical_cols) >= 1 and numeric_cols:
             suggestions.append({
                "title": f"{categorical_cols[0]} Size Distribution",
                "type": "treemap",
                "x": categorical_cols[0],
                "y": numeric_cols[0]
            })

        # 10. Funnel Chart (If keywords match or sequence detected, fallback to simple cat)
        if categorical_cols and numeric_cols:
            suggestions.append({
                "title": "Conversion Funnel",
                "type": "funnel",
                "x": categorical_cols[0],
                "y": numeric_cols[0]
            })

        # 11. Box Plot
        for num in numeric_cols:
            suggestions.append({
                "title": f"{num} Statistical Distribution",
                "type": "boxplot",
                "x": "all",
                "y": num
            })

        # 12. Heatmap (Correlation or Matrix)
        if len(numeric_cols) >= 3:
             suggestions.append({
                "title": "Heatmap: Metric Correlation Matrix",
                "type": "heatmap",
                "x": numeric_cols[0],
                "y": numeric_cols[1:5]
            })

        # 13. Gauge
        if numeric_cols:
            suggestions.append({
                "title": f"{numeric_cols[0]} Performance Threshold",
                "type": "gauge",
                "x": "all",
                "y": numeric_cols[0]
            })

        return suggestions
