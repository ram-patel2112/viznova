import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { uploadDataset, getRecentDatasets, getSampleDataset } from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  if (!navigate) return null;

  const fileInputRefCsv = useRef(null);
  const fileInputRefExcel = useRef(null);
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/reports'
        );
        if (!response.ok) {
          setRecentReports([]);
          return;
        }
        const data = await response.json();
        setRecentReports(
          Array.isArray(data) ? data : []
        );
      } catch(e) {
        console.error(
          'Failed to fetch reports:', e
        );
        setRecentReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDeleteReport = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirmed) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/reports/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setRecentReports(prev =>
          prev.filter(r => r.id !== id)
        );
      } else {
        alert('Failed to delete report.');
      }
    } catch(e) {
      console.error('Delete error:', e);
      alert('Failed to delete report.');
    }
  };


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await uploadDataset(file);
      navigate(`/dashboard?datasetId=${res.data.id || 'uploaded'}`);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload dataset.");
    } finally {
      setLoading(false);
      event.target.value = null; // reset input
    }
  };

  const handleSampleDataset = async () => {
    setLoading(true);
    try {
      const res = await getSampleDataset();
      navigate(`/dashboard?datasetId=${res.data.id || 'sample'}`);
    } catch (err) {
      console.error("Failed to load sample dataset", err);
      // Even if it fails, maybe route or handle error
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        {/* SECTION 1 - DATA SOURCE CARDS */}
        <div className="section">
          <div className="section-title-row">
            <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <h2>Select a data source or start with a blank report</h2>
          </div>
          
          <div className="cards-container">
            {/* Card 1 */}
            <div className="data-card" onClick={() => navigate('/dashboard')}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Blank report</span>
            </div>

            {/* Card 2 */}
            <div className="data-card" onClick={() => fileInputRefCsv.current?.click()}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <text x="9" y="18" fontSize="6" fontWeight="bold">CSV</text>
              </svg>
              <span>Upload CSV</span>
              <input type="file" ref={fileInputRefCsv} accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            {/* Card 3 */}
            <div className="data-card" onClick={() => fileInputRefExcel.current?.click()}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M9 13l3 3m0-3l-3 3"></path>
              </svg>
              <span>Excel workbook</span>
              <input type="file" ref={fileInputRefExcel} accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            {/* Card 4 */}
            <div className="data-card tooltip-container">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              <span>SQL Server</span>
              <span className="tooltip">Coming soon</span>
            </div>

            {/* Card 5 */}
            <div className="data-card" onClick={handleSampleDataset}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Learn with sample data</span>
            </div>

            {/* Card 6 */}
            <div className="data-card tooltip-container">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Get data from other sources</span>
              <span className="tooltip">Coming soon</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 - RECOMMENDED */}
        <div className="section">
          <div className="section-title-row">
            <svg className="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <h2>Recommended</h2>
          </div>

          <div className="recommended-container">
            <div className="rec-card">
              <div className="rec-top-label">Getting started</div>
              <div className="rec-inner-box">
                Intro — What is VIZNOVA?
              </div>
              <div className="rec-bottom-label">Open overview</div>
            </div>

            <div className="rec-card">
              <div className="rec-top-label">Getting started</div>
              <div className="rec-inner-box">
                Build your first report
              </div>
              <div className="rec-bottom-label">Open guide</div>
            </div>
          </div>
        </div>

        {/* SECTION 3 - RECENT */}
        <div className="section">
          <div className="recent-header">
            <div className="recent-tabs">
              <button className="tab-btn active">Recent</button>
              <button className="tab-btn">Shared with me</button>
            </div>
            <div className="recent-actions">
              <input type="text" placeholder="Filter by keyword" className="search-input" />
              <button className="filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter
              </button>
            </div>
          </div>

          <div className="recent-content">
            {isLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                color: '#475569',
                fontSize: '13px'
              }}>
                Loading recent reports...
              </div>
            ) : recentReports.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#475569'
              }}>
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '8px' 
                }}>📋</div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>
                  No saved reports yet
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  marginTop: '4px' 
                }}>
                  Upload a dataset and save your 
                  analysis to see it here
                </div>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ background: '#F1F5F9' }}>
                    {[
                      'Report Name',
                      'Dataset',
                      'Charts',
                      'Saved',
                      'Action'
                    ].map((h, i) => (
                      <th key={i} style={{
                        padding: '10px 16px',
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
                  {recentReports.map((report, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background = 
                        '#F8FAFC'
                    }
                    onMouseLeave={e =>
                      e.currentTarget.style.background = 
                        'white'
                    }>
                      <td style={{
                        padding: '12px 16px',
                        fontWeight: '500',
                        color: '#0F172A'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            📋
                          </span>
                          {report.name}
                        </div>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: '#475569'
                      }}>
                        {report.dataset_name || '-'}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: '500'
                        }}>
                          {report.charts_count || 0} charts
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: '#475569'
                      }}>
                        {report.updated_at
                          ? new Date(report.updated_at)
                              .toLocaleDateString()
                          : 'Today'}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          <button
                            onClick={() => navigate(
                              `/dashboard?reportId=${report.id}`
                            )}
                            style={{
                              padding: '6px 14px',
                              background: '#2563EB',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Open
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteReport(
                                report.id, 
                                report.name
                              )
                            }
                            style={{
                              padding: '6px 10px',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete report"
                          >
                            <svg width="14" height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
