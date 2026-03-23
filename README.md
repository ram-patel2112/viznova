# VizNova: Intelligent Data Analytics, Visualization & Predictive Insight Platform

VIZNOVA is a self-service business intelligence 
platform inspired by Microsoft Power BI. It allows 
users to upload structured datasets, build 
interactive dashboards, generate visualizations, 
and apply AI-assisted analytics — all through an 
intuitive web interface designed for non-technical 
users.

---

## Features

### Home Page
- Upload CSV and Excel datasets
- Open saved reports from sidebar
- Learn with built-in sample datasets
  (Cars_data.csv and example_sales.csv)
- SQL Server connection UI (planned feature)
- Get data from other sources roadmap
- Collapsible sections
- Recent Reports with search and filter
- Open Overview and Step-by-step Guide modals

### Dataset Intelligence
- Automatic popup after every upload
- Dataset stats — rows, columns, 
  numeric and categorical counts
- Data Quality Check — missing values,
  duplicates, outliers
- Correlation Insights — auto detected
  strong column relationships
- Clean Automatically button
- Auto Generate Dashboard — one click 
  generates 5 best charts for the dataset
- Continue to Dashboard

### Visualization Engine
- 12+ chart types using Matplotlib
- Bar, Line, Pie, Area, Histogram,
  Box Plot, Scatter, Heatmap, Donut,
  Bubble, Waterfall, Funnel
- Gradient color scaling on bar charts
- Mean line on histograms
- Side legends on pie/donut charts
- Value labels on bar charts
- Auto chart recommendation based on 
  column data types
- Insight text below every chart

### Data Tab
- Dataset Info — full column overview
  with type badges and upload date
- Clean Data — removes duplicates,
  fills missing values, normalizes outliers
- Column Stats — separate tables for
  numeric (min, max, mean, std dev) and
  categorical columns (unique values,
  sample values)

### Analytics Engine (Per Chart)
- Click any chart to select it (blue border)
- Forecast — Linear Regression on 
  selected chart's Y column
- Anomaly Detection — IQR-based detection
  on selected chart's Y column
- K-Means Clustering — 3 clusters on 
  dataset numeric columns
- Semantic Insight — AI story generation
- All analytics validate column types
  before running

### AI Tab
- Natural Language Query — type questions
  like "Show Engine HP by Make"
- Intent detection and automatic 
  chart type selection
- Insight Story Generator
- Smart Recommendations

### Layout & Workspace
- Visual grid layout switcher —
  1 column, 2 columns, 3 columns
- Dashboard canvas with chart cards
- Chart selection with blue border highlight
- Remove individual charts
- Bottom status bar shows selected chart

### Save & Restore Reports
- Dedicated Save Report button in top bar
- Auto-save prompt when navigating away
  (Power BI style)
- Custom report name input
- Saves all charts, insights, and results
- Full dashboard restoration when reopened
- Recent Reports on home page
- Open tab with report card grid
- Delete reports

### Export
- Export PDF — opens print-ready report
  with all charts and insights in new window
- Export PNG — exports selected chart only,
  or all charts if none selected
- Download Report — generates formatted
  text/PDF analysis report with AI insights

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
- SQLite with SQLAlchemy

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
│   │   └── models.py
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
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
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

From the root directory:
```bash
npm install
npm run dev
```

This starts:
- Backend at http://localhost:8000
- Frontend at http://localhost:5173

---

## Manual Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## How to Use

1. Open http://localhost:5173
2. Click Upload CSV or Excel workbook
3. Upload Cars_data.csv or example_sales.csv
4. Review the Dataset Intelligence Report
5. Click Auto Generate Dashboard for 
   instant visualizations
6. Or go to Visualize tab and manually 
   select chart type and columns
7. Click any chart to select it
8. Go to Analytics tab and run Forecast,
   Anomaly Detection or Clustering
9. Use AI tab for natural language queries
10. Click Save Report to save your analysis
11. Access saved reports from Recent Reports
    or the Open tab in sidebar

---

## Sample Queries for AI Tab

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
| GET | /datasets | List datasets |
| GET | /recent-datasets | Recent uploads |
| GET | /datasets/{id} | Dataset details |
| GET | /datasets/{id}/chart-image | Generate chart |
| GET | /datasets/{id}/auto-charts | Auto chart configs |
| POST | /datasets/{id}/clean | Clean dataset |
| GET | /datasets/{id}/forecast | Run forecast |
| GET | /datasets/{id}/anomalies | Detect anomalies |
| GET | /datasets/{id}/clusters | Run clustering |
| POST | /datasets/{id}/query | NLQ query |
| GET | /datasets/{id}/story | Insight story |
| GET | /sample/{filename} | Load sample data |
| GET | /reports | List reports |
| POST | /reports | Save report |
| GET | /reports/{id} | Get report |
| DELETE | /reports/{id} | Delete report |

---

## Academic Context

**Title:** VIZNOVA: Intelligent Data Analytics,
Visualization & Predictive Insight Platform

**Field:** Data Analytics and Intelligent 
Information Systems

**Degree:** Bachelor of Computer Applications (BCA)
**Batch:** 2023-2026

### Key Concepts Demonstrated
- Data Preprocessing and Cleaning
- Statistical Data Visualization
- Predictive Analytics (Regression, 
  Isolation Forest, K-Means)
- Natural Language Processing
- Self-Service Business Intelligence
- Full-Stack Web Development
- RESTful API Design
- Database Design with SQLAlchemy

---

## Important Notes

- Single-user platform (no authentication)
- Datasets persist across server restarts
  via SQLite database
- Reports save full dashboard state
  including all charts and insights
- All analytics use statistical algorithms
  applied dynamically at runtime
- No pre-trained AI models are used

---

## Developer

**Ram Patel**
BCA Final Year Student
Batch: 2023-2026
GitHub: github.com/ram-patel2112/viznova

---

*Generated by VIZNOVA —
Intelligent Data Analytics Platform*
