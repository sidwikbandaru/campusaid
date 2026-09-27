import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquareCode,
  MapPin,
  TrendingUp,
  Award,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, student, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'study', label: 'Study Assistant', icon: MessageSquareCode },
    { id: 'roadmap', label: 'Career Roadmap', icon: MapPin },
    { id: 'skills', label: 'Skill Gap', icon: TrendingUp },
    { id: 'interview', label: 'Interview Prep', icon: Award }
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand-group" onClick={() => setActivePage('dashboard')}>
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">CampusAid AI</span>
            <span className="brand-subtitle">Student Support & Mentorship</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                id={`nav-${item.id}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Student Profile & Logout */}
        <div className="nav-user">
          <div className="user-badge" title={`${student?.branch || 'Student'} (${student?.year || ''})`}>
            <img
              src={student?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={student?.name || 'Student Avatar'}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{student?.name || 'Alex Rivera'}</span>
              <span className="user-role">{student?.year || '3rd Year'} • {student?.branch ? student.branch.split(' ')[0] : 'CS'}</span>
            </div>
          </div>

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

      {/* Mobile Bar */}
      <div className="nav-mobile-bar" style={{ display: 'none' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
