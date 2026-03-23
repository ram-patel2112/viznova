import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '4px'
        }}>
          <img 
            src="/logo.png"
            alt="VIZNOVA"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain'
            }}
          />
        </div>
        <div
          className={`sidebar-item${activeTab === 'home' || !activeTab ? ' active' : ''}`}
          onClick={() => handleTabClick('home')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </div>
        <div
          className={`sidebar-item${activeTab === 'open' ? ' active' : ''}`}
          onClick={() => handleTabClick('open')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Open</span>
        </div>
      </div>
      <div className="sidebar-bottom">
        {/* Empty bottom section */}
      </div>
    </div>
  );
};

export default Sidebar;
