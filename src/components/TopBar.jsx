import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, X, CheckCircle, AlertCircle, Info, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopBar = ({ searchTerm, setSearchTerm }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper to calculate relative time (e.g., Just now, 2m ago)
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // State for logs
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("cms_activity_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Real-time Event Listener for instant updates without page refresh
  useEffect(() => {
    const handleNewActivity = (e) => {
      setNotifications(e.detail);
    };

    window.addEventListener("cms_new_activity", handleNewActivity);
    return () => window.removeEventListener("cms_new_activity", handleNewActivity);
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("cms_activity_logs");
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      color: darkMode ? '#f8fafc' : '#1e293b',
      borderRadius: '12px',
      marginBottom: '25px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease'
    }}>
      {/* 1. Global Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: darkMode ? '#334155' : '#f1f5f9',
        padding: '8px 14px',
        borderRadius: '8px',
        width: '320px'
      }}>
        <Search size={18} style={{ marginRight: '10px', opacity: 0.6 }} />
        <input
          type="text"
          placeholder="Search card (e.g. Student, Fees)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'inherit',
            width: '100%',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <X
            size={16}
            style={{ cursor: 'pointer', opacity: 0.6 }}
            onClick={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* 2. Notification Bell & Dark Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>

        {/* Clickable Notification Bell Icon */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <div style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: darkMode ? '#334155' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} />
          </div>

          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: notifications.some(n => n.type === 'error') ? '#ef4444' : '#22c55e',
              color: '#fff',
              borderRadius: '50%',
              fontSize: '10px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: `2px solid ${darkMode ? '#1e293b' : '#ffffff'}`
            }}>
              {notifications.length}
            </span>
          )}

          {/* Activity Log Dropdown */}
          {showNotifications && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '350px',
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#f8fafc' : '#1e293b',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                borderRadius: '14px',
                padding: '16px',
                zIndex: 200,
                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Activity Logs</h4>
                  <span style={{
                    backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                    color: darkMode ? '#f8fafc' : '#475569',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    {notifications.length} Logs
                  </span>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '290px', overflowY: 'auto', marginTop: '10px' }}>
                {notifications.length > 0 ? (
                  notifications.map((item) => {
                    const isSuccess = item.type === 'success';
                    return (
                      <div key={item.id} style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        backgroundColor: isSuccess
                          ? (darkMode ? '#064e3b33' : '#f0fdf4')
                          : (darkMode ? '#7f1d1d33' : '#fef2f2'),
                        borderLeft: `4px solid ${isSuccess ? '#22c55e' : '#ef4444'}`,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{
                          color: isSuccess ? '#22c55e' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: isSuccess ? (darkMode ? '#4ade80' : '#15803d') : (darkMode ? '#f87171' : '#b91c1c')
                            }}>
                              {item.title}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {getRelativeTime(item.timestamp)}
                            </span>
                          </div>
                          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: darkMode ? '#cbd5e1' : '#475569', lineHeight: '1.4' }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '25px 10px', color: '#94a3b8', fontSize: '13px' }}>
                    <Info size={28} style={{ marginBottom: '6px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No past activity logs found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Theme Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'inherit'
          }}
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun size={22} color="#f59e0b" /> : <Moon size={22} color="#6366f1" />}
        </button>

      </div>
    </div>
  );
};

export default TopBar;