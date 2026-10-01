import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TopBar = ({ searchTerm = '', setSearchTerm = () => {} }) => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem("cms_notices_list");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  const isAudienceAllowed = (aud) => {
    if (!aud) return true;
    const a = aud.trim().toLowerCase();
    if (roleId === 2) return true;
    if (roleId === 4) {
      return a === "everyone" || a === "all students" || a === "final year students" || a === "all students & staff";
    }
    if (roleId === 3) {
      return a === "everyone" || a === "all professors" || a === "faculty" || a === "all students & staff" || a === "staff";
    }
    if (roleId === 1) {
      return a === "everyone" || a === "hod only" || a === "all professors" || a === "faculty" || a === "all students & staff" || a === "staff";
    }
    return a === "everyone" || a === "all students & staff" || a === "staff";
  };

  const visibleNotices = notices.filter(n => isAudienceAllowed(n.audience));

  useEffect(() => {
    const handleNoticeUpdate = (e) => {
      if (e.detail) {
        setNotices(e.detail);
      }
    };
    window.addEventListener("cms_notices_updated", handleNoticeUpdate);
    return () => window.removeEventListener("cms_notices_updated", handleNoticeUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <>
      <style>{`
        @keyframes cmsDropdownFade {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 26px',
        backgroundColor: themeStyles.barBg,
        color: themeStyles.textPrimary,
        borderRadius: '20px',
        marginBottom: '26px',
        boxShadow: themeStyles.shadow,
        border: themeStyles.border,
        transition: 'all 0.3s ease',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        position: 'relative',
        zIndex: 50
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: themeStyles.searchBg,
          padding: '10px 18px',
          borderRadius: '14px',
          width: '360px',
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

        {/* Right Section: Notification Bell + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          {/* Bell Notification Icon with Badge */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: themeStyles.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                cursor: 'pointer',
                color: 'inherit',
                transition: 'all 0.2s ease'
              }}
              title="Recent Circulars"
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Bell size={20} />
            </button>

            {visibleNotices.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#ef4444',
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
                {visibleNotices.length > 9 ? '9+' : visibleNotices.length}
              </span>
            )}

            {/* Notifications Dropdown */}
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
                  borderRadius: '18px',
                  padding: '18px',
                  zIndex: 1000,
                  border: themeStyles.border,
                  animation: 'cmsDropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9'
                }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Recent Circulars</h4>
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/notice-board'); }}
                    style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {visibleNotices.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: themeStyles.textMuted }}>
                      No circulars for you right now
                    </div>
                  ) : (
                    visibleNotices.slice(0, 4).map((item) => (
                      <div
                        key={item.notice_id || item.id}
                        onClick={() => { setShowNotifications(false); navigate('/notice-board'); }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                          cursor: 'pointer',
                          borderLeft: `3px solid ${item.category === 'Urgent' ? '#ef4444' : '#f59e0b'}`
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '700', color: themeStyles.textPrimary }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: themeStyles.textMuted, marginTop: '2px' }}>
                          {item.created_date || item.date || "Recent"} • {item.category}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: themeStyles.iconBg,
              border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Theme"
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {darkMode ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
          </button>

        </div>
      </div>
    </>
  );
};

export default TopBar;