import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Award,
  Flame,
  Star,
  Zap
} from 'lucide-react';
import { getGamificationState, getBadgeDefinitions, getNextLevelInfo } from '../services/gamificationService';

export default function AnalyticsPage({ student }) {
  const [gam, setGam] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (student?.studentId) {
      setGam(getGamificationState(student.studentId));
    }
  }, [student?.studentId]);

  if (!gam) return null;

  const nextLevel = getNextLevelInfo(gam.level);
  const xpForNext = nextLevel ? nextLevel.xp - gam.totalXP : 0;
  const xpProgress = nextLevel ? Math.round(((gam.totalXP - (nextLevel.xp - (nextLevel.xp - (gam.totalXP)))) / (nextLevel.xp)) * 100) : 100;
  const badges = getBadgeDefinitions();
  const unlockedSet = new Set(gam.unlockedBadges);

  // Build weekly activity from xpHistory
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = Array(7).fill(0);
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  gam.xpHistory.forEach(entry => {
    if (entry.timestamp > weekAgo) {
      const day = new Date(entry.timestamp).getDay();
      weeklyData[day] += entry.xp;
    }
  });
  const maxWeekXP = Math.max(...weeklyData, 1);

  // Activity types breakdown
  const activityBreakdown = {};
  gam.xpHistory.forEach(entry => {
    const key = entry.action || 'OTHER';
    activityBreakdown[key] = (activityBreakdown[key] || 0) + entry.xp;
  });

  const activityColors = {
    STUDY_QUESTION: '#0EA5E9',
    ROADMAP_CHECKOFF: '#8B5CF6',
    INTERVIEW_COMPLETE: '#10B981',
    INTERVIEW_PERFECT: '#34D399',
    SKILL_LEVEL_UP: '#F59E0B',
    DAILY_LOGIN: '#6366F1',
    NOTE_SAVED: '#EC4899',
    RESUME_SCAN: '#06B6D4',
    FLASHCARD_SESSION: '#84CC16',
    STREAK_BONUS: '#EF4444',
  };

  const activityLabels = {
    STUDY_QUESTION: 'Study Questions',
    ROADMAP_CHECKOFF: 'Roadmap Skills',
    INTERVIEW_COMPLETE: 'Interviews',
    INTERVIEW_PERFECT: 'Perfect Scores',
    SKILL_LEVEL_UP: 'Skill Upgrades',
    DAILY_LOGIN: 'Daily Logins',
    NOTE_SAVED: 'Notes Saved',
    RESUME_SCAN: 'Resume Scans',
    FLASHCARD_SESSION: 'Flashcards',
    STREAK_BONUS: 'Streak Bonuses',
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="#0EA5E9" />
            Study Analytics & Progress
          </h1>
          <p className="page-desc">
            Track your learning streaks, XP progression, and achievement milestones.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-cyan"><Flame size={12} /> {gam.streak}-Day Streak</span>
          <span className="badge badge-indigo"><Star size={12} /> Level {gam.level}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {['overview', 'badges', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* XP & Level Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Total XP */}
            <div className="card" style={{ textAlign: 'center' }}>
              <Zap size={24} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FBBF24' }}>{gam.totalXP}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total XP Earned</div>
            </div>

            {/* Level */}
            <div className="card" style={{ textAlign: 'center' }}>
              <Star size={24} color="#8B5CF6" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A78BFA' }}>Lv.{gam.level}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{gam.title}</div>
            </div>

            {/* Streak */}
            <div className="card" style={{ textAlign: 'center' }}>
              <Flame size={24} color="#EF4444" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F87171' }}>{gam.streak}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Day Streak</div>
            </div>

            {/* Badges */}
            <div className="card" style={{ textAlign: 'center' }}>
              <Award size={24} color="#10B981" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399' }}>{gam.unlockedBadges.length}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Badges Unlocked</div>
            </div>
          </div>

          {/* XP to Next Level Bar */}
          {nextLevel && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Progress to Level {nextLevel.level}: {nextLevel.title}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{xpForNext > 0 ? `${xpForNext} XP needed` : 'Maxed!'}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, xpProgress))}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
              </div>
            </div>
          )}

          {/* Weekly Activity Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--accent-learning)" />
              Weekly XP Activity
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '140px', padding: '0 0.5rem' }}>
              {weeklyData.map((xp, i) => {
                const height = Math.max(8, (xp / maxWeekXP) * 120);
                const isToday = new Date().getDay() === i;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{xp > 0 ? `${xp}` : ''}</span>
                    <div style={{
                      width: '100%',
                      maxWidth: '48px',
                      height: `${height}px`,
                      borderRadius: '6px 6px 3px 3px',
                      background: isToday
                        ? 'linear-gradient(180deg, #6366F1, #4F46E5)'
                        : xp > 0 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255,255,255,0.06)',
                      transition: 'height 0.4s ease',
                    }} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? '#A5B4FC' : 'var(--text-muted)',
                    }}>
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#F59E0B" />
              XP by Activity Type
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(activityBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([action, xp]) => {
                  const totalXP = gam.totalXP || 1;
                  const pct = Math.round((xp / totalXP) * 100);
                  return (
                    <div key={action}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{activityLabels[action] || action}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{xp} XP ({pct}%)</span>
                      </div>
                      <div className="progress-bar-track" style={{ height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: activityColors[action] || '#6366F1' }} />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(activityBreakdown).length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                  No activity recorded yet. Start studying to earn XP!
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {badges.map(badge => {
            const unlocked = unlockedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  opacity: unlocked ? 1 : 0.45,
                  border: unlocked ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                  background: unlocked ? 'rgba(16, 185, 129, 0.05)' : undefined,
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{badge.name}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{badge.desc}</p>
                {unlocked && (
                  <span className="badge badge-emerald" style={{ marginTop: '0.75rem' }}>Unlocked ✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent-learning)" />
            Recent XP Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {gam.xpHistory.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No XP activity yet. Start using CampusAid features to earn XP!
              </p>
            )}
            {[...gam.xpHistory].reverse().slice(0, 30).map((entry, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: activityColors[entry.action] || '#6366F1'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {activityLabels[entry.action] || entry.action}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FBBF24' }}>+{entry.xp} XP</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
