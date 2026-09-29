import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  ExternalLink,
  Flame,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll
} from '../services/notificationService';

export default function NotificationModal({ isOpen, onClose, studentId, onNavigate }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen && studentId) {
      setNotifications(getNotifications(studentId));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handleMarkRead = (id) => {
    const updated = markAsRead(studentId, id);
    setNotifications([...updated]);
  };

  const handleMarkAllRead = () => {
    const updated = markAllAsRead(studentId);
    setNotifications([...updated]);
  };

  const handleClearAll = () => {
    const updated = clearAll(studentId);
    setNotifications([...updated]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'streak':
        return <Flame size={16} color="#F59E0B" />;
      case 'xp':
        return <Zap size={16} color="#6366F1" />;
      case 'badge':
        return <Award size={16} color="#10B981" />;
      case 'study':
        return <BookOpen size={16} color="#0EA5E9" />;
      default:
        return <Bell size={16} color="#8B5CF6" />;
    }
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '4.5rem 1.5rem 1.5rem 1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          border: '1px solid var(--border-accent)',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={16} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Activity Center</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {notifications.filter(n => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  title="Mark all as read"
                >
                  <CheckCircle2 size={12} />
                  <span>Read all</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: 'var(--accent-danger)' }}
                  title="Clear all"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>All caught up!</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                Complete study questions, roadmap milestones, and interview prep to earn XP and alerts.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                  border: n.read ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.75rem',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ marginTop: '0.15rem' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    alignSelf: 'center'
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
