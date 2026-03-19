import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkspacePanel from '../components/WorkspacePanel';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const datasetId = queryParams.get('datasetId');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [layout, setLayout] = useState('2 Columns');
  
  // Example dummy state for charts/columns
  const [charts, setCharts] = useState([]);
  const [columns, setColumns] = useState(datasetId ? ['Column A', 'Column B'] : []);
  
  // File inputs for Empty State
  const fileInputRefCsv = useRef(null);
  const fileInputRefExcel = useRef(null);

  const handleFileUpload = (event) => {
    // Basic handler for visual sake
    if (event.target.files && event.target.files.length > 0) {
      setColumns(['New Column 1', 'New Column 2']);
      navigate('/dashboard?datasetId=new_upload');
    }
  };

  const activeTab = 'Home'; // Hardcoded for layout logic

  return (
    <div className="dashboard-layout">
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
            value={datasetId ? 'Loaded Dataset' : 'Select dataset'} 
            onChange={() => {}}
          >
            <option value="Select dataset" disabled>Select dataset</option>
            {datasetId && <option value="Loaded Dataset">Loaded Dataset</option>}
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
          
          <button className="panel-toggle-btn" onClick={() => setIsPanelOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Workspace Panel
          </button>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="tab-bar">
        <div className="tab active">Home</div>
        <div className="tab">Insert</div>
        <div className="tab">Modeling</div>
        <div className="tab">View</div>
        <div className="tab">Help</div>
      </div>

      {/* RIBBON TOOLBAR */}
      <div className="ribbon-toolbar">
        {/* Data Group */}
        <div className="ribbon-group">
          <div className="ribbon-group-label">Data</div>
          <div className="ribbon-buttons">
            <div className="ribbon-btn" onClick={() => fileInputRefExcel.current?.click()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M9 13l3 3m0-3l-3 3"></path>
              </svg>
              <span>Excel workbook</span>
              <input type="file" ref={fileInputRefExcel} accept=".xlsx, .xls" style={{display:'none'}} onChange={handleFileUpload} />
            </div>
            <div className="ribbon-btn" onClick={() => fileInputRefCsv.current?.click()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <text x="9" y="18" fontSize="6" fontWeight="bold">CSV</text>
              </svg>
              <span>CSV file</span>
              <input type="file" ref={fileInputRefCsv} accept=".csv" style={{display:'none'}} onChange={handleFileUpload} />
            </div>
          </div>
        </div>

        {/* Insert Group */}
        <div className="ribbon-group">
          <div className="ribbon-group-label">Insert</div>
          <div className="ribbon-buttons">
            <div className="ribbon-btn" onClick={() => setIsPanelOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
              </svg>
              <span>New visual</span>
            </div>
          </div>
        </div>

        {/* Layout Group */}
        <div className="ribbon-group">
          <div className="ribbon-group-label">Layout</div>
          <div className="ribbon-text">
            Customize report blocks and manage chart cards.
          </div>
        </div>

        {/* Status Group */}
        <div className="ribbon-group ml-auto">
          <div className="ribbon-group-label">Status</div>
          <div className="status-badge-container">
            {!datasetId ? (
              <div className="status-badge warning">No dataset loaded</div>
            ) : (
              <div className="status-badge success">Loaded Dataset Info</div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content-area">
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 13l3 3m0-3l-3 3"></path>
                  </svg>
                  <div className="import-text">
                    <div className="import-title">Import Excel</div>
                    <div className="import-subtitle">Upload .xls/.xlsx files</div>
                  </div>
                </div>

                <div className="import-card" onClick={() => fileInputRefCsv.current?.click()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <div className="import-text">
                    <div className="import-title">Import CSV</div>
                    <div className="import-subtitle">Upload .csv files</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`charts-grid grid-${layout.split(' ')[0]}`}>
              {/* Sample chart card to show layout */}
              <div className="chart-card selected">
                <div className="chart-placeholder">Chart Preview Area</div>
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
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="viz-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
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
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
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

      <WorkspacePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        columns={columns}
      />
    </div>
  );
};

export default Dashboard;
