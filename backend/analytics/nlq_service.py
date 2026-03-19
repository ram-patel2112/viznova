import re
import difflib
from typing import Dict, Any, List

class NLQService:
    @staticmethod
    def parse_query(query: str, columns: List[Dict[str, Any]]) -> Dict[str, Any]:
        query = query.lower().strip()
        
        # Comprehensive intent mapping
        chart_intents = {
            "line": ["trend", "over time", "history", "timeline", "progression", "growth"],
            "bar": ["compare", "comparison", "ranking", "difference", "versus", "vs", "by category"],
            "pie": ["proportion", "ratio", "breakdown", "percentage", "contribution", "segment", "composition"],
            "area": ["volume", "stacked trend", "cumulative", "fill"],
            "scatter": ["relation", "correlation", "distribution", "mapping", "scatter"],
            "histogram": ["histogram", "range", "bins", "frequency"],
            "box": ["variance", "spread", "outliers", "statistical", "quartiles", "box plot"],
            "heatmap": ["heatmap", "matrix", "correlation matrix", "density"],
            "violin": ["violin", "density distribution"]
        }
        
        selected_type = "bar" # Default
        for chart, keywords in chart_intents.items():
            if any(k in query for k in keywords):
                selected_type = chart
                break
        
        # Advanced Column Matching with Fuzzy Matching
        col_names = [c["name"].lower() for c in columns]
        # Tokenize and clean
        words = re.findall(r'\w+', query)
        
        found_columns = []
        # First pass: direct matches for multi-word columns if present
        for col in columns:
            if col["name"].lower() in query:
                found_columns.append(col)
        
        # Second pass: split query and fuzzy match tokens if not enough columns found
        if len(found_columns) < 2:
            for word in words:
                if len(word) < 3: continue
                matches = difflib.get_close_matches(word, col_names, n=1, cutoff=0.75)
                if matches:
                    col_obj = next(c for c in columns if c["name"].lower() == matches[0])
                    if col_obj not in found_columns:
                        found_columns.append(col_obj)
        
        # Section 6: Intelligent Chart Selection Logic
        numerics = [c for c in found_columns if c["type"] == "numeric"]
        dates = [c for c in found_columns if c["type"] == "date"]
        categoricals = [c for c in found_columns if c["type"] == "categorical"]
        
        # Override type based on rules if user didn't specify one strongly
        original_selected_type = selected_type
        
        # Simple extraction logic for X and Y
        x_axis = None
        y_axis = None
        
        # Heuristic rules from Master Prompt
        if dates and numerics:
            selected_type = "line"
            x_axis = dates[0]["name"]
            y_axis = numerics[0]["name"]
        elif categoricals and numerics:
            selected_type = "bar"
            x_axis = categoricals[0]["name"]
            y_axis = numerics[0]["name"]
        elif len(numerics) >= 2:
            selected_type = "scatter"
            x_axis = numerics[0]["name"]
            y_axis = numerics[1]["name"]
        elif len(numerics) == 1:
            selected_type = "histogram"
            x_axis = "count"
            y_axis = numerics[0]["name"]
        elif len(categoricals) == 1:
            selected_type = "pie"
            x_axis = categoricals[0]["name"]
            y_axis = "count"
        
        # Re-apply user's explicit request if they named a specific chart type
        # But only if it's compatible with the columns found
        explicit_request = any(k in query for k in ["line", "bar", "pie", "scatter", "histogram", "area", "heatmap", "box"])
        if explicit_request:
             selected_type = original_selected_type
             # Still need to map X and Y if not done
             if not x_axis and found_columns: x_axis = found_columns[0]["name"]
             if not y_axis and len(found_columns) > 1: y_axis = found_columns[1]["name"]
             elif not y_axis: y_axis = "count"

        # Safe Fallbacks if nothing detected
        if not x_axis and columns:
            x_axis = columns[0]["name"]
        if not y_axis and len(columns) > 1:
            y_axis = columns[1]["name"] if columns[1]["name"] != x_axis else "count"
        if not y_axis: y_axis = "count"
                
        return {
            "type": selected_type,
            "x": x_axis,
            "y": y_axis,
            "original_query": query,
            "detected_columns": [c["name"] for c in found_columns]
        }
