import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

// Reusable inline icon component
const Icon = ({ path, fill = "none" }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
);

// SVG Paths
const icons = {
  csv: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
  excel: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13l3 3m0-3l-3 3"></path>',
  chart: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.6-4 3-9 3s-9-1.4-9-3"></path><path d="M3 5v14c0 1.6 4 3 9 3s9-1.4 9-3V5"></path>',
  info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  wand: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="9" x2="9" y2="21"></line>',
  bar: '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>',
  line: '<polyline points="3 3 3 21 21 21"></polyline><polyline points="3 14 9 9 14 14 21 4"></polyline>',
  pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
  area: '<polyline points="3 20 3 14 9 9 14 14 21 4 21 20 3 20"></polyline>',
  hist: '<rect x="4" y="10" width="4" height="10"></rect><rect x="10" y="4" width="4" height="16"></rect><rect x="16" y="14" width="4" height="6"></rect>',
  box: '<rect x="8" y="6" width="8" height="12"></rect><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="9" y1="12" x2="15" y2="12"></line>',
  scatter: '<circle cx="7" cy="7" r="1.5"></circle><circle cx="12" cy="11" r="1.5"></circle><circle cx="17" cy="6" r="1.5"></circle><circle cx="18" cy="16" r="1.5"></circle>',
  heatmap: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line>',
  donut: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle>',
  bubble: '<circle cx="8" cy="16" r="4"></circle><circle cx="16" cy="8" r="6"></circle><circle cx="14" cy="18" r="2"></circle>',
  waterfall: '<rect x="2" y="12" width="4" height="8"></rect><rect x="8" y="6" width="4" height="6"></rect><rect x="14" y="2" width="4" height="4"></rect><rect x="20" y="2" width="4" height="18"></rect>',
  funnel: '<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"></polygon>',
  trend: '<polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="14 7 21 7 21 14"></polyline>',
  warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  cluster: '<circle cx="6" cy="6" r="2"></circle><circle cx="18" cy="6" r="2"></circle><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle>',
  brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.1 3 3 0 0 1-.34-5.6 2.5 2.5 0 0 1 1.32-4.2 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.1 3 3 0 0 0 .34-5.6 2.5 2.5 0 0 0-1.32-4.2 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
  bulb: '<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.1 14c.2-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .5 1.97 1.5 2.5.76.76 1.23 1.52 1.41 2.5V14"></path>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><text x="7" y="16" font-size="6" font-family="sans-serif" font-weight="bold" stroke="none" fill="currentColor">PDF</text><polyline points="14 2 14 8 20 8"></polyline>',
  img: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
  report: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
};

const datasets = {};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [datasetName, setDatasetName] = useState('');
  const [datasetId, setDatasetId] = useState(
    new URLSearchParams(location.search).get('datasetId')
  );

  const [activeTab, setActiveTab] = useState('Home');
  const [layout, setLayout] = useState('2');
  
  const [charts, setCharts] = useState([]);
  const [columns, setColumns] = useState(datasetId ? ['Column 1', 'Column 2', 'Column 3'] : []);
  
  // Ribbon refs
  const fileInputRefCsv = useRef(null);
  const fileInputRefExcel = useRef(null);

  // Results panel state
  const [resultsPanel, setResultsPanel] = useState({
    isOpen: false,
    title: '',
    content: '',
    status: ''
  });

  // Flow control states
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('Bar Chart');
  const [nlqQuery, setNlqQuery] = useState('');

  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const [showDatasetInfoModal, setShowDatasetInfoModal] = useState(false);
  const [showColumnStatsModal, setShowColumnStatsModal] = useState(false);
  const [datasetInfoData, setDatasetInfoData] = useState(null);
  const [columnStatsData, setColumnStatsData] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const [reportName, setReportName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [showVisualizationsPanel, setShowVisualizationsPanel] = useState(true);
  const [showDataPanel, setShowDataPanel] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(
      window.location.search
    );
    const reportId = urlParams.get('reportId');

    if (reportId) {
      const loadReport = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/reports/${reportId}`
          );
          if (!response.ok) return;
          const report = await response.json();
          
          setCharts(report.charts || []);
          setColumns(report.columns_metadata || []);
          setDatasetName(report.dataset_name || '');
          setDatasetId(
            report.dataset_id 
              ? String(report.dataset_id) 
              : null
          );
          setSavedReportId(parseInt(reportId));
          setHasUnsavedChanges(false);
          
        } catch(e) {
          console.error('Load report error:', e);
        }
      };
      loadReport();
      return;
    }

    const loadDatasetFromUrl = async () => {
      const urlDatasetId = urlParams.get('datasetId');
      
      if (!urlDatasetId || 
          urlDatasetId === 'new_upload') return;
      
      if (columns.length > 0 && columns[0] !== 'Column 1') return;
      
      try {
        const response = await fetch(
          `http://localhost:8000/datasets/${urlDatasetId}`
        );
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        const colsMeta = data.columns_metadata || [];
        let realColumns = colsMeta.map(col => {
          if (typeof col === 'string') return col;
          if (col.name) return col.name;
          return String(col);
        });
        
        if (realColumns.length === 0) return;
        
        setColumns(realColumns);
        setDatasetName(data.name || data.filename || '');
        setDatasetId(urlDatasetId);

        const urlParams2 = new URLSearchParams(
          window.location.search
        );
        const showIntelligence = urlParams2.get(
          'showIntelligence'
        );
        const fromSample = urlParams2.get(
          'fromSample'
        );

        if (showIntelligence === 'true') {
          const colsMeta = data.columns_metadata || [];
          const quality = data.quality_metrics || {};
          
          setIntelligenceData({
            name: data.name || data.filename || '',
            datasetId: urlDatasetId,
            rows: data.row_count || 0,
            columns: data.column_count || 0,
            numericCols: colsMeta.filter(
              c => c.type === 'numeric'
            ).length,
            categoricalCols: colsMeta.filter(
              c => c.type === 'categorical'
            ).length,
            dateCols: colsMeta.filter(
              c => c.type === 'date'
            ).length,
            missingValues: quality.total_missing || 0,
            duplicates: quality.duplicate_count || 0,
            outliers: quality.outlier_count || 0,
            preprocessingSummary: {},
            correlationInsights: 
              data.correlation_insights || [],
          });
          
          setShowIntelligenceModal(true);
        }
        
        datasets[urlDatasetId] = {
          id: urlDatasetId,
          name: data.name || data.filename,
          file_path: data.file_path,
          columns_metadata: colsMeta,
        };
        
      } catch(e) {
        console.error('Failed to load dataset:', e);
      }
    };
    
    loadDatasetFromUrl();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && charts.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, charts]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();

        if (charts.length === 0) return;

        if (savedReportId) {
          setIsSaving(true);
          try {
            const reportData = {
              name: reportName || datasetName || 'Untitled Report',
              dataset_id: datasetId ? parseInt(datasetId) : null,
              dataset_name: datasetName || '',
              charts: charts.map(chart => ({
                id: chart.id,
                title: chart.title,
                image: chart.image,
                insight: chart.insight,
                chartType: chart.chartType,
                x: chart.x,
                y: chart.y
              })),
              results_panel: resultsPanel.isOpen
                ? {
                    title: resultsPanel.title,
                    content: resultsPanel.content,
                    status: resultsPanel.status
                  }
                : null,
              columns_metadata: columns
            };

            await fetch(
              `http://localhost:8000/reports/${savedReportId}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
              }
            );

            setHasUnsavedChanges(false);

            setResultsPanel({
              isOpen: true,
              title: '✓ Report Saved',
              content: 'Your changes have been saved successfully.',
              status: 'success'
            });
          } catch(e) {
            console.error('Ctrl+S save error:', e);
          } finally {
            setIsSaving(false);
          }
        } else {
          setShowSaveModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    savedReportId,
    charts,
    datasetId,
    datasetName,
    columns,
    resultsPanel,
    reportName
  ]);

  const handleFileUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      console.log('Upload response:', data);

      const detailResponse = await fetch(
        `http://localhost:8000/datasets/${data.id}`
      );
      const detailData = await detailResponse.json();
      console.log('Dataset detail:', detailData);

      let realColumns = [];
      if (
        detailData.columns_metadata && 
        Array.isArray(detailData.columns_metadata)
      ) {
        realColumns = detailData.columns_metadata.map(col => {
          if (typeof col === 'string') return col;
          if (col.name) return col.name;
          if (col.column_name) return col.column_name;
          return String(col);
        });
      }

      if (realColumns.length === 0) {
        realColumns = Array.from(
          { length: data.column_count },
          (_, i) => `Column ${i + 1}`
        );
      }

      setColumns(realColumns);
      setDatasetName(data.name || file.name);
      setDatasetId(data.id);
      
      const quality = detailData.quality_metrics || {};
      const colsMeta = detailData.columns_metadata || [];

      setIntelligenceData({
        name: data.name || file.name,
        datasetId: data.id,
        rows: data.row_count || 0,
        columns: data.column_count || 0,
        numericCols: colsMeta.filter(
          c => c.type === 'numeric'
        ).length,
        categoricalCols: colsMeta.filter(
          c => c.type === 'categorical'
        ).length,
        dateCols: colsMeta.filter(
          c => c.type === 'date'
        ).length,
        missingValues: quality.missing_values 
          || data.preprocessing_summary
            ?.missing_values_filled 
          || 0,
        duplicates: quality.duplicate_rows 
          || data.preprocessing_summary
            ?.duplicates_removed 
          || 0,
        outliers: quality.outliers_detected || 0,
        preprocessingSummary: 
          data.preprocessing_summary || {},
        correlationInsights: 
          detailData.correlation_insights || [],
      });

      setShowIntelligenceModal(true);
      navigate(`/dashboard?datasetId=${data.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Make sure backend is running.');
    }
  };

  const handleCleanDataset = async () => {
    if (!intelligenceData?.datasetId) return;
    setIsCleaning(true);
    try {
      const response = await fetch(
        `http://localhost:8000/datasets/${intelligenceData.datasetId}/clean`,
        { method: 'POST' }
      );
      const result = await response.json();
      setIntelligenceData(prev => ({
        ...prev,
        cleaned: true,
        cleanSummary: result
      }));
    } catch(e) {
      console.error('Clean failed:', e);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAnalyze = async (title) => {
    if (!datasetId) {
      setResultsPanel({
        isOpen: true,
        title: 'No Dataset',
        content: 'Please upload a dataset first.',
        status: 'error'
      });
      return;
    }

    const getNumericColumns = () => {
      return columns.filter(col => {
        if (!col) return false;
        const colName = typeof col === 'string'
          ? col : col.name || '';
        const lowerCol = colName.toLowerCase();
        const skipWords = [
          'id', 'code', 'index', 'no'
        ];
        return !skipWords.some(
          w => lowerCol === w
        );
      });
    };

    const getChartColumns = () => {
      if (selectedChart && 
          selectedChart.x && 
          selectedChart.y &&
          selectedChart.y !== 'count') {
        return {
          x: selectedChart.x,
          y: selectedChart.y,
          fromChart: true,
          chartTitle: selectedChart.title
        };
      }
      const cols = getNumericColumns();
      return {
        x: cols[0] || columns[0] || '',
        y: cols[1] || cols[0] || 
           columns[0] || '',
        fromChart: false,
        chartTitle: null
      };
    };

    setResultsPanel({
      isOpen: true,
      title: title,
      content: 'Analyzing...',
      status: 'loading'
    });

    try {
      let response;
      let data;
      const { x, y, fromChart, chartTitle } =
        getChartColumns();

      if (title === 'Forecast Analysis') {
        if (!y || y === 'count') {
          setResultsPanel({
            isOpen: true,
            title: 'Forecast Not Available',
            content: 'Forecast requires a numeric Y-axis column. Please select a chart with numeric data (Bar, Line, Scatter) and try again.',
            status: 'error'
          });
          return;
        }

        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/forecast?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}&periods=5`
        );
        data = await response.json();
        
        const panelTitle = fromChart
          ? `Forecast — ${chartTitle}`
          : 'Forecast Analysis (Dataset)';
        
        setResultsPanel({
          isOpen: true,
          title: panelTitle,
          content: data.explanation
            || data.insight
            || 'Forecast complete.',
          status: 'success'
        });
      }

      else if (
        title === 'Anomaly Detection'
      ) {
        if (!y || y === 'count') {
          setResultsPanel({
            isOpen: true,
            title: 'Anomaly Detection Not Available',
            content: 'Anomaly Detection requires a numeric column. Please select a chart with numeric data and try again.',
            status: 'error'
          });
          return;
        }

        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/anomalies?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`
        );
        data = await response.json();
        
        const panelTitle = fromChart
          ? `Anomaly Detection — ${chartTitle}`
          : 'Anomaly Detection (Dataset)';
        
        setResultsPanel({
          isOpen: true,
          title: panelTitle,
          content: data.explanation
            || data.insight
            || 'Anomaly detection complete.',
          status: 'success'
        });
      }

      else if (
        title === 'K-Means Cluster'
      ) {
        const numCols = getNumericColumns();
        
        if (numCols.length < 2) {
          setResultsPanel({
            isOpen: true,
            title: 'Clustering Not Available',
            content: 'K-Means Clustering requires at least 2 numeric columns in your dataset.',
            status: 'error'
          });
          return;
        }

        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/clusters?k=3`
        );
        data = await response.json();
        
        setResultsPanel({
          isOpen: true,
          title: 'K-Means Clustering',
          content: data.explanation
            || data.insight
            || 'Clustering complete.',
          status: 'success'
        });
      }

      else if (
        title === 'Semantic Insight'
      ) {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        
        const panelTitle = fromChart
          ? `Insight — ${chartTitle}`
          : 'Semantic Insight';
        
        setResultsPanel({
          isOpen: true,
          title: panelTitle,
          content: data.story
            || data.explanation
            || 'Insight generation complete.',
          status: 'success'
        });
      }

      else if (title === 'Natural Language Query') {
        if (!nlqQuery.trim()) {
          setResultsPanel({
            isOpen: true,
            title: 'NLQ',
            content: 'Please enter a query.',
            status: 'error'
          });
          return;
        }

        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/query`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: nlqQuery
            })
          }
        );
        data = await response.json();
        
        const entities = data.entities || {};
        const chartType = entities.chart_type
          || 'bar';
        const xAxis = entities.x_axis || x;
        const yAxis = entities.y_axis || y;

        try {
          const chartResponse = await fetch(
            `http://localhost:8000/datasets/${datasetId}/chart-image?x=${encodeURIComponent(xAxis)}&y=${encodeURIComponent(yAxis)}&chart_type=${encodeURIComponent(chartType)}`
          );
          const chartData = 
            await chartResponse.json();
          
          const newChart = {
            id: Date.now(),
            title: data.result?.title
              || `${yAxis} by ${xAxis}`,
            image: chartData.image_base64
              || chartData.image
              || null,
            insight: data.result?.insight
              || '',
            chartType: chartType,
            x: xAxis,
            y: yAxis
          };
          
          setCharts(prev => [...prev, newChart]);
          setHasUnsavedChanges(true);
          
          setResultsPanel({
            isOpen: true,
            title: 'NLQ Result',
            content: data.result?.insight
              || 'Chart generated from your query.',
            status: 'success'
          });
        } catch(e) {
          setResultsPanel({
            isOpen: true,
            title: 'NLQ Result',
            content: data.result?.insight
              || 'Query processed.',
            status: 'success'
          });
        }
      }

      else if (
        title === 'Insight Story'
      ) {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        
        setResultsPanel({
          isOpen: true,
          title: 'Insight Story',
          content: data.story
            || data.explanation
            || 'Story generation complete.',
          status: 'success'
        });
      }

      else if (
        title === 'Smart Recommend'
      ) {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        
        const recommendations = columns
          .slice(0, 5)
          .map((col, i) => {
            const colName = typeof col === 'string'
              ? col : col.name || col;
            return `${i+1}. Analyze "${colName}" for deeper insights`;
          })
          .join('\n');
        
        setResultsPanel({
          isOpen: true,
          title: 'Smart Recommendations',
          content: (data.story || '') + 
            '\n\nRecommended columns to explore:\n' +
            recommendations,
          status: 'success'
        });
      }

    } catch(e) {
      console.error('Analytics error:', e);
      setResultsPanel({
        isOpen: true,
        title: title,
        content: `Analysis failed: ${e.message}. Please try again.`,
        status: 'error'
      });
    }
  };

  const handleChartConfig = (type) => {
    if (!datasetId) return;
    setSelectedChartType(type);
    setIsChartModalOpen(true);
  };

  const handleGenerateChart = async () => {
    if (!datasetId || !xAxis || !yAxis) return;
    
    setIsGenerating(true);
    
    try {
      const chartType = selectedChartType
        .toLowerCase()
        .replace(' chart', '')
        .replace(' plot', '')
        .replace(' ', '_');
      
      const response = await fetch(
        `http://localhost:8000/datasets/${datasetId}/chart-image?x=${encodeURIComponent(xAxis)}&y=${encodeURIComponent(yAxis)}&chart_type=${chartType}`
      );
      
      if (!response.ok) throw new Error('Chart generation failed');
      
      const data = await response.json();
      
      let chartInsight = '';
      try {
        const insightResponse = await fetch(
          `http://localhost:8000/datasets/${datasetId}/query`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: `show ${yAxis} by ${xAxis}`
            })
          }
        );
        const insightData = await insightResponse.json();
        chartInsight = insightData.result?.insight || '';
      } catch(e) {
        console.log('Insight fetch failed:', e);
      }
      
      const newChart = {
        id: Date.now(),
        title: `${selectedChartType} - ${yAxis} by ${xAxis}`,
        image: data.image_base64 || data.image,
        insight: chartInsight || data.insight || '',
        chartType: selectedChartType,
        x: xAxis,
        y: yAxis
      };
      
      setCharts(prev => [...prev, newChart]);
      setHasUnsavedChanges(true);
      setIsChartModalOpen(false);
      setXAxis('');
      setYAxis('');
      
    } catch (error) {
      console.error('Chart error:', error);
      alert('Failed to generate chart. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRibbonContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className="custom-ribbon-btn" onClick={() => fileInputRefCsv.current?.click()}>
                  <Icon path={icons.csv} />
                  <span>Import CSV</span>
                </div>
                <div className="custom-ribbon-btn" onClick={() => fileInputRefExcel.current?.click()}>
                  <Icon path={icons.excel} />
                  <span>Import Excel</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Data</div>
            </div>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className="custom-ribbon-btn" onClick={() => setIsChartModalOpen(true)}>
                  <Icon path={icons.chart} />
                  <span>New Visual</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Insert</div>
            </div>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <button
                      onClick={() => setLayout('1')}
                      title="1 Column"
                      style={{
                        width: '32px',
                        height: '28px',
                        border: layout === '1'
                          ? '2px solid #2563EB'
                          : '1px solid #E2E8F0',
                        borderRadius: '4px',
                        background: layout === '1'
                          ? '#EFF6FF' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: layout === '1'
                          ? '#2563EB' : '#CBD5E1',
                        borderRadius: '2px'
                      }}/>
                    </button>

                    <button
                      onClick={() => setLayout('2')}
                      title="2 Columns"
                      style={{
                        width: '32px',
                        height: '28px',
                        border: layout === '2'
                          ? '2px solid #2563EB'
                          : '1px solid #E2E8F0',
                        borderRadius: '4px',
                        background: layout === '2'
                          ? '#EFF6FF' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        padding: '3px'
                      }}
                    >
                      {[0,1].map(i => (
                        <div key={i} style={{
                          flex: 1,
                          height: '100%',
                          background: layout === '2'
                            ? '#2563EB' : '#CBD5E1',
                          borderRadius: '2px'
                        }}/>
                      ))}
                    </button>

                    <button
                      onClick={() => setLayout('3')}
                      title="3 Columns"
                      style={{
                        width: '32px',
                        height: '28px',
                        border: layout === '3'
                          ? '2px solid #2563EB'
                          : '1px solid #E2E8F0',
                        borderRadius: '4px',
                        background: layout === '3'
                          ? '#EFF6FF' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        padding: '3px'
                      }}
                    >
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          flex: 1,
                          height: '100%',
                          background: layout === '3'
                            ? '#2563EB' : '#CBD5E1',
                          borderRadius: '2px'
                        }}/>
                      ))}
                    </button>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: '#475569'
                  }}>
                    Layout
                  </span>
                </div>
              </div>
              <div className="custom-ribbon-label">Layout</div>
            </div>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div className="status-badge-container">
                  {!datasetId ? (
                    <div className="status-badge warning">No dataset loaded</div>
                  ) : (
                    <div className="status-badge success">
                      {datasetName || datasetId}
                    </div>
                  )}
                </div>
              </div>
              <div className="custom-ribbon-label">Status</div>
            </div>
          </>
        );
      case 'Data':
        return (
          <>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className="custom-ribbon-btn" onClick={() => fileInputRefCsv.current?.click()}>
                  <Icon path={icons.csv} />
                  <span>Import CSV</span>
                </div>
                <div className="custom-ribbon-btn" onClick={() => fileInputRefExcel.current?.click()}>
                  <Icon path={icons.excel} />
                  <span>Import Excel</span>
                </div>
                <div className="custom-ribbon-btn" onClick={() => navigate('/dashboard?datasetId=sample')}>
                  <Icon path={icons.db} />
                  <span>Sample Data</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Sources</div>
            </div>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={handleDatasetInfo}>
                  <Icon path={icons.info} />
                  <span>Dataset Info</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={handleCleanData}>
                  <Icon path={icons.wand} />
                  <span>Clean Data</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={handleColumnStats}>
                  <Icon path={icons.table} />
                  <span>Column Stats</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Intelligence</div>
            </div>
          </>
        );
      case 'Visualize':
        return (
          <>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Bar Chart')}>
                  <Icon path={icons.bar} />
                  <span>Bar Chart</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Line Chart')}>
                  <Icon path={icons.line} />
                  <span>Line Chart</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Pie Chart')}>
                  <Icon path={icons.pie} />
                  <span>Pie Chart</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Area Chart')}>
                  <Icon path={icons.area} />
                  <span>Area Chart</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Basic Charts</div>
            </div>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Histogram')}>
                  <Icon path={icons.hist} />
                  <span>Histogram</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Box Plot')}>
                  <Icon path={icons.box} />
                  <span>Box Plot</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Scatter Plot')}>
                  <Icon path={icons.scatter} />
                  <span>Scatter Plot</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Heatmap')}>
                  <Icon path={icons.heatmap} />
                  <span>Heatmap</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Statistical</div>
            </div>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Donut Chart')}>
                  <Icon path={icons.donut} />
                  <span>Donut Chart</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Bubble Chart')}>
                  <Icon path={icons.bubble} />
                  <span>Bubble Chart</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Waterfall')}>
                  <Icon path={icons.waterfall} />
                  <span>Waterfall</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleChartConfig('Funnel')}>
                  <Icon path={icons.funnel} />
                  <span>Funnel</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Advanced</div>
            </div>
          </>
        );
      case 'Analytics':
        return (
          <>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('Forecast Analysis')}>
                  <Icon path={icons.trend} />
                  <span>Forecast</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('Anomaly Detection')}>
                  <Icon path={icons.warn} />
                  <span>Anomaly Detection</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Predictive</div>
            </div>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('K-Means Cluster')}>
                  <Icon path={icons.cluster} />
                  <span>K-Means Cluster</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Clustering</div>
            </div>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('Semantic Insight')}>
                  <Icon path={icons.brain} />
                  <span>Semantic Insight</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Insights</div>
            </div>
          </>
        );
      case 'AI':
        return (
          <>
            <div className="custom-ribbon-group">
              <div className="custom-ribbon-buttons-row">
                <div className="ai-input-container">
                  <input 
                    type="text" 
                    className="ai-ribbon-input" 
                    placeholder="Ask a question... e.g. Show sales by region"
                    value={nlqQuery}
                    onChange={(e) => setNlqQuery(e.target.value)}
                  />
                  <button className="ai-ribbon-submit" onClick={() => handleAnalyze('Natural Language Query')}>Generate</button>
                </div>
              </div>
              <div className="custom-ribbon-label">Query</div>
            </div>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('Insight Story')}>
                  <Icon path={icons.doc} />
                  <span>Insight Story</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`} onClick={() => handleAnalyze('Smart Recommend')}>
                  <Icon path={icons.bulb} />
                  <span>Smart Recommend</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Intelligence</div>
            </div>
          </>
        );
      case 'Export':
        return (
          <>
            <div className="custom-ribbon-group" style={{ borderRight: 'none' }}>
              <div className="custom-ribbon-buttons-row">
                <div 
                  className={`custom-ribbon-btn ${!datasetId || charts.length === 0 ? 'disabled' : ''}`}
                  onClick={handleExportPDF}
                >
                  <Icon path={icons.pdf} />
                  <span>Export PDF</span>
                </div>
                <div 
                  className={`custom-ribbon-btn ${!datasetId || charts.length === 0 ? 'disabled' : ''}`}
                  onClick={handleExportPNG}
                  title={selectedChart
                    ? `Export "${selectedChart.title}" as PNG`
                    : 'Export all charts as PNG'}
                >
                  <Icon path={icons.img} />
                  <span>
                    {selectedChart 
                      ? 'Export Selected' 
                      : 'Export All PNG'
                    }
                  </span>
                </div>
                <div 
                  className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}
                  onClick={handleDownloadReport}
                >
                  <Icon path={icons.report} />
                  <span>Download Report</span>
                </div>
              </div>
              <div className="custom-ribbon-label">Download</div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleDatasetInfo = async () => {
    if (!datasetId) return;
    setIsLoadingInfo(true);
    try {
      const response = await fetch(
        `http://localhost:8000/datasets/${datasetId}`
      );
      const data = await response.json();
      setDatasetInfoData(data);
      setShowDatasetInfoModal(true);
    } catch(e) {
      console.error('Dataset info error:', e);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleColumnStats = async () => {
    if (!datasetId) return;
    setIsLoadingInfo(true);
    try {
      const response = await fetch(
        `http://localhost:8000/datasets/${datasetId}`
      );
      const data = await response.json();
      const colsMeta = data.columns_metadata || [];
      
      const statsPromises = colsMeta
        .filter(col => col.type === 'numeric')
        .map(async col => {
          return {
            ...col,
            hasStats: true
          };
        });
      
      setColumnStatsData(colsMeta);
      setShowColumnStatsModal(true);
    } catch(e) {
      console.error('Column stats error:', e);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleCleanData = async () => {
    if (!datasetId) return;
    try {
      const response = await fetch(
        `http://localhost:8000/datasets/${datasetId}/clean`,
        { method: 'POST' }
      );
      const data = await response.json();
      setResultsPanel({
        isOpen: true,
        title: 'Data Cleaning Complete',
        content: `Dataset cleaned successfully.\n\n` +
          `Missing values filled: ${data.missing_filled || 0}\n` +
          `Duplicate rows removed: ${data.duplicates_removed || 0}\n` +
          `Columns normalized: ${data.columns_normalized || 0}\n\n` +
          `Your dataset is now clean and ready for analysis.`,
        status: 'success'
      });
    } catch(e) {
      console.error('Clean error:', e);
    }
  };

  const handleExportPNG = () => {
    if (charts.length === 0) {
      alert(
        'Please generate at least one chart before exporting.'
      );
      return;
    }

    if (selectedChart) {
      if (selectedChart.image) {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${selectedChart.image}`;
        link.download = `${selectedChart.title
          .replace(/[^a-z0-9]/gi, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setResultsPanel({
          isOpen: true,
          title: 'Chart Exported',
          content: `"${selectedChart.title}" has been downloaded as PNG.`,
          status: 'success'
        });
      }
    } else {
      charts.forEach((chart, index) => {
        if (chart.image) {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${chart.image}`;
            link.download = `${chart.title
              .replace(/[^a-z0-9]/gi, '_')}_${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 300);
        }
      });

      setResultsPanel({
        isOpen: true,
        title: 'Charts Exported',
        content: `All ${charts.length} charts have been downloaded as PNG files.`,
        status: 'success'
      });
    }
  };

  const handleDownloadReport = async () => {
    if (!datasetId) return;
    
    try {
      setResultsPanel({
        isOpen: true,
        title: 'Generating Report',
        content: 'Please wait...',
        status: 'loading'
      });
      
      const response = await fetch(
        `http://localhost:8000/datasets/${datasetId}/story`
      );
      const data = await response.json();
      
      const reportContent = `
VIZNOVA ANALYSIS REPORT
========================
Dataset: ${datasetName || datasetId}
Generated: ${new Date().toLocaleString()}

DATASET OVERVIEW
----------------
Charts Generated: ${charts.length}

INSIGHT STORY
-------------
${data.story || 'No story available.'}

VISUALIZATIONS SUMMARY
----------------------
${charts.map((chart, i) => 
  `${i + 1}. ${chart.title}\n   ${chart.insight || 'No insight available.'}`
).join('\n\n')}

========================
Generated by VIZNOVA
Intelligent Data Analytics Platform
`.trim();

const chartsHTML = charts.map(chart => `
  <div style="margin-bottom: 32px;
    page-break-inside: avoid;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 20px;">
    <h3 style="margin: 0 0 12px 0;
      font-size: 15px;
      color: #0F172A;
      font-family: Inter, sans-serif;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;">
      ${chart.title}
    </h3>
    ${chart.image
      ? `<img 
          src="data:image/png;base64,${chart.image}"
          style="width: 100%;
          max-height: 320px;
          object-fit: contain;
          margin-bottom: 12px;" />`
      : '<p style="color:#475569">No image available</p>'
    }
    ${chart.insight
      ? `<p style="margin: 12px 0 0 0;
          font-size: 13px;
          color: #475569;
          font-family: Inter, sans-serif;
          line-height: 1.7;
          background: #F8FAFC;
          padding: 12px;
          border-radius: 6px;">
          ${chart.insight}
        </p>`
      : ''
    }
  </div>
`).join('');

const storySection = data.story
  ? `<div style="margin-bottom: 32px;
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: 8px;
      padding: 20px;">
      <h2 style="margin: 0 0 12px 0;
        font-size: 16px;
        color: #2563EB;
        font-family: Inter, sans-serif;">
        AI Insight Story
      </h2>
      <p style="margin: 0;
        font-size: 13px;
        color: #1E40AF;
        line-height: 1.8;
        font-family: Inter, sans-serif;
        white-space: pre-wrap;">
        ${data.story}
      </p>
    </div>`
  : '';

const printWindow = window.open('', '_blank');

printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>VIZNOVA Report - ${datasetName || 'Analysis'}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Inter, system-ui, sans-serif;
        padding: 40px;
        color: #0F172A;
        max-width: 900px;
        margin: 0 auto;
        background: white;
      }
      @media print {
        body { padding: 20px; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div style="
      border-bottom: 3px solid #2563EB;
      padding-bottom: 20px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;">
      <div>
        <h1 style="
          margin: 0 0 6px 0;
          font-size: 26px;
          font-weight: 700;
          color: #2563EB;">
          VIZNOVA Analysis Report
        </h1>
        <p style="
          margin: 0;
          font-size: 14px;
          color: #475569;">
          Dataset: <strong>${datasetName || datasetId}</strong>
        </p>
        <p style="
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #94A3B8;">
          Generated: ${new Date().toLocaleString()}
        </p>
      </div>
      <div style="
        background: #EFF6FF;
        border: 1px solid #DBEAFE;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: center;">
        <div style="
          font-size: 24px;
          font-weight: 700;
          color: #2563EB;">
          ${charts.length}
        </div>
        <div style="
          font-size: 11px;
          color: #475569;">
          Charts
        </div>
      </div>
    </div>

    ${storySection}

    <h2 style="
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #0F172A;">
      Visualizations & Insights
    </h2>

    ${charts.length === 0
      ? `<p style="color: #475569; 
          font-size: 13px;">
          No charts generated yet.
        </p>`
      : chartsHTML
    }

    <div style="
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      font-size: 11px;
      color: #94A3B8;
      text-align: center;">
      Generated by VIZNOVA — 
      Intelligent Data Analytics Platform
    </div>

    <div class="no-print" style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      gap: 12px;">
      <button onclick="window.print()"
        style="
          padding: 12px 24px;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;">
        Save as PDF
      </button>
      <button onclick="window.close()"
        style="
          padding: 12px 24px;
          background: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;">
        Close
      </button>
    </div>
  </body>
  </html>
`);

printWindow.document.close();
printWindow.focus();

setResultsPanel({
  isOpen: true,
  title: 'Report Ready',
  content: 'Your report has opened in a new window. Click "Save as PDF" to download it as PDF.',
  status: 'success'
});
      
    } catch(e) {
      console.error('Report download error:', e);
      setResultsPanel({
        isOpen: true,
        title: 'Export Failed',
        content: 'Failed to generate report. Please try again.',
        status: 'error'
      });
    }
  };

  const handleExportPDF = () => {
    if (charts.length === 0) {
      alert('Please generate at least one chart before exporting.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    
    const chartsHTML = charts.map(chart => `
      <div style="margin-bottom: 32px; 
        page-break-inside: avoid;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 16px;">
        <h3 style="margin: 0 0 12px 0;
          font-size: 14px;
          color: #0F172A;
          font-family: Inter, sans-serif;">
          ${chart.title}
        </h3>
        ${chart.image 
          ? `<img src="data:image/png;base64,${chart.image}" 
              style="width: 100%; max-height: 300px; 
              object-fit: contain;" />`
          : '<p>No image available</p>'
        }
        ${chart.insight 
          ? `<p style="margin: 12px 0 0 0;
              font-size: 12px;
              color: #475569;
              font-family: Inter, sans-serif;
              line-height: 1.6;">
              ${chart.insight}
            </p>`
          : ''
        }
      </div>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VIZNOVA Report - ${datasetName || 'Analysis'}</title>
        <style>
          body {
            font-family: Inter, system-ui, sans-serif;
            padding: 40px;
            color: #0F172A;
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #2563EB;
            padding-bottom: 16px;
            margin-bottom: 32px;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #2563EB;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #475569;
            margin: 4px 0 0 0;
          }
          .meta {
            display: flex;
            gap: 24px;
            margin-top: 12px;
            font-size: 12px;
            color: #475569;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">VIZNOVA Analysis Report</h1>
          <p class="subtitle">
            Dataset: ${datasetName || datasetId}
          </p>
          <div class="meta">
            <span>Generated: ${new Date().toLocaleString()}</span>
            <span>Charts: ${charts.length}</span>
          </div>
        </div>
        ${chartsHTML}
        <div style="margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #E2E8F0;
          font-size: 11px;
          color: #94A3B8;
          text-align: center;">
          Generated by VIZNOVA — 
          Intelligent Data Analytics Platform
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleSaveReport = async (name, navigateAfter = false) => {
    if (!name.trim()) {
      alert('Please enter a report name.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const reportData = {
        name: name.trim(),
        dataset_id: datasetId ? parseInt(datasetId) : null,
        dataset_name: datasetName || '',
        charts: charts.map(chart => ({
          id: chart.id,
          title: chart.title,
          image: chart.image,
          insight: chart.insight,
          chartType: chart.chartType,
          x: chart.x,
          y: chart.y
        })),
        results_panel: resultsPanel.isOpen
          ? {
              title: resultsPanel.title,
              content: resultsPanel.content,
              status: resultsPanel.status
            }
          : null,
        columns_metadata: columns
      };
      
      const response = await fetch(
        'http://localhost:8000/reports',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        }
      );
      
      const data = await response.json();
      setSavedReportId(data.id);
      setHasUnsavedChanges(false);
      setShowSaveModal(false);
      setReportName('');
      
      if (navigateAfter) {
        navigate('/');
      } else {
        alert('Report saved successfully!');
      }
      
    } catch(e) {
      console.error('Save error:', e);
      alert('Failed to save report.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGenerateDashboard = async () => {
    if (!intelligenceData?.datasetId) return;
    
    setIsAutoGenerating(true);
    setShowIntelligenceModal(false);
    
    try {
      const cleanResponse = await fetch(
        `http://localhost:8000/datasets/${intelligenceData.datasetId}/clean`,
        { method: 'POST' }
      );
      
      const configResponse = await fetch(
        `http://localhost:8000/datasets/${intelligenceData.datasetId}/auto-charts`
      );
      const configData = await configResponse.json();
      const chartConfigs = configData.charts || [];
      
      const generatedCharts = [];
      
      for (const config of chartConfigs) {
        try {
          const chartResponse = await fetch(
            `http://localhost:8000/datasets/${intelligenceData.datasetId}/chart-image?x=${encodeURIComponent(config.x)}&y=${encodeURIComponent(config.y)}&chart_type=${config.chart_type}`
          );
          const chartData = await chartResponse.json();
          
          let chartInsight = '';
          try {
            const insightResponse = await fetch(
              `http://localhost:8000/datasets/${intelligenceData.datasetId}/query`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  query: `show ${config.y} by ${config.x}`
                })
              }
            );
            const insightData = 
              await insightResponse.json();
            chartInsight = 
              insightData.result?.insight || '';
          } catch(e) {
            console.log('Insight failed:', e);
          }
          
          generatedCharts.push({
            id: Date.now() + 
              Math.random(),
            title: config.title,
            image: chartData.image_base64 
              || chartData.image 
              || null,
            insight: chartInsight,
            chartType: config.chart_type,
            x: config.x,
            y: config.y
          });
          
        } catch(e) {
          console.error(
            'Chart generation failed:', e
          );
        }
      }
      
      if (generatedCharts.length > 0) {
        setCharts(generatedCharts);
        setHasUnsavedChanges(true);
      }
      
    } catch(e) {
      console.error('Auto generate error:', e);
      alert(
        'Auto generation failed. Please try manually.'
      );
    } finally {
      setIsAutoGenerating(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRefExcel} accept=".xlsx, .xls" style={{display:'none'}} onChange={handleFileUpload} />
      <input type="file" ref={fileInputRefCsv} accept=".csv" style={{display:'none'}} onChange={handleFileUpload} />

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-left">
          <button 
            className="back-btn" 
            onClick={() => {
              if (hasUnsavedChanges && charts.length > 0) {
                setShowSaveModal(true);
              } else {
                navigate('/');
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <span className="workspace-title">Report Workspace</span>
        </div>
        
        <div className="top-bar-right">
          <button
            onClick={() => {
              if (charts.length === 0) {
                alert('Generate at least one chart before saving.');
                return;
              }
              setShowSaveModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: hasUnsavedChanges && charts.length > 0 ? '#2563EB' : '#F1F5F9',
              color: hasUnsavedChanges && charts.length > 0 ? 'white' : '#475569',
              border: hasUnsavedChanges && charts.length > 0 ? 'none' : '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {hasUnsavedChanges && charts.length > 0 ? 'Save Report*' : 'Save Report'}
          </button>

          <select 
            className="dropdown-select" 
            value={datasetId ? 'Loaded' : 'Select dataset'} 
            onChange={() => {}}
          >
            <option value="Select dataset" disabled>Select dataset</option>
            {datasetId && <option value="Loaded">{datasetName || datasetId}</option>}
          </select>
          
        </div>
      </div>

      {/* NEW CUSTOM RIBBON SYSTEM */}
      <div className="custom-tab-bar">
        {['Home', 'Data', 'Visualize', 'Analytics', 'AI', 'Export'].map(tab => (
          <div 
            key={tab} 
            className={`custom-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'AI' ? 'NLQ & Insights' : tab}
          </div>
        ))}
      </div>
      
      <div className="custom-ribbon-content">
        {renderRibbonContent()}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content-area">
        <div className="canvas-and-results">
          {isAutoGenerating && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              zIndex: 1500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #E2E8F0',
                borderTop: '4px solid #7C3AED',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}/>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0F172A'
              }}>
                Auto Generating Dashboard
              </div>
              <div style={{
                fontSize: '13px',
                color: '#475569'
              }}>
                Cleaning data and generating 
                best visualizations...
              </div>
            </div>
          )}
          {/* Dashboard Canvas */}
          <div 
            className="dashboard-canvas"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedChart(null);
              }
            }}
          >
            {!datasetId ? (
              /* No dataset - show upload area */
              <div className="empty-state-container">
                <svg className="empty-icon" width="48" 
                  height="48" viewBox="0 0 24 24" 
                  fill="none" stroke="currentColor" 
                  strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <h3>Upload a dataset to start 
                  building your dashboard</h3>
                <p>Drag and drop data or use 
                  the upload options.</p>
                <div className="import-cards">
                  <div className="import-card" 
                    onClick={() => 
                      fileInputRefExcel.current?.click()
                    }>
                    <Icon path={icons.excel} />
                    <div className="import-text">
                      <div className="import-title">
                        Import Excel
                      </div>
                      <div className="import-subtitle">
                        Upload .xls/.xlsx files
                      </div>
                    </div>
                  </div>
                  <div className="import-card"
                    onClick={() => 
                      fileInputRefCsv.current?.click()
                    }>
                    <Icon path={icons.csv} />
                    <div className="import-text">
                      <div className="import-title">
                        Import CSV
                      </div>
                      <div className="import-subtitle">
                        Upload .csv files
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            ) : charts.length === 0 ? (
              /* Dataset loaded but no charts yet */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '400px',
                gap: '24px'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '800px',
                  padding: '32px',
                  background: '#FFFFFF',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '40px',
                    marginBottom: '12px'
                  }}>📊</div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#0F172A',
                    margin: '0 0 8px 0'
                  }}>
                    Dataset loaded — Ready to visualize
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    margin: '0 0 24px 0'
                  }}>
                    Your dataset has been loaded successfully. 
                    Use the Visualize tab or click a chart 
                    type below to generate your first 
                    visualization.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {[
                      { label: 'Bar Chart', icon: icons.bar, type: 'Bar Chart' },
                      { label: 'Line Chart', icon: icons.line, type: 'Line Chart' },
                      { label: 'Pie Chart', icon: icons.pie, type: 'Pie Chart' },
                      { label: 'Scatter Plot', icon: icons.scatter, type: 'Scatter Plot' },
                    ].map((chart, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedChartType(chart.type);
                          setIsChartModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px 20px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minWidth: '100px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#EFF6FF';
                          e.currentTarget.style.borderColor = '#2563EB';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                      >
                        <svg width="24" height="24" 
                          viewBox="0 0 24 24" fill="none" 
                          stroke="#2563EB" strokeWidth="1.5"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          dangerouslySetInnerHTML={{ 
                            __html: chart.icon 
                          }}
                        />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#0F172A'
                        }}>
                          {chart.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    marginTop: '16px'
                  }}>
                    Or use the Visualize tab for 
                    more chart types
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  width: '100%',
                  maxWidth: '800px'
                }}>
                  {[
                    {
                      icon: '🔍',
                      title: 'Explore Data',
                      desc: 'Use Data tab to view column statistics and dataset info'
                    },
                    {
                      icon: '🤖',
                      title: 'Ask AI',
                      desc: 'Use AI tab to query your data in natural language'
                    },
                    {
                      icon: '📈',
                      title: 'Run Analytics',
                      desc: 'Use Analytics tab for Forecast, Anomaly and Clustering'
                    },
                  ].map((tip, i) => (
                    <div key={i} style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        marginBottom: '8px'
                      }}>
                        {tip.icon}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0F172A',
                        marginBottom: '4px'
                      }}>
                        {tip.title}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#475569'
                      }}>
                        {tip.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (
              /* Charts exist - show grid */
              <div className="charts-grid" style={{
                display: 'grid',
                gridTemplateColumns: 
                  layout === '1' ? '1fr' :
                  layout === '2' ? 'repeat(2, 1fr)' :
                  layout === '3' ? 'repeat(3, 1fr)' :
                  'repeat(2, 1fr)',
                gap: '16px',
                padding: '16px'
              }}>
                {charts.map(chart => (
                  <div
                    key={chart.id}
                    className="chart-card"
                    onClick={() => setSelectedChart(chart)}
                    style={{
                      border: selectedChart?.id === chart.id
                        ? '2px solid #2563EB'
                        : '1px solid #E2E8F0',
                      boxShadow: selectedChart?.id === chart.id
                        ? '0 0 0 3px rgba(37,99,235,0.12)'
                        : '0 2px 6px rgba(15,23,42,0.04)',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      background: 'white',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div className="chart-card-header" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: '1px solid #F1F5F9'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {selectedChart?.id === chart.id && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            borderRadius: '4px',
                            fontWeight: '600',
                            border: '1px solid #BFDBFE'
                          }}>
                            Selected
                          </span>
                        )}
                        <span className="chart-card-title"
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#0F172A'
                          }}
                        >
                          {chart.title}
                        </span>
                      </div>
                      <button
                        className="chart-card-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCharts(prev =>
                            prev.filter(c => c.id !== chart.id)
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {chart.image ? (
                      <img
                        src={`data:image/png;base64,${chart.image}`}
                        alt={chart.title}
                        style={{
                          width: '100%',
                          height: '220px',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div className="chart-placeholder">
                        Loading chart...
                      </div>
                    )}
                    {chart.insight && (
                      <div className="chart-insight" style={{
                        fontSize: '12px',
                        color: '#475569',
                        lineHeight: '1.7',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        marginTop: '8px',
                        borderRadius: '0 0 6px 6px'
                      }}>
                        {chart.insight}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Panel (Below Canvas) */}
          {resultsPanel.isOpen && (
            <div className="results-panel">
              <div className="results-panel-header">
                <div className="results-title">{resultsPanel.title}</div>
                <div className="results-close" onClick={() => setResultsPanel({...resultsPanel, isOpen: false})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </div>
              <div className="results-content">
                {resultsPanel.status === 'loading' && (
                  <div className="results-loading">
                    Analyzing...
                  </div>
                )}
                {resultsPanel.status === 'error' && (
                  <div style={{ color: '#DC2626', fontSize: '13px' }}>
                    {resultsPanel.content}
                  </div>
                )}
                {resultsPanel.status === 'success' && (
                  <div>
                    {resultsPanel.image && (
                      <img 
                        src={resultsPanel.mimeType 
                          ? `data:${resultsPanel.mimeType};base64,${resultsPanel.image}`
                          : `data:image/png;base64,${resultsPanel.image}`
                        }
                        alt="Analysis result"
                        style={{ 
                          width: '100%', 
                          maxHeight: '200px', 
                          objectFit: 'contain',
                          marginBottom: '12px'
                        }}
                      />
                    )}
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#0F172A', 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {resultsPanel.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panels */}
        <div className="right-panels">


          {/* Visualizations */}
          <div className="panel-module">
            <div className="panel-module-header">
              <div className="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
                <span>Visualizations</span>
              </div>
              <button
                className="hide-btn"
                onClick={() => setShowVisualizationsPanel(!showVisualizationsPanel)}
              >
                {showVisualizationsPanel ? 'Hide' : 'Show'}
              </button>
            </div>
            {showVisualizationsPanel && (
              <div className="panel-module-content">
                <div className="viz-grid">
                  {[
                    { name: 'Bar', path: icons.bar },
                    { name: 'Line', path: icons.line },
                    { name: 'Pie', path: icons.pie },
                    { name: 'Area', path: icons.area },
                    { name: 'Histogram', path: icons.hist },
                    { name: 'Box Plot', path: icons.box },
                    { name: 'Scatter', path: icons.scatter },
                    { name: 'Heatmap', path: icons.heatmap },
                    { name: 'Donut', path: icons.donut },
                    { name: 'Bubble', path: icons.bubble },
                    { name: 'Waterfall', path: icons.waterfall },
                    { name: 'Funnel', path: icons.funnel },
                  ].map((vizType) => (
                    <div 
                      key={vizType.name}
                      className="viz-icon-box" 
                      title={vizType.name}
                      onClick={() => {
                        if (!datasetId) return;
                        setSelectedChartType(vizType.name);
                        setIsChartModalOpen(true);
                      }}
                      style={{ 
                        opacity: datasetId ? 1 : 0.4,
                        cursor: datasetId ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Icon path={vizType.path} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data */}
          <div className="panel-module flex-1">
            <div className="panel-module-header">
              <div className="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.6-4 3-9 3s-9-1.4-9-3"></path>
                  <path d="M3 5v14c0 1.6 4 3 9 3s9-1.4 9-3V5"></path>
                </svg>
                <span>Data</span>
              </div>
              <button
                className="hide-btn"
                onClick={() => setShowDataPanel(!showDataPanel)}
              >
                {showDataPanel ? 'Hide' : 'Show'}
              </button>
            </div>
            {showDataPanel && (
              <div className="panel-module-content">
                {columns.length === 0 ? (
                  <div className="no-data-text">No dataset selected.</div>
                ) : (
                  <div className="column-list">
                    {columns.map((col, idx) => (
                      <div key={idx} className="column-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        {col}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAGE TABS */}
      <div className="page-tabs">
        <div className="page-tab active">Page 1</div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="bottom-bar">
        <div className="bottom-left">
          Page 1
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#475569'
        }}>
          {selectedChart ? (
            <>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2563EB',
                display: 'inline-block'
              }}/>
              <span style={{
                color: '#2563EB',
                fontWeight: '500'
              }}>
                Selected: {selectedChart.title}
              </span>
              <span style={{
                color: '#94A3B8',
                fontSize: '11px'
              }}>
                (Analytics will use this chart)
              </span>
            </>
          ) : (
            <span style={{ color: '#94A3B8' }}>
              No visual selected — 
              click a chart to select it
            </span>
          )}
        </div>
      </div>

      {/* CHART CONFIGURATION MODAL */}
      {isChartModalOpen && (
        <div className="chart-modal-overlay">
          <div className="chart-modal-content">
            <div className="chart-modal-header">
              <div className="chart-modal-title">Configure Visual</div>
              <div className="chart-modal-close" onClick={() => setIsChartModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
            
            <div className="chart-modal-form">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Chart Type</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '14px' }}
                  value={selectedChartType} 
                  readOnly 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>X-axis</label>
                <select 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white' }}
                  onChange={(e) => setXAxis(e.target.value)}
                  value={xAxis}
                >
                  <option value="" disabled>Select column</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>Y-axis</label>
                <select 
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white' }}
                  onChange={(e) => setYAxis(e.target.value)}
                  value={yAxis}
                >
                  <option value="" disabled>Select column</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              
              <div className="chart-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn-cancel" onClick={() => setIsChartModalOpen(false)}>Cancel</button>
                <button 
                  className="btn-generate" 
                  onClick={handleGenerateChart}
                  disabled={!xAxis || !yAxis || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Visual"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIntelligenceModal && intelligenceData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '620px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              borderRadius: '16px 16px 0 0',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '6px'
                }}>
                  <svg width="22" height="22" 
                    viewBox="0 0 24 24" fill="none" 
                    stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'white',
                    margin: 0
                  }}>
                    Dataset Intelligence Report
                  </h2>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0
                }}>
                  {intelligenceData.name} — 
                  Automated analysis complete
                </p>
              </div>
            </div>

            <div style={{ padding: '28px' }}>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {[
                  {
                    label: 'Total Rows',
                    value: intelligenceData.rows
                      .toLocaleString(),
                    icon: '📊',
                    color: '#2563EB',
                    bg: '#EFF6FF'
                  },
                  {
                    label: 'Total Columns',
                    value: intelligenceData.columns,
                    icon: '📋',
                    color: '#7C3AED',
                    bg: '#F5F3FF'
                  },
                  {
                    label: 'Numeric Cols',
                    value: intelligenceData.numericCols,
                    icon: '🔢',
                    color: '#16A34A',
                    bg: '#F0FDF4'
                  },
                  {
                    label: 'Categorical',
                    value: intelligenceData
                      .categoricalCols,
                    icon: '🏷️',
                    color: '#D97706',
                    bg: '#FFFBEB'
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: item.bg,
                    border: `1px solid ${item.color}22`,
                    borderRadius: '10px',
                    padding: '16px 12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      marginBottom: '8px'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: item.color,
                      lineHeight: 1
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#475569',
                      marginTop: '6px',
                      fontWeight: '500'
                    }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Quality Section */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#F8FAFC',
                  padding: '12px 16px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" 
                    viewBox="0 0 24 24" fill="none" 
                    stroke="#2563EB" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0F172A'
                  }}>
                    Data Quality Check
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: (
                      intelligenceData.missingValues === 0 &&
                      intelligenceData.duplicates === 0 &&
                      intelligenceData.outliers === 0
                    ) ? '#DCFCE7' : '#FEF3C7',
                    color: (
                      intelligenceData.missingValues === 0 &&
                      intelligenceData.duplicates === 0 &&
                      intelligenceData.outliers === 0
                    ) ? '#16A34A' : '#D97706',
                    fontWeight: '600'
                  }}>
                    {(
                      intelligenceData.missingValues === 0 &&
                      intelligenceData.duplicates === 0 &&
                      intelligenceData.outliers === 0
                    ) ? '✓ Clean' : '⚠ Issues Found'}
                  </span>
                </div>
                {[
                  {
                    label: 'Missing Values',
                    value: intelligenceData.missingValues,
                    desc: intelligenceData.missingValues === 0
                      ? 'No missing values found'
                      : `${intelligenceData.missingValues} cells need attention`,
                    good: intelligenceData.missingValues === 0
                  },
                  {
                    label: 'Duplicate Rows',
                    value: intelligenceData.duplicates,
                    desc: intelligenceData.duplicates === 0
                      ? 'No duplicates detected'
                      : `${intelligenceData.duplicates} duplicate rows found`,
                    good: intelligenceData.duplicates === 0
                  },
                  {
                    label: 'Outliers Detected',
                    value: intelligenceData.outliers,
                    desc: intelligenceData.outliers === 0
                      ? 'All values within normal range'
                      : `${intelligenceData.outliers} outliers flagged`,
                    good: intelligenceData.outliers === 0
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: i < 2
                      ? '1px solid #F1F5F9'
                      : 'none',
                    background: 'white'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: item.good
                        ? '#DCFCE7' : '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontSize: '14px'
                    }}>
                      {item.good ? '✓' : '⚠'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0F172A'
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#475569',
                        marginTop: '2px'
                      }}>
                        {item.desc}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: item.good
                        ? '#16A34A' : '#D97706',
                      minWidth: '40px',
                      textAlign: 'right'
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Correlation Insights */}
              {intelligenceData.correlationInsights
                ?.length > 0 && (
                <div style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#F8FAFC',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16"
                      viewBox="0 0 24 24" fill="none"
                      stroke="#7C3AED" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}>
                      Correlation Insights
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      color: '#7C3AED',
                      fontWeight: '500'
                    }}>
                      {intelligenceData
                        .correlationInsights.length} found
                    </span>
                  </div>
                  {intelligenceData.correlationInsights
                    .slice(0, 4)
                    .map((insight, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 16px',
                      borderBottom: i < Math.min(3,
                        intelligenceData
                          .correlationInsights.length - 1)
                        ? '1px solid #F1F5F9'
                        : 'none',
                      background: 'white'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#7C3AED',
                        marginTop: '6px',
                        flexShrink: 0
                      }}/>
                      <span style={{
                        fontSize: '13px',
                        color: '#475569',
                        lineHeight: '1.5'
                      }}>
                        {typeof insight === 'string'
                          ? insight
                          : JSON.stringify(insight)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Success Message */}
              {intelligenceData.cleaned && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#16A34A'
                    }}>
                      Dataset Cleaned Successfully
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#166534',
                      marginTop: '2px'
                    }}>
                      Missing values filled, duplicates 
                      removed, data normalized
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                marginTop: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleCleanDataset}
                  disabled={isCleaning ||
                    intelligenceData.cleaned}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    background: intelligenceData.cleaned
                      ? '#F1F5F9' : 'white',
                    color: intelligenceData.cleaned
                      ? '#94A3B8' : '#0F172A',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: isCleaning ||
                      intelligenceData.cleaned
                      ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isCleaning ? (
                    <>⟳ Cleaning...</>
                  ) : intelligenceData.cleaned ? (
                    <>✓ Already Cleaned</>
                  ) : (
                    <>🧹 Clean Automatically</>
                  )}
                </button>

                <button
                  onClick={handleAutoGenerateDashboard}
                  disabled={isAutoGenerating}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isAutoGenerating
                      ? '#94A3B8' : '#7C3AED',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isAutoGenerating
                      ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isAutoGenerating ? (
                    <>⟳ Generating...</>
                  ) : (
                    <>✨ Auto Generate Dashboard</>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (
                      (intelligenceData.missingValues > 0 ||
                      intelligenceData.duplicates > 0 ||
                      intelligenceData.outliers > 0) &&
                      !intelligenceData.cleaned
                    ) {
                      alert(
                        'Please clean the dataset first before continuing.'
                      );
                      return;
                    }
                    setShowIntelligenceModal(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: (
                      intelligenceData.missingValues > 0 ||
                      intelligenceData.duplicates > 0 ||
                      intelligenceData.outliers > 0
                    ) && !intelligenceData.cleaned
                      ? '#94A3B8' : '#2563EB',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {(
                    intelligenceData.missingValues > 0 ||
                    intelligenceData.duplicates > 0 ||
                    intelligenceData.outliers > 0
                  ) && !intelligenceData.cleaned
                    ? 'Clean Data First →'
                    : 'Continue to Dashboard →'
                  }
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showDatasetInfoModal && datasetInfoData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '560px',
            maxWidth: '92vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              borderRadius: '16px 16px 0 0',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 0 4px 0'
                }}>
                  Dataset Information
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0
                }}>
                  {datasetInfoData.name}
                </p>
              </div>
              </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {[
                  {
                    label: 'Total Rows',
                    value: (datasetInfoData.row_count || 0)
                      .toLocaleString(),
                    color: '#2563EB',
                    bg: '#EFF6FF'
                  },
                  {
                    label: 'Total Columns',
                    value: datasetInfoData.column_count || 0,
                    color: '#7C3AED',
                    bg: '#F5F3FF'
                  },
                  {
                    label: 'File Type',
                    value: datasetInfoData.type || 'CSV',
                    color: '#16A34A',
                    bg: '#F0FDF4'
                  },
                  {
                    label: 'Uploaded',
                    value: datasetInfoData.uploaded_at
                      ? new Date(datasetInfoData.uploaded_at)
                        .toLocaleDateString()
                      : 'Today',
                    color: '#D97706',
                    bg: '#FFFBEB'
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: item.bg,
                    border: `1px solid ${item.color}22`,
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: item.color
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginTop: '4px'
                    }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#F8FAFC',
                  padding: '12px 16px',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F172A'
                }}>
                  Column Overview
                </div>
                {(datasetInfoData.columns_metadata || [])
                  .map((col, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: i < (datasetInfoData.columns_metadata.length - 1)
                      ? '1px solid #F1F5F9'
                      : 'none',
                    background: 'white'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: col.type === 'numeric'
                        ? '#EFF6FF'
                        : col.type === 'date'
                          ? '#FFFBEB'
                          : '#F5F3FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      {col.type === 'numeric'
                        ? '123'
                        : col.type === 'date'
                          ? '📅'
                          : 'Abc'}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      color: '#0F172A',
                      flex: 1
                    }}>
                      {col.name || col}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: col.type === 'numeric'
                        ? '#EFF6FF'
                        : col.type === 'date'
                          ? '#FFFBEB'
                          : '#F5F3FF',
                      color: col.type === 'numeric'
                        ? '#2563EB'
                        : col.type === 'date'
                          ? '#D97706'
                          : '#7C3AED',
                      fontWeight: '500'
                    }}>
                      {col.type || 'text'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => 
                    setShowDatasetInfoModal(false)
                  }
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#7C3AED',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showColumnStatsModal && columnStatsData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '750px',
            maxWidth: '95vw',
            maxHeight: '88vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              borderRadius: '16px 16px 0 0',
              padding: '24px 28px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 4px 0'
              }}>
                Column Statistics
              </h2>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0
              }}>
                Statistical summary of all columns 
                in the dataset
              </p>
            </div>

            <div style={{ padding: '24px' }}>

              {/* Summary cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {[
                  {
                    label: 'Total Columns',
                    value: columnStatsData.length,
                    color: '#16A34A',
                    bg: '#F0FDF4'
                  },
                  {
                    label: 'Numeric Columns',
                    value: columnStatsData.filter(
                      c => c.type === 'numeric'
                    ).length,
                    color: '#2563EB',
                    bg: '#EFF6FF'
                  },
                  {
                    label: 'Categorical Columns',
                    value: columnStatsData.filter(
                      c => c.type === 'categorical'
                    ).length,
                    color: '#7C3AED',
                    bg: '#F5F3FF'
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: item.bg,
                    border: `1px solid ${item.color}22`,
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: item.color
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginTop: '4px'
                    }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Numeric columns stats */}
              {columnStatsData.filter(
                c => c.type === 'numeric'
              ).length > 0 && (
                <div style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#EFF6FF',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E2E8F0',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2563EB'
                  }}>
                    Numeric Columns — Statistical Summary
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '13px'
                    }}>
                      <thead>
                        <tr style={{
                          background: '#F8FAFC'
                        }}>
                          {[
                            'Column',
                            'Missing',
                            'Unique Values',
                            'Min',
                            'Max',
                            'Mean',
                            'Std Dev'
                          ].map((h, i) => (
                            <th key={i} style={{
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontWeight: '600',
                              color: '#475569',
                              borderBottom: '1px solid #E2E8F0',
                              whiteSpace: 'nowrap'
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {columnStatsData
                          .filter(c => c.type === 'numeric')
                          .map((col, i) => (
                          <tr key={i} style={{
                            borderBottom: '1px solid #F1F5F9',
                            background: i%2===0
                              ? 'white' : '#FAFAFA'
                          }}>
                            <td style={{
                              padding: '10px 14px',
                              fontWeight: '600',
                              color: '#0F172A'
                            }}>
                              {col.name}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: (col.null_count||0) > 0
                                ? '#D97706' : '#16A34A',
                              fontWeight: '500'
                            }}>
                              {col.null_count || 0}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: '#475569'
                            }}>
                              {col.unique_count || '-'}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: '#2563EB',
                              fontWeight: '500'
                            }}>
                              {col.min !== undefined && col.min !== null
                                ? Number(col.min).toFixed(2)
                                : 'N/A'}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: '#2563EB',
                              fontWeight: '500'
                            }}>
                              {col.max !== undefined && col.max !== null
                                ? Number(col.max).toFixed(2)
                                : 'N/A'}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: '#7C3AED',
                              fontWeight: '500'
                            }}>
                              {col.mean !== undefined && col.mean !== null
                                ? Number(col.mean).toFixed(2)
                                : 'N/A'}
                            </td>
                            <td style={{
                              padding: '10px 14px',
                              color: '#475569'
                            }}>
                              {col.std !== undefined && col.std !== null
                                ? Number(col.std).toFixed(2)
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categorical columns */}
              {columnStatsData.filter(
                c => c.type === 'categorical'
              ).length > 0 && (
                <div style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#F5F3FF',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E2E8F0',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#7C3AED'
                  }}>
                    Categorical Columns — Summary
                  </div>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#F8FAFC'
                      }}>
                        {[
                          'Column',
                          'Missing',
                          'Unique Values',
                          'Type',
                          'Sample Values'
                        ].map((h, i) => (
                          <th key={i} style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#475569',
                            borderBottom: '1px solid #E2E8F0'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {columnStatsData
                        .filter(c => c.type === 'categorical')
                        .map((col, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: i%2===0
                            ? 'white' : '#FAFAFA'
                        }}>
                          <td style={{
                            padding: '10px 14px',
                            fontWeight: '600',
                            color: '#0F172A'
                          }}>
                            {col.name}
                          </td>
                          <td style={{
                            padding: '10px 14px',
                            color: (col.null_count||0) > 0
                              ? '#D97706' : '#16A34A',
                            fontWeight: '500'
                          }}>
                            {col.null_count || 0}
                          </td>
                          <td style={{
                            padding: '10px 14px',
                            color: '#475569'
                          }}>
                            {col.unique_count || '-'}
                          </td>
                          <td style={{
                            padding: '10px 14px'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: '#F5F3FF',
                              color: '#7C3AED',
                              fontWeight: '500'
                            }}>
                              categorical
                            </span>
                          </td>
                          <td style={{
                            padding: '10px 14px',
                            color: '#475569',
                            fontSize: '12px'
                          }}>
                            {col.sample_values
                              ? [...new Set(col.sample_values)]
                                  .slice(0, 3)
                                  .join(', ')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => 
                    setShowColumnStatsModal(false)
                  }
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#16A34A',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px',
            width: '440px',
            maxWidth: '90vw',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0F172A',
              margin: '0 0 8px 0'
            }}>
              Save Report
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#475569',
              margin: '0 0 24px 0'
            }}>
              Give your report a name to save it. It will appear in your Recent Reports on the home page.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#0F172A',
                marginBottom: '6px'
              }}>
                Report Name
              </label>
              <input
                type="text"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSaveReport(reportName);
                  }
                }}
                placeholder={`${datasetName || 'My'} Analysis Report`}
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '12px',
              color: '#475569'
            }}>
              <div style={{ marginBottom: '4px' }}>📊 Charts: {charts.length}</div>
              <div style={{ marginBottom: '4px' }}>📁 Dataset: {datasetName || 'None'}</div>
              <div>🕒 {new Date().toLocaleString()}</div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setReportName('');
                  navigate('/');
                }}
                style={{
                  padding: '10px 16px',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Don't Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setReportName('');
                }}
                style={{
                  padding: '10px 16px',
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveReport(reportName || `${datasetName || 'My'} Analysis Report`)}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
