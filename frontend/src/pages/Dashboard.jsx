import React, { useState, useRef } from 'react';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [datasetName, setDatasetName] = useState('');
  const [datasetId, setDatasetId] = useState(
    new URLSearchParams(location.search).get('datasetId')
  );

  const [activeTab, setActiveTab] = useState('Home');
  const [layout, setLayout] = useState('2 Columns');
  
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
      
      navigate(`/dashboard?datasetId=${data.id}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Make sure backend is running.');
    }
  };

  const handleAnalyze = async (title) => {
    if (!datasetId) return;
    
    setResultsPanel({ 
      isOpen: true, 
      title, 
      content: '', 
      status: 'loading' 
    });
    
    try {
      let response;
      let data;
      
      if (title === 'Forecast Analysis') {
        if (!selectedChart) {
          setResultsPanel({
            isOpen: true,
            title,
            content: 'Please select a chart first to run forecast.',
            status: 'error'
          });
          return;
        }
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/forecast?x=${encodeURIComponent(selectedChart.x)}&y=${encodeURIComponent(selectedChart.y)}&periods=5`
        );
        data = await response.json();
        setResultsPanel({
          isOpen: true,
          title: 'Forecast Analysis',
          content: data.explanation 
            || data.insight 
            || 'Forecast complete.',
          image: data.image_base64 || data.image || null,
          mimeType: data.mime_type || 'image/png',
          status: 'success'
        });
      }
      
      else if (title === 'Anomaly Detection') {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/anomalies`
        );
        data = await response.json();
        setResultsPanel({
          isOpen: true,
          title: 'Anomaly Detection',
          content: data.explanation 
            || data.insight 
            || 'Anomaly detection complete.',
          image: data.image_base64 || data.image || null,
          mimeType: data.mime_type || 'image/png',
          status: 'success'
        });
      }
      
      else if (title === 'K-Means Cluster') {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/clusters?k=3`
        );
        data = await response.json();
        setResultsPanel({
          isOpen: true,
          title: 'Clustering Analysis',
          content: data.explanation 
            || data.insight 
            || 'Clustering complete.',
          image: data.image_base64 || data.image || null,
          mimeType: data.mime_type || 'image/png',
          status: 'success'
        });
      }
      
      else if (title === 'Semantic Insight') {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        setResultsPanel({
          isOpen: true,
          title: 'Insight Story',
          content: data.story || 'No insights available.',
          status: 'success'
        });
      }
      
      else if (title === 'Natural Language Query') {
        if (!nlqQuery.trim()) return;
        
        const response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/query`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ query: nlqQuery })
          }
        );
        data = await response.json();
        
        const chartX = data.entities?.x_axis || '';
        const chartY = data.entities?.y_axis || '';
        const chartType = data.entities?.chart_type || 'bar';
        
        let chartImage = data.result?.image_base64 
          || data.result?.image 
          || null;
        
        if (!chartImage && chartX && chartY) {
          try {
            const imgResponse = await fetch(
              `http://localhost:8000/datasets/${datasetId}/chart-image?x=${encodeURIComponent(chartX)}&y=${encodeURIComponent(chartY)}&chart_type=${chartType}`
            );
            const imgData = await imgResponse.json();
            chartImage = imgData.image_base64 
              || imgData.image 
              || null;
          } catch (e) {
            console.log('Chart image fetch failed:', e);
          }
        }
        
        if (chartX && chartY) {
          const newChart = {
            id: Date.now(),
            title: data.result?.title 
              || `${chartType} - ${chartY} by ${chartX}`,
            image: chartImage,
            insight: data.result?.insight || '',
            chartType: chartType,
            x: chartX,
            y: chartY
          };
          setCharts(prev => [...prev, newChart]);
        }
        
        setResultsPanel({
          isOpen: true,
          title: 'Query Result',
          content: data.result?.insight || 
            'Query processed successfully.',
          status: 'success'
        });
        setNlqQuery('');
      }
      
      else if (title === 'Insight Story') {
        response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        setResultsPanel({
          isOpen: true,
          title: 'Insight Story',
          content: data.story || 'No story available.',
          status: 'success'
        });
      }
      
      else if (title === 'Smart Recommend') {
        const response = await fetch(
          `http://localhost:8000/datasets/${datasetId}/story`
        );
        data = await response.json();
        
        const numericCols = columns.filter(col => {
          const colObj = columns.find(c => c === col);
          return colObj;
        });
        
        const recommendations = [];
        
        if (columns.length >= 2) {
          recommendations.push(
            `Recommended Visualizations for your dataset:\n`
          );
          recommendations.push(
            `1. Bar Chart: Compare values across ${columns[0]} categories`
          );
          recommendations.push(
            `2. Line Chart: Show trends over time using ${columns[1]}`
          );
          if (columns.length >= 3) {
            recommendations.push(
              `3. Scatter Plot: Explore relationship between ${columns[1]} and ${columns[2]}`
            );
          }
          if (columns.length >= 4) {
            recommendations.push(
              `4. Pie Chart: Show distribution of ${columns[0]}`
            );
          }
          recommendations.push(
            `\nAI Story Analysis:\n${data.story || 'Analysis complete.'}`
          );
        }
        
        setResultsPanel({
          isOpen: true,
          title: 'Smart Recommendations',
          content: recommendations.join('\n') 
            || data.story 
            || 'No recommendations available.',
          status: 'success'
        });
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setResultsPanel({
        isOpen: true,
        title,
        content: `Error: ${error.message}`,
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
                <div style={{ fontSize: '12px', color: '#475569', padding: '0 8px' }}>
                  Customize report blocks
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
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
                  <Icon path={icons.info} />
                  <span>Dataset Info</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
                  <Icon path={icons.wand} />
                  <span>Clean Data</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
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
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
                  <Icon path={icons.pdf} />
                  <span>Export PDF</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
                  <Icon path={icons.img} />
                  <span>Export PNG</span>
                </div>
                <div className={`custom-ribbon-btn ${!datasetId ? 'disabled' : ''}`}>
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

  return (
    <div className="dashboard-layout">
      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRefExcel} accept=".xlsx, .xls" style={{display:'none'}} onChange={handleFileUpload} />
      <input type="file" ref={fileInputRefCsv} accept=".csv" style={{display:'none'}} onChange={handleFileUpload} />

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <span className="workspace-title">Report Workspace</span>
        </div>
        
        <div className="top-bar-right">
          <select 
            className="dropdown-select" 
            value={datasetId ? 'Loaded' : 'Select dataset'} 
            onChange={() => {}}
          >
            <option value="Select dataset" disabled>Select dataset</option>
            {datasetId && <option value="Loaded">{datasetName || datasetId}</option>}
          </select>
          
          <select 
            className="dropdown-select" 
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="1 Column">1 Column</option>
            <option value="2 Columns">2 Columns</option>
            <option value="3 Columns">3 Columns</option>
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
            {tab}
          </div>
        ))}
      </div>
      
      <div className="custom-ribbon-content">
        {renderRibbonContent()}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content-area">
        <div className="canvas-and-results">
          {/* Dashboard Canvas */}
          <div className="dashboard-canvas">
            {!datasetId && charts.length === 0 ? (
              <div className="empty-state-container">
                <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3>Upload a dataset to start building your dashboard</h3>
                <p>Drag and drop data or use the upload options.</p>
                
                <div className="import-cards">
                  <div className="import-card" onClick={() => fileInputRefExcel.current?.click()}>
                    <Icon path={icons.excel} color="#2563EB" />
                    <div className="import-text">
                      <div className="import-title">Import Excel</div>
                      <div className="import-subtitle">Upload .xls/.xlsx files</div>
                    </div>
                  </div>

                  <div className="import-card" onClick={() => fileInputRefCsv.current?.click()}>
                    <Icon path={icons.csv} color="#2563EB" />
                    <div className="import-text">
                      <div className="import-title">Import CSV</div>
                      <div className="import-subtitle">Upload .csv files</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`charts-grid grid-${layout.split(' ')[0]}`}>
                {charts.map(chart => (
                  <div 
                    key={chart.id} 
                    className={`chart-card ${selectedChart?.id === chart.id ? 'selected' : ''}`}
                    onClick={() => setSelectedChart(chart)}
                  >
                    <div className="chart-card-header">
                      <span className="chart-card-title">{chart.title}</span>
                      <button 
                        className="chart-card-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCharts(prev => 
                            prev.filter(c => c.id !== chart.id)
                          );
                          if (selectedChart?.id === chart.id) {
                            setSelectedChart(null);
                          }
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
          {/* Filters */}
          <div className="panel-module">
            <div className="panel-module-header">
              <div className="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>Filters</span>
              </div>
              <button className="hide-btn">Hide</button>
            </div>
            <div className="panel-module-content">
              <div className="filters-text">
                Filters can be applied in natural language queries<br/>
                Example: "show sales trend for 2024"
              </div>
            </div>
          </div>

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
              <button className="hide-btn">Hide</button>
            </div>
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
              <button className="hide-btn">Hide</button>
            </div>
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
        <div className="bottom-right">
          No visual selected
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

    </div>
  );
};

export default Dashboard;
