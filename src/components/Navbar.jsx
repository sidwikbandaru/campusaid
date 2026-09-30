import React, { useState, useEffect } from 'react';
import {
  Menu,
  GraduationCap,
  Sun,
  Moon,
  Bell,
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react';
import { getUnreadCount } from '../services/notificationService';
import { isGeminiActive } from '../services/geminiService';

export default function Navbar({
  setActivePage,
  student,
  onLogout,
  onOpenProfile,
  theme,
  toggleTheme,
  onOpenNotifications,
  onOpenAiSettings,
  onOpenDrawer
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (student?.studentId) {
      setUnreadCount(getUnreadCount(student.studentId));
      const interval = setInterval(() => {
        setUnreadCount(getUnreadCount(student.studentId));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [student?.studentId]);

  return (
    <header className="navbar">
      <div className="nav-inner" style={{ maxWidth: '1440px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left Side: 3-line Menu Toggle & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={onOpenDrawer}
            className="btn-theme-toggle"
            title="Open features menu"
            id="btn-sidebar-toggle"
            aria-label="Open Navigation Menu"
            style={{
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Menu size={20} />
          </button>

          <div
            className="brand-group"
            onClick={() => setActivePage('dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon">
              <GraduationCap size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">CampusAid AI</span>
              <span className="brand-subtitle">Student Mentorship Platform</span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Engine, Theme Switcher, Notifications, Student Profile & Logout */}
        <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* AI Engine Settings / Gemini Trigger */}
          <button
            onClick={onOpenAiSettings}
            className="btn-theme-toggle"
            title="Configure Gemini AI Engine & API Key"
            id="btn-ai-settings"
            style={{
              background: isGeminiActive() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${isGeminiActive() ? 'rgba(16, 185, 129, 0.35)' : 'rgba(99, 102, 241, 0.3)'}`,
              color: isGeminiActive() ? '#10B981' : 'var(--accent-learning)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 0.6rem',
              fontSize: '0.76rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Sparkles size={14} />
            <span style={{ display: 'inline' }}>AI Engine</span>
          </button>

          {/* Light/Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="btn-theme-toggle"
          >
            {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#6366F1" />}
          </button>

          {/* Activity / Notification Center Bell */}
          <button
            onClick={onOpenNotifications}
            className="btn-theme-toggle"
            title="Activity Notifications"
            id="btn-notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: 'var(--accent-danger)',
                  color: '#FFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile Badge */}
          <div
            className="user-badge"
            title="Click to view & edit profile settings"
            onClick={onOpenProfile}
            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            id="nav-user-profile-badge"
          >
            <img
              src={student?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={student?.name || 'Student Avatar'}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{student?.name || 'Student'}</span>
              <span className="user-role">
                {student?.year || ''} {student?.branch ? '• ' + student.branch.split(' ')[0] : ''}
              </span>
            </div>
            <Settings size={13} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="btn-logout"
            title="Sign out of CampusAid"
            id="btn-logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
