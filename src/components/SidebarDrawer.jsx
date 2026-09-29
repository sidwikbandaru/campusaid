import React, { useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquareCode,
  MapPin,
  TrendingUp,
  Award,
  FileText,
  BarChart3,
  CalendarDays,
  StickyNote,
  Bot,
  X,
  LogOut,
  Zap,
  Flame,
  ChevronRight
} from 'lucide-react';
import { getGamificationState } from '../services/gamificationService';

export default function SidebarDrawer({
  isOpen,
  onClose,
  activePage,
  setActivePage,
  student,
  onLogout
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'study', label: 'Study Assistant', icon: MessageSquareCode, category: 'Core' },
    { id: 'roadmap', label: 'Career Roadmap', icon: MapPin, category: 'Core' },
    { id: 'skills', label: 'Skill Gap Analysis', icon: TrendingUp, category: 'Core' },
    { id: 'interview', label: 'Interview Prep', icon: Award, category: 'Preparation' },
    { id: 'resume', label: 'Resume ATS Scanner', icon: FileText, category: 'Preparation' },
    { id: 'counselor', label: 'AI Career Counselor', icon: Bot, category: 'Preparation' },
    { id: 'analytics', label: 'Study Analytics & XP', icon: BarChart3, category: 'Productivity' },
    { id: 'planner', label: 'Weekly Study Planner', icon: CalendarDays, category: 'Productivity' },
    { id: 'notes', label: 'Notes & Bookmarks', icon: StickyNote, category: 'Productivity' },
  ];

  const gamState = student?.studentId ? getGamificationState(student.studentId) : null;

  const handleItemClick = (pageId) => {
    setActivePage(pageId);
    onClose();
  };

  return (
    <>
      {/* Blurred Backdrop - only rendered when open, does not disturb layout */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease-in-out',
        }}
        aria-hidden={!isOpen}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: isOpen ? '8px 0 36px rgba(0, 0, 0, 0.65)' : 'none',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'hidden'
        }}
        id="side-navigation-panel"
        aria-label="Navigation Drawer"
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                CampusAid AI
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Student Navigation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-theme-toggle"
            title="Close navigation panel"
            style={{ width: '32px', height: '32px', padding: 0 }}
            id="btn-close-drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student Mini Profile Info */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <img
            src={student?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
            alt={student?.name || 'Student'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(99, 102, 241, 0.35)'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {student?.name || 'Student'}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {student?.careerGoal || (student?.branch ? student.branch : 'Student')}
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                id={`drawer-nav-${item.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#A5B4FC' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} color={isActive ? '#818CF8' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer with Gamification stats & Logout */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {gamState && (
            <div
              onClick={() => handleItemClick('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                cursor: 'pointer'
              }}
              title="Click to view Study Analytics"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Zap size={14} color="#818CF8" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Level {gamState.level}: {gamState.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Flame size={12} /> {gamState.streak}d
                </span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#F87171',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            id="drawer-btn-logout"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
