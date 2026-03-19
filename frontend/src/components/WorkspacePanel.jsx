import React from 'react';
import './WorkspacePanel.css';

const WorkspacePanel = ({ isOpen, onClose, columns = [] }) => {
  return (
    <>
      {isOpen && <div className="panel-overlay" onClick={onClose}></div>}
      <div className={`workspace-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>Workspace Panel</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="panel-content">
          {/* Section 1 - CHART GENERATOR */}
          <div className="panel-section">
            <div className="section-label">CHART GENERATOR</div>
            <button className="btn-primary full-width">Generate Visual</button>
          </div>
          <hr className="divider" />

          {/* Section 2 - CHART CONFIGURATION */}
          <div className="panel-section">
            <div className="section-label">CHART CONFIGURATION</div>
            
            <div className="form-group">
              <label>Selected Chart</label>
              <input type="text" readOnly value="No Chart Selected" />
            </div>

            <div className="form-group">
              <label>X-axis</label>
              <select defaultValue="">
                <option value="" disabled>Select column</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Y-axis</label>
              <select defaultValue="">
                <option value="" disabled>Select column</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Chart Type</label>
              <select defaultValue="Bar">
                <option value="Bar">Bar</option>
                <option value="Line">Line</option>
                <option value="Pie">Pie</option>
                <option value="Area">Area</option>
                <option value="Scatter">Scatter</option>
                <option value="Histogram">Histogram</option>
                <option value="Box Plot">Box Plot</option>
                <option value="Heatmap">Heatmap</option>
                <option value="Donut">Donut</option>
                <option value="Bubble">Bubble</option>
                <option value="Waterfall">Waterfall</option>
                <option value="Funnel">Funnel</option>
              </select>
            </div>

            <button className="btn-secondary full-width" disabled>Preview Visual</button>
          </div>
          <hr className="divider" />

          {/* Section 3 - AI INSIGHTS */}
          <div className="panel-section">
            <div className="section-label">AI INSIGHTS</div>
            
            <div className="info-box">
              Select a chart in the dashboard to run insights.
            </div>

            <div className="grid-2x2">
              <button className="btn-primary-small">Semantic Insight Engine</button>
              <button className="btn-secondary-small">Forecast</button>
              <button className="btn-secondary-small">Anomaly</button>
              <button className="btn-secondary-small">Clustering</button>
            </div>
          </div>
          <hr className="divider" />

          {/* Section 4 - NATURAL LANGUAGE QUERY */}
          <div className="panel-section">
            <div className="section-label">NATURAL LANGUAGE QUERY</div>
            <textarea 
              placeholder="Ask a question about your data...&#10;Example: Show sales trend by region"
              className="nlq-input"
            ></textarea>
            <button className="btn-primary full-width" disabled>Generate from Query</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspacePanel;
