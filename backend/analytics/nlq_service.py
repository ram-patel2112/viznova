import re
import difflib
from typing import Dict, Any, List

class NLQService:
    @staticmethod
    def parse_query(
        query: str, 
        columns: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        q = query.lower().strip()

        chart_keywords = {
            "line":      ["trend", "over time", "history",
                          "timeline", "progression", "growth",
                          "across year", "by year", "by month",
                          "by date", "over year"],
            "bar":       ["compare", "comparison", "ranking",
                          "difference", "versus", "vs",
                          "by category", "show", "display",
                          "average", "mean", "total by",
                          "sum by", "count by"],
            "pie":       ["proportion", "ratio", "breakdown",
                          "percentage", "contribution",
                          "segment", "composition", "share",
                          "distribution of"],
            "scatter":   ["relation", "correlation", "between",
                          "scatter", "mapping", "versus",
                          "relationship"],
            "histogram": ["histogram", "frequency", "range",
                          "bins", "spread of", "distribution of"],
            "box":       ["variance", "spread", "outliers",
                          "statistical", "quartiles", "box plot",
                          "box"],
            "heatmap":   ["heatmap", "matrix",
                          "correlation matrix", "density"],
            "area":      ["volume", "cumulative", "fill",
                          "area", "stacked"],
        }

        selected_type = "bar"
        for chart, kws in chart_keywords.items():
            if any(k in q for k in kws):
                selected_type = chart
                break

        col_names = [c["name"].lower() for c in columns]
        words = re.findall(r'\w+', q)

        found_columns = []
        for col in columns:
            if col["name"].lower() in q:
                found_columns.append(col)

        if len(found_columns) < 2:
            for word in words:
                if len(word) < 3:
                    continue
                matches = difflib.get_close_matches(
                    word, col_names, n=1, cutoff=0.70
                )
                if matches:
                    col_obj = next(
                        c for c in columns
                        if c["name"].lower() == matches[0]
                    )
                    if col_obj not in found_columns:
                        found_columns.append(col_obj)

        numerics = [
            c for c in found_columns 
            if c.get("type") == "numeric"
        ]
        dates = [
            c for c in found_columns 
            if c.get("type") == "date"
        ]
        categoricals = [
            c for c in found_columns 
            if c.get("type") == "categorical"
        ]

        all_numerics = [
            c for c in columns 
            if c.get("type") == "numeric"
        ]
        all_categoricals = [
            c for c in columns 
            if c.get("type") == "categorical"
        ]
        all_dates = [
            c for c in columns 
            if c.get("type") == "date"
        ]

        x_axis = None
        y_axis = None

        explicit_chart = any(
            k in q for k in [
                "line chart", "bar chart", "pie chart",
                "scatter plot", "histogram", "area chart",
                "heatmap", "box plot"
            ]
        )

        if dates and numerics:
            selected_type = "line"
            x_axis = dates[0]["name"]
            y_axis = numerics[0]["name"]
        elif categoricals and numerics:
            if selected_type not in [
                "pie", "scatter", "histogram",
                "box", "heatmap", "area"
            ]:
                selected_type = "bar"
            x_axis = categoricals[0]["name"]
            y_axis = numerics[0]["name"]
        elif len(numerics) >= 2:
            if selected_type not in [
                "scatter", "line", "area", "heatmap"
            ]:
                selected_type = "scatter"
            x_axis = numerics[0]["name"]
            y_axis = numerics[1]["name"]
        elif len(numerics) == 1:
            selected_type = "histogram"
            x_axis = numerics[0]["name"]
            y_axis = numerics[0]["name"]
        elif len(categoricals) == 1:
            selected_type = "pie"
            x_axis = categoricals[0]["name"]
            y_axis = "count"
        else:
            if all_dates and all_numerics:
                selected_type = "line"
                x_axis = all_dates[0]["name"]
                y_axis = all_numerics[0]["name"]
            elif all_categoricals and all_numerics:
                selected_type = "bar"
                x_axis = all_categoricals[0]["name"]
                y_axis = all_numerics[0]["name"]
            elif len(all_numerics) >= 2:
                selected_type = "scatter"
                x_axis = all_numerics[0]["name"]
                y_axis = all_numerics[1]["name"]

        if explicit_chart:
            selected_type = next(
                (k for k in [
                    "line", "bar", "pie", "scatter",
                    "histogram", "area", "heatmap", "box"
                ] if k in q),
                selected_type
            )

        if not x_axis and columns:
            x_axis = columns[0]["name"]
        if not y_axis and len(columns) > 1:
            y_axis = (
                columns[1]["name"]
                if columns[1]["name"] != x_axis
                else "count"
            )
        if not y_axis:
            y_axis = "count"

        return {
            "type": selected_type,
            "x": x_axis,
            "y": y_axis,
            "original_query": query,
            "detected_columns": [
                c["name"] for c in found_columns
            ]
        }
