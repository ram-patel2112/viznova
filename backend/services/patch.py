import os
import io

file_path = r"d:\BCA Projects\viznova\backend\services\dataset_service.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

heatmap_code = """
        # Phase 2: Correlation Heatmap
        heatmap_base64 = None
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] >= 2:
            try:
                corr = numeric_df.corr().round(2)
                fig, ax = plt.subplots(figsize=(6, 4))
                sns.heatmap(corr, cmap="Blues", annot=True, fmt=".2f", ax=ax, cbar=False)
                plt.tight_layout()
                buffer = io.BytesIO()
                fig.savefig(buffer, format="png", dpi=100)
                plt.close(fig)
                heatmap_base64 = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
            except Exception as e:
                print(f"Heatmap generation failed: {e}")
                heatmap_base64 = None

        return {"""

if 'heatmap_base64' not in content:
    content = content.replace('        return {', heatmap_code, 1)

content = content.replace('"total_missing": total_missing,', '"total_missing": int(total_missing),')

if 'correlation_heatmap' not in content:
    content = content.replace('''                "missing_by_column": missing_counts
            }
        }''', '''                "missing_by_column": missing_counts
            },
            "correlation_heatmap": heatmap_base64
        }''')

clean_dataset_code = """
    @staticmethod
    async def clean_dataset(file_path: str) -> Dict[str, Any]:
        df = DatasetService.load_df(file_path)
        summary = {
            "initial_rows": len(df),
            "duplicates_removed": 0,
            "missing_filled": 0,
            "outliers_handled": 0,
            "dates_converted": 0
        }

        # 1. Remove duplicates
        initial_len = len(df)
        df.drop_duplicates(inplace=True)
        summary["duplicates_removed"] = initial_len - len(df)

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
    async def get_chart_data"""

if 'def clean_dataset' not in content:
    content = content.replace('    @staticmethod\n    async def get_chart_data', clean_dataset_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Patched successfully!')
