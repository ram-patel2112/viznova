import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { uploadDataset } from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const fileInputRefCsv = useRef(null);
  const fileInputRefExcel = useRef(null);
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [section1Open, setSection1Open] = useState(true);
  const [section2Open, setSection2Open] = useState(true);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

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
      }
    } catch(e) {
      console.error('Delete error:', e);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(
        'http://localhost:8000/upload',
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      navigate(`/dashboard?datasetId=${data.id}`);
    } catch(err) {
      alert('Failed to upload dataset.');
    } finally {
      event.target.value = null;
    }
  };

  const filteredReports = recentReports.filter(r =>
    r.name?.toLowerCase().includes(
      searchKeyword.toLowerCase()
    ) ||
    r.dataset_name?.toLowerCase().includes(
      searchKeyword.toLowerCase()
    )
  );

  const ModalOverlay = ({ onClose, children }) => (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="home-layout">
      <Sidebar activeTab={activeTab} 
        onTabChange={setActiveTab} />
      
      <div className="main-content">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* SECTION 1 - DATA SOURCES */}
            <div className="section">
              <div 
                className="section-title-row"
                onClick={() => 
                  setSection1Open(!section1Open)
                }
                style={{ cursor: 'pointer' }}
              >
                <svg 
                  className="chevron-icon" 
                  width="20" height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    transform: section1Open 
                      ? 'rotate(0deg)' 
                      : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <h2>Select a data source or start with a blank report</h2>
              </div>

              {section1Open && (
                <div className="cards-container">
                  <div className="data-card" 
                    onClick={() => navigate('/dashboard')}>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#2563EB" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <span>Blank report</span>
                  </div>

                  <div className="data-card" 
                    onClick={() => 
                      fileInputRefCsv.current?.click()
                    }>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#10B981" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Upload CSV</span>
                    <input 
                      type="file" 
                      ref={fileInputRefCsv} 
                      accept=".csv" 
                      style={{ display: 'none' }} 
                      onChange={handleFileUpload} 
                    />
                  </div>

                  <div className="data-card" 
                    onClick={() => 
                      fileInputRefExcel.current?.click()
                    }>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#16A34A" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <path d="M9 13l3 3m0-3l-3 3"/>
                    </svg>
                    <span>Excel workbook</span>
                    <input 
                      type="file" 
                      ref={fileInputRefExcel} 
                      accept=".xlsx,.xls" 
                      style={{ display: 'none' }} 
                      onChange={handleFileUpload} 
                    />
                  </div>

                  <div className="data-card" 
                    onClick={() => 
                      setShowSQLModal(true)
                    }>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#475569" strokeWidth="1.5">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    <span>SQL Server</span>
                  </div>

                  <div className="data-card" 
                    onClick={() => 
                      setShowSampleModal(true)
                    }>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#8B5CF6" strokeWidth="1.5">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <span>Learn with sample data</span>
                  </div>

                  <div className="data-card" 
                    onClick={() => 
                      setShowOtherModal(true)
                    }>
                    <svg width="32" height="32" 
                      viewBox="0 0 24 24" fill="none" 
                      stroke="#0EA5E9" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>Get data from other sources</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2 - RECOMMENDED */}
            <div className="section">
              <div 
                className="section-title-row"
                onClick={() => 
                  setSection2Open(!section2Open)
                }
                style={{ cursor: 'pointer' }}
              >
                <svg 
                  className="chevron-icon" 
                  width="20" height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    transform: section2Open 
                      ? 'rotate(0deg)' 
                      : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <h2>Recommended</h2>
              </div>

              {section2Open && (
                <div className="recommended-container">
                  <div className="rec-card" 
                    onClick={() => 
                      setShowOverviewModal(true)
                    }
                    style={{ cursor: 'pointer' }}>
                    <div className="rec-top-label">
                      Getting started
                    </div>
                    <div className="rec-inner-box">
                      Intro — What is VIZNOVA?
                    </div>
                    <div className="rec-bottom-label">
                      Open overview
                    </div>
                  </div>

                  <div className="rec-card" 
                    onClick={() => 
                      setShowGuideModal(true)
                    }
                    style={{ cursor: 'pointer' }}>
                    <div className="rec-top-label">
                      Getting started
                    </div>
                    <div className="rec-inner-box">
                      Build your first report
                    </div>
                    <div className="rec-bottom-label">
                      Open guide
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3 - RECENT REPORTS */}
            <div className="section">
              <div className="recent-header">
                <div className="recent-tabs">
                  <button className="tab-btn active">
                    Recent Reports
                  </button>
                </div>
                <div className="recent-actions">
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="14" height="14"
                      viewBox="0 0 24 24" fill="none"
                      stroke="#94A3B8" strokeWidth="2"
                      style={{
                        position: 'absolute',
                        left: '10px'
                      }}>
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search reports..."
                      className="search-input"
                      value={searchKeyword}
                      onChange={e =>
                        setSearchKeyword(e.target.value)
                      }
                      style={{
                        paddingLeft: '32px',
                        paddingRight: searchKeyword
                          ? '32px' : '12px'
                      }}
                    />
                    {searchKeyword && (
                      <button
                        onClick={() => setSearchKeyword('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          fontSize: '16px',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
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
                ) : filteredReports.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: '#475569'
                  }}>
                    <div style={{ 
                      fontSize: '32px', 
                      marginBottom: '8px' 
                    }}>
                      {searchKeyword ? '🔍' : '📋'}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '500' 
                    }}>
                      {searchKeyword 
                        ? `No reports found for "${searchKeyword}"`
                        : 'No saved reports yet'
                      }
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      marginTop: '4px' 
                    }}>
                      {searchKeyword
                        ? 'Try a different keyword'
                        : 'Upload a dataset and save your analysis to see it here'
                      }
                    </div>
                  </div>
                ) : (
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{ 
                        background: '#F1F5F9' 
                      }}>
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
                      {filteredReports.map((report, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e =>
                          e.currentTarget.style.background = '#F8FAFC'
                        }
                        onMouseLeave={e =>
                          e.currentTarget.style.background = 'white'
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
                              <span style={{ 
                                fontSize: '16px' 
                              }}>📋</span>
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
          </>
        )}

        {/* OPEN TAB */}
        {activeTab === 'open' && (
          <div className="section">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0F172A',
                margin: 0
              }}>
                Open a Report
              </h2>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchKeyword}
                onChange={e => 
                  setSearchKeyword(e.target.value)
                }
                style={{
                  padding: '8px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  width: '240px',
                  outline: 'none'
                }}
              />
            </div>

            {isLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                color: '#475569'
              }}>
                Loading reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px',
                color: '#475569'
              }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  📂
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#0F172A'
                }}>
                  {searchKeyword 
                    ? `No reports found for "${searchKeyword}"`
                    : 'No saved reports yet'
                  }
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#475569',
                  marginBottom: '24px'
                }}>
                  {searchKeyword
                    ? 'Try a different search term'
                    : 'Go to Home tab, upload a dataset and save your analysis'
                  }
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{
                    padding: '10px 24px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Go to Home
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 
                  'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {filteredReports.map((report, i) => (
                  <div key={i} style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        📊
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: '#94A3B8',
                        marginTop: '4px'
                      }}>
                        {report.updated_at
                          ? new Date(report.updated_at)
                              .toLocaleDateString()
                          : 'Today'}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0F172A',
                      marginBottom: '6px'
                    }}>
                      {report.name}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginBottom: '16px'
                    }}>
                      {report.dataset_name || 'No dataset'} 
                      · {report.charts_count || 0} charts
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => navigate(
                          `/dashboard?reportId=${report.id}`
                        )}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#2563EB',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Open Report
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteReport(
                            report.id,
                            report.name
                          )
                        }
                        style={{
                          padding: '8px 12px',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* OVERVIEW MODAL */}
      {showOverviewModal && (
        <ModalOverlay 
          onClose={() => setShowOverviewModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              borderRadius: '16px 16px 0 0',
              padding: '28px 32px'
            }}>
              <h2 style={{
                color: 'white',
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                What is VIZNOVA?
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontSize: '13px'
              }}>
                Intelligent Data Analytics Platform
              </p>
            </div>
            <div style={{ padding: '28px 32px' }}>
              {[
                {
                  icon: '📊',
                  title: 'Self-Service Analytics',
                  desc: 'VIZNOVA is a Power BI-inspired platform that lets anyone upload datasets and generate professional visualizations without coding knowledge.'
                },
                {
                  icon: '🤖',
                  title: 'AI-Powered Insights',
                  desc: 'Ask questions in plain English using Natural Language Query. VIZNOVA understands your intent and generates the right chart automatically.'
                },
                {
                  icon: '📈',
                  title: 'Predictive Analytics',
                  desc: 'Built-in Forecast (Linear Regression), Anomaly Detection (Isolation Forest), and Clustering (K-Means) algorithms run directly on your data.'
                },
                {
                  icon: '💾',
                  title: 'Save & Restore Reports',
                  desc: 'Save your entire analysis session including all charts and insights. Restore everything exactly as you left it anytime.'
                },
                {
                  icon: '🎯',
                  title: 'No Pre-trained AI Models',
                  desc: 'VIZNOVA uses rule-based algorithms and statistical methods applied dynamically to your dataset — not generic pre-trained models.'
                }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0F172A',
                      marginBottom: '4px'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => 
                  setShowOverviewModal(false)
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* GUIDE MODAL */}
      {showGuideModal && (
        <ModalOverlay 
          onClose={() => setShowGuideModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              borderRadius: '16px 16px 0 0',
              padding: '28px 32px'
            }}>
              <h2 style={{
                color: 'white',
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                Build Your First Report
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontSize: '13px'
              }}>
                Step-by-step guide to get started
              </p>
            </div>
            <div style={{ padding: '28px 32px' }}>
              {[
                {
                  step: '1',
                  title: 'Upload a Dataset',
                  desc: 'Click "Upload CSV" or "Excel workbook" on the home page. Use the provided Cars_data.csv or example_sales.csv to get started quickly.',
                  color: '#2563EB'
                },
                {
                  step: '2',
                  title: 'Review Dataset Intelligence',
                  desc: 'After upload, a popup shows your dataset stats — rows, columns, data quality, and correlation insights. Click "Auto Generate Dashboard" for instant charts.',
                  color: '#7C3AED'
                },
                {
                  step: '3',
                  title: 'Generate Visualizations',
                  desc: 'Go to the Visualize tab in the ribbon. Select a chart type, choose X and Y axis columns, and click Generate Visual.',
                  color: '#059669'
                },
                {
                  step: '4',
                  title: 'Run Analytics',
                  desc: 'Click on any chart to select it (blue border). Then go to Analytics tab and run Forecast, Anomaly Detection, or Clustering on that specific chart.',
                  color: '#D97706'
                },
                {
                  step: '5',
                  title: 'Use AI Features',
                  desc: 'Go to AI tab and type a question like "Show Engine HP by Make". VIZNOVA will generate the right chart automatically.',
                  color: '#DC2626'
                },
                {
                  step: '6',
                  title: 'Save Your Report',
                  desc: 'Click "Save Report*" in the top bar when you have unsaved changes. Give your report a name — it will appear in Recent Reports.',
                  color: '#0891B2'
                }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: item.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0F172A',
                      marginBottom: '4px'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  navigate('/dashboard');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#7C3AED',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Start Building →
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* SQL SERVER MODAL */}
      {showSQLModal && (
        <ModalOverlay 
          onClose={() => setShowSQLModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '480px',
            maxWidth: '90vw',
            padding: '32px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px' }}>🗄️</div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0F172A',
                margin: '12px 0 8px 0'
              }}>
                SQL Server Connection
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#475569',
                margin: 0
              }}>
                Connect directly to your SQL Server database
              </p>
            </div>
            {[
              { label: 'Server Host', placeholder: 'e.g. localhost or 192.168.1.1' },
              { label: 'Database Name', placeholder: 'e.g. sales_db' },
              { label: 'Username', placeholder: 'e.g. sa' },
              { label: 'Password', placeholder: '••••••••', type: 'password' }
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#92400E'
            }}>
              ⚠️ SQL Server integration is planned for a future version. This UI is a preview of the upcoming feature.
            </div>
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowSQLModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
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
                onClick={() => {
                  alert('SQL Server connection coming in next version!');
                  setShowSQLModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Connect
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* SAMPLE DATA MODAL */}
      {showSampleModal && (
        <ModalOverlay 
          onClose={() => setShowSampleModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '520px',
            maxWidth: '90vw',
            padding: '32px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px' }}>📊</div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0F172A',
                margin: '12px 0 8px 0'
              }}>
                Learn with Sample Data
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#475569'
              }}>
                Choose a sample dataset to explore VIZNOVA
              </p>
            </div>
            {[
              {
                name: 'Cars Dataset',
                desc: '11,199 rows · 16 columns · Automotive data',
                icon: '🚗',
                file: 'Cars_data.csv',
                color: '#EFF6FF'
              },
              {
                name: 'Sales Dataset',
                desc: 'Sales performance data · Multiple regions',
                icon: '💼',
                file: 'example_sales.csv',
                color: '#F0FDF4'
              },
              {
                name: 'Employee Dataset',
                desc: 'HR and employee performance data',
                icon: '👥',
                file: 'Employees.xlsx',
                color: '#F5F3FF'
              },
              {
                name: 'European Bank Dataset',
                desc: 'Banking and financial transactions data',
                icon: '🏦',
                file: 'European_Bank.csv',
                color: '#FFFBEB'
              },
              {
                name: 'Analytics Dataset',
                desc: 'Web and product analytics data',
                icon: '📈',
                file: 'analytics.csv',
                color: '#F0FDF4'
              },
              {
                name: 'Sample Dataset',
                desc: '50 rows · Employee salary and performance',
                icon: '📋',
                file: 'sample.csv',
                color: '#FFF1F2'
              }
            ].map((sample, i) => (
              <div key={i}
                onClick={async () => {
                  setShowSampleModal(false);
                  try {
                    const response = await fetch(
                      `http://localhost:8000/sample/${sample.file}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      navigate(
                        `/dashboard?datasetId=${data.id}&showIntelligence=true&fromSample=true`
                      );
                    } else {
                      alert(
                        `Please upload ${sample.file} manually using Upload CSV.`
                      );
                    }
                  } catch(e) {
                    alert(
                      `Please upload ${sample.file} manually using Upload CSV.`
                    );
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: sample.color,
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ fontSize: '32px' }}>
                  {sample.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0F172A'
                  }}>
                    {sample.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#475569',
                    marginTop: '2px'
                  }}>
                    {sample.desc}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  color: '#2563EB',
                  fontSize: '20px'
                }}>
                  →
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowSampleModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#F1F5F9',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Cancel
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* OTHER SOURCES MODAL */}
      {showOtherModal && (
        <ModalOverlay 
          onClose={() => setShowOtherModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '520px',
            maxWidth: '90vw',
            padding: '32px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px' }}>🌐</div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0F172A',
                margin: '12px 0 8px 0'
              }}>
                Get Data from Other Sources
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#475569'
              }}>
                Planned integrations for future versions
              </p>
            </div>
            {[
              { icon: '🐘', name: 'PostgreSQL', status: 'Planned' },
              { icon: '🍃', name: 'MongoDB', status: 'Planned' },
              { icon: '☁️', name: 'Google Sheets', status: 'Planned' },
              { icon: '📦', name: 'Amazon S3', status: 'Planned' },
              { icon: '🔵', name: 'Azure Blob Storage', status: 'Planned' },
              { icon: '📡', name: 'REST API', status: 'Planned' }
            ].map((source, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                marginBottom: '8px',
                background: '#F8FAFC'
              }}>
                <span style={{ fontSize: '20px' }}>
                  {source.icon}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#0F172A',
                  flex: 1
                }}>
                  {source.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: '#FFFBEB',
                  color: '#D97706',
                  fontWeight: '500'
                }}>
                  {source.status}
                </span>
              </div>
            ))}
            <button
              onClick={() => setShowOtherModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Close
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default Home;
