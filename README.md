# VizNova: Intelligent Data Analytics, Visualization & Predictive Insight Platform

VIZNOVA is a self-service business intelligence platform inspired by 
Microsoft Power BI. It allows users to upload structured datasets, 
build interactive dashboards, generate visualizations, and apply 
AI-assisted analytics — all through an intuitive web interface 
designed for non-technical users.

---

## Features

### Data Management
- Upload CSV and Excel datasets
- Automatic data preprocessing and cleaning
- Dataset intelligence report after upload
- Column type detection (numeric, categorical, date)

### Visualization Engine
- 12+ chart types generated using Python Matplotlib
- Bar, Line, Pie, Area, Histogram, Box Plot, Scatter,
  Heatmap, Donut, Bubble, Waterfall, Funnel
- Automatic chart recommendation based on data types
- Insight text generated below every visualization

### Analytics Engine
- Forecast Analysis using Linear Regression
- Anomaly Detection using Isolation Forest
- Clustering using K-Means algorithm
- Detailed explanations for every analysis result

### AI Features
- Natural Language Query — type questions like
  "Show Engine HP by Year" to generate charts
- Smart Chart Recommendation
- Insight Story Generator

### Dashboard
- Power BI inspired workspace layout
- Custom ribbon toolbar (Home, Data, Visualize, 
  Analytics, AI, Export tabs)
- Multi-column dashboard grid layout
- Filters, Visualizations, and Data panels

---

## Tech Stack

### Frontend
- React.js (Vite)
- React Router v6
- Plain CSS
- Axios

### Backend
- FastAPI (Python)
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- SQLite

---

## Project Structure
```
viznova/
├── backend/
│   ├── analytics/
│   │   ├── insight_service.py
│   │   ├── nlq_service.py
│   │   └── predictive_service.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── dataset_service.py
│   ├── uploads/
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── WorkspacePanel.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
├── Cars_data.csv
├── example_sales.csv
└── README.md
```

---

## Quick Start

From the root directory, run both frontend 
and backend with a single command:
```bash
npm install
npm run dev
```

This starts:
- Backend at http://localhost:8000
- Frontend at http://localhost:5173

---

## Manual Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## How to Use

1. Open http://localhost:5173 in your browser
2. Click "Upload CSV" or "Excel workbook" 
   on the home page
3. Upload one of the sample files:
   - Cars_data.csv
   - example_sales.csv
4. Navigate to the Dashboard
5. Go to Visualize tab and select a chart type
6. Configure X-axis and Y-axis columns
7. Click Generate Visual
8. Use Analytics tab for Forecast, 
   Anomaly Detection, and Clustering
9. Use AI tab for Natural Language Queries

---

## Sample Queries (AI Tab)

- Show Engine HP by Make
- Show Engine HP by Year
- Compare sales by region
- Show trend over time
- Show correlation between HP and cylinders

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| POST | /upload | Upload dataset |
| GET | /datasets | List all datasets |
| GET | /recent-datasets | Recent uploads |
| GET | /datasets/{id} | Dataset details |
| GET | /datasets/{id}/chart-image | Generate chart |
| GET | /datasets/{id}/forecast | Run forecast |
| GET | /datasets/{id}/anomalies | Detect anomalies |
| GET | /datasets/{id}/clusters | Run clustering |
| POST | /datasets/{id}/query | Natural language query |
| GET | /datasets/{id}/story | Insight story |

---

## Academic Context

This project was developed as a BCA Final Year Project.

**Title:** VIZNOVA: Intelligent Data Analytics, 
Visualization & Predictive Insight Platform

**Field:** Data Analytics and Intelligent 
Information Systems

**Key Concepts:**
- Data Preprocessing
- Data Visualization
- Predictive Analytics
- Anomaly Detection
- Clustering
- Natural Language Processing
- Self-Service Business Intelligence

---

## Important Notes

- This is a single-user platform 
  (no authentication required)
- Datasets are stored in memory while 
  the server is running
- All analytics use predefined statistical 
  and machine learning algorithms applied 
  dynamically at runtime
- No pre-trained AI models are used

---

## Developer

**Ram Patel**
BCA Final Year Student
Batch: 2023-2026
