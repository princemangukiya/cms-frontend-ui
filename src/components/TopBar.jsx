import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, X, CheckCircle, AlertCircle, Info, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopBar = ({ searchTerm = '', setSearchTerm = () => {} }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to calculate relative time
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
    try {
      const saved = localStorage.getItem("cms_activity_logs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Real-time Event Listener for instant updates
  useEffect(() => {
    const handleNewActivity = (e) => {
      if (e.detail) {
        setNotifications(e.detail);
      }
    };

    window.addEventListener("cms_new_activity", handleNewActivity);
    return () => window.removeEventListener("cms_new_activity", handleNewActivity);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("cms_activity_logs");
  };

  const themeStyles = {
    barBg: darkMode ? '#1e293b' : '#ffffff',
    textPrimary: darkMode ? '#f8fafc' : '#1e293b',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    searchBg: darkMode ? '#334155' : '#f1f5f9',
    iconBg: darkMode ? '#334155' : '#f1f5f9',
    dropdownBg: darkMode ? '#1e293b' : '#ffffff',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
    shadow: darkMode ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.06)'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px',
      backgroundColor: themeStyles.barBg,
      color: themeStyles.textPrimary,
      borderRadius: '16px',
      marginBottom: '25px',
      boxShadow: themeStyles.shadow,
      border: themeStyles.border,
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* 1. Global Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: themeStyles.searchBg,
        padding: '10px 16px',
        borderRadius: '12px',
        width: '340px',
        border: '1px solid transparent',
        transition: 'all 0.2s ease'
      }}>
        <Search size={18} style={{ marginRight: '10px', color: themeStyles.textMuted }} />
        <input
          type="text"
          placeholder="Search everywhere..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'inherit',
            width: '100%',
            fontSize: '14px',
            fontWeight: '500'
          }}
        />
        {searchTerm && (
          <X
            size={16}
            style={{ cursor: 'pointer', color: themeStyles.textMuted }}
            onClick={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* 2. Notification Bell & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }} ref={dropdownRef}>

        {/* Clickable Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '10px',
              borderRadius: '50%',
              backgroundColor: themeStyles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bell size={20} />
          </button>

          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              backgroundColor: notifications.some(n => n.type === 'error') ? '#ef4444' : '#22c55e',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '10px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              border: `2px solid ${themeStyles.barBg}`
            }}>
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}

          {/* Activity Log Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '54px',
                width: '360px',
                backgroundColor: themeStyles.dropdownBg,
                color: themeStyles.textPrimary,
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                borderRadius: '16px',
                padding: '18px',
                zIndex: 1000,
                border: themeStyles.border
              }}
            >
              {/* Dropdown Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Activity Logs</h4>
                  <span style={{
                    backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                    color: themeStyles.textPrimary,
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    {notifications.length}
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
                      fontWeight: '600'
                    }}
                  >
                    <Trash2 size={13} /> Clear All
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '12px' }}>
                {notifications.length > 0 ? (
                  notifications.map((item) => {
                    const isSuccess = item.type === 'success';
                    return (
                      <div key={item.id || Math.random()} style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        backgroundColor: isSuccess
                          ? (darkMode ? '#064e3b33' : '#f0fdf4')
                          : (darkMode ? '#7f1d1d33' : '#fef2f2'),
                        borderLeft: `4px solid ${isSuccess ? '#22c55e' : '#ef4444'}`
                      }}>
                        <div style={{
                          color: isSuccess ? '#22c55e' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '700',
                              color: isSuccess ? (darkMode ? '#4ade80' : '#15803d') : (darkMode ? '#f87171' : '#b91c1c')
                            }}>
                              {item.title}
                            </span>
                            <span style={{ fontSize: '10px', color: themeStyles.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {getRelativeTime(item.timestamp)}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: themeStyles.textMuted, lineHeight: '1.4' }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: themeStyles.textMuted, fontSize: '13px' }}>
                    <Info size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>No activity logs found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Theme Button */}
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: themeStyles.iconBg,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(15deg)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
        </button>

      </div>
    </div>
  );
};

export default TopBar;