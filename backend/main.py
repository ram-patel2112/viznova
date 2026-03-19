from datetime import datetime
import os
import shutil
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.dataset_service import DatasetService
from analytics.insight_service import InsightService
from analytics.nlq_service import NLQService
from analytics.predictive_service import PredictiveService

app = FastAPI(title="VIZNOVA Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory dataset registry (persists while server is running)
datasets = {}
dataset_id_counter = 1


# ─── Health ───────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "VIZNOVA backend running"}


# ─── Upload ────────────────────────────────────────
@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global dataset_id_counter

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx/.xls files are supported.")

    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Step 1: Auto-preprocess (clean) the dataset
    clean_summary = {}
    try:
        clean_summary = await DatasetService.clean_dataset(file_path)
        print(f"[VIZNOVA] Auto-cleaning complete: {clean_summary}")
    except Exception as e:
        print(f"[VIZNOVA] Auto-cleaning skipped: {e}")

    # Step 2: Profile the (cleaned) dataset for metadata
    try:
        meta = await DatasetService.process_dataset(file_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    ds_id = dataset_id_counter
    dataset_id_counter += 1

    dataset = {
        "id": ds_id,
        "name": safe_name,
        "file_path": file_path,
        "type": "CSV" if ext == ".csv" else "Excel",
        "uploaded_at": datetime.now().isoformat(),
        "row_count": meta["row_count"],
        "col_count": meta["col_count"],
        "column_count": meta["col_count"],
        "columns_metadata": meta["columns"],
        "quality_metrics": meta["quality_metrics"],
        "correlation_heatmap": meta["correlation_heatmap"],
        "correlation_insights": meta["correlation_insights"],
        "preprocessing_summary": clean_summary,
    }
    datasets[ds_id] = dataset

    return {
        "id": ds_id,
        "name": safe_name,
        "row_count": meta["row_count"],
        "column_count": meta["col_count"],
        "preprocessing_summary": clean_summary,
        "message": "Upload and auto-preprocessing successful",
    }


# ─── Dataset List ───────────────────────────────────
@app.get("/datasets")
async def list_datasets():
    return [
        {
            "id": ds["id"],
            "name": ds["name"],
            "row_count": ds.get("row_count"),
            "column_count": ds.get("column_count"),
            "created_at": ds.get("uploaded_at"),
        }
        for ds in datasets.values()
    ]


@app.get("/recent-datasets")
async def recent_datasets():
    return list(datasets.values())[-5:]


# ─── Dataset Detail ─────────────────────────────────
@app.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: int):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds


# ─── Chart Data (JSON for ECharts) ──────────────────
@app.get("/datasets/{dataset_id}/chart-data")
async def get_chart_data(
    dataset_id: int,
    x: str = Query(...),
    y: str = Query(...),
    chart_type: str = Query("bar"),
):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        data = await DatasetService.get_chart_data(ds["file_path"], x, y, chart_type)
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")


# ─── Chart Image (Base64 PNG) ───────────────────────
@app.get("/datasets/{dataset_id}/chart-image")
async def get_chart_image(
    dataset_id: int,
    x: str = Query(...),
    y: str = Query(...),
    chart_type: str = Query("bar"),
    show_forecast: bool = False,
    show_anomalies: bool = False,
    show_clusters: bool = False,
):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        result = await DatasetService.get_chart_image(
            ds["file_path"], x, y, chart_type,
            show_forecast=show_forecast,
            show_anomalies=show_anomalies,
            show_clusters=show_clusters,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


# ─── Chart Recommendation ───────────────────────────
@app.get("/datasets/{dataset_id}/recommend-chart")
async def recommend_chart(dataset_id: int, x: str = Query(...), y: str = Query(None)):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    chart_type = await DatasetService.recommend_chart(ds["file_path"], x, y)
    return {"chart_type": chart_type}


# ─── Clean Dataset ──────────────────────────────────
@app.post("/datasets/{dataset_id}/clean")
async def clean_dataset(dataset_id: int):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        result = await DatasetService.clean_dataset(ds["file_path"])
        # Re-process metadata after cleaning
        meta = await DatasetService.process_dataset(ds["file_path"])
        datasets[dataset_id].update({
            "columns_metadata": meta["columns"],
            "quality_metrics": meta["quality_metrics"],
            "row_count": meta["row_count"],
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── NLQ / AI Query ────────────────────────────────
class QueryRequest(BaseModel):
    query: str

@app.post("/datasets/{dataset_id}/query")
async def query_dataset(dataset_id: int, req: QueryRequest):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    columns = ds.get("columns_metadata", [])
    parsed = NLQService.parse_query(req.query, columns)

    x, y, chart_type = parsed["x"], parsed["y"], parsed["type"]

    try:
        chart_data = await DatasetService.get_chart_data(ds["file_path"], x, y, chart_type)
        df = DatasetService.load_df(ds["file_path"])
        insight = InsightService.generate_chart_insights(df, x, y, chart_type)

        return {
            "intent": "add_chart",
            "entities": {"chart_type": chart_type, "x_axis": x, "y_axis": y},
            "result": {
                "title": f"{chart_type.title()} · {y} by {x}",
                "data": chart_data,
                "insight": insight,
            },
        }
    except Exception as e:
        return {
            "intent": "analyze",
            "entities": {},
            "result": {"insight": f"Could not process query: {str(e)}"},
        }


# ─── Intelligence Story ─────────────────────────────
@app.get("/datasets/{dataset_id}/story")
async def get_story(dataset_id: int):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        df = DatasetService.load_df(ds["file_path"])
        story = InsightService.generate_full_report(df, ds["name"])
        return {"story": story, "dataset_name": ds["name"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Forecast ───────────────────────────────────────
@app.get("/datasets/{dataset_id}/forecast")
async def get_forecast(dataset_id: int, x: str = Query(...), y: str = Query(...), periods: int = Query(5)):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        df = DatasetService.load_df(ds["file_path"])
        result = PredictiveService.forecast(df, x, y, periods)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Anomalies ──────────────────────────────────────
@app.get("/datasets/{dataset_id}/anomalies")
async def get_anomalies(dataset_id: int):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        df = DatasetService.load_df(ds["file_path"])
        num_cols = list(df.select_dtypes(include=["number"]).columns[:3])
        result = PredictiveService.detect_anomalies(df, num_cols)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Clusters ───────────────────────────────────────
@app.get("/datasets/{dataset_id}/clusters")
async def get_clusters(dataset_id: int, k: int = Query(3)):
    ds = datasets.get(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        df = DatasetService.load_df(ds["file_path"])
        num_cols = list(df.select_dtypes(include=["number"]).columns[:4])
        result = PredictiveService.cluster_data(df, num_cols, k=k)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
