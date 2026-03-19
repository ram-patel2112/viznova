# VizNova: Autonomous Data Analytics Engine

VizNova is a full-stack platform that automatically analyzes datasets, generates visualizations, and provides predictive insights using rule-based algorithms.

## Features
- **Dataset Upload**: Support for CSV and Excel files.
- **Auto Visualization**: Rules-based chart selection (Bar, Line, Pie, Histograms).
- **NLQ (Natural Language Query)**: Ask questions like "Show sales trend" to generate charts.
- **Predictive Analytics**: Linear Regression-based forecasting and Isolation Forest for anomaly detection.
- **Glassmorphic UI**: High-end modern dashboard design using Tailwind CSS.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Backend**: FastAPI, Pandas, SQLAlchemy, Scikit-learn, PostgreSQL (or SQLite for dev).

## Quick Start (Unified Command)
From the root directory, you can start both the backend and frontend with a single command:
```bash
npm install
npm run dev
```

### Manual Setup (Individual Components)
#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Workflow
1. Upload `example_sales.csv` (provided in root).
2. The system will automatically detect column types and generate initial charts.
3. Use the search bar to query your data using natural language.
4. Explore forecasting and anomaly detection overlays.
