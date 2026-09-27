import React, { useState, useEffect } from 'react';
import { getSkillGaps, updateSkillLevel } from '../services/skillGapService';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles
} from 'lucide-react';

export default function SkillGapPage({ student }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSkill, setUpdatingSkill] = useState(null);

  useEffect(() => {
    getSkillGaps(student?.studentId)
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching skill gaps:", err);
        setLoading(false);
      });
  }, [student?.studentId]);

  const handleAdjustLevel = async (skillName, delta) => {
    const currentSkill = skills.find((s) => s.skillName === skillName);
    if (!currentSkill) return;

    const newLevel = Math.max(1, Math.min(5, currentSkill.currentLevel + delta));
    if (newLevel === currentSkill.currentLevel) return;

    setUpdatingSkill(skillName);
    try {
      const updated = await updateSkillLevel(student?.studentId, skillName, newLevel);
      setSkills((prev) =>
        prev.map((s) => (s.skillName === skillName ? { ...s, ...updated } : s))
      );
    } catch (err) {
      console.error("Error updating skill level:", err);
    } finally {
      setUpdatingSkill(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'mastered':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Target Met</span>;
      case 'in-progress':
        return <span className="badge badge-indigo"><TrendingUp size={12} /> In Progress</span>;
      case 'needs-focus':
        return <span className="badge badge-amber"><AlertCircle size={12} /> Needs Focus</span>;
      default:
        return <span className="badge badge-cyan">Not Started</span>;
    }
  };

  return (
    <div className="skill-gap-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingUp size={26} color="var(--accent-warning)" />
            Skill Gap Analysis
          </h1>
          <p className="page-desc">
            Horizontal comparison of your current proficiency vs the required target level for your role.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge badge-amber">5-Point Rubric (1: Novice → 5: Production Mastery)</span>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FBBF24'
          }}>
            <Target size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Proficiency Alignment Score</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Target Role: <strong>{student?.careerGoal || 'Cloud & DevOps Solutions Architect'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skills Analyzed</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{skills.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Met</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-interview)' }}>
              {skills.filter(s => s.currentLevel >= s.targetLevel).length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority Gaps</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {skills.filter(s => s.targetLevel - s.currentLevel >= 2).length}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Comparison List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {skills.map((skill) => {
          const currentPercent = (skill.currentLevel / 5) * 100;
          const targetPercent = (skill.targetLevel / 5) * 100;
          const gap = skill.targetLevel - skill.currentLevel;

          return (
            <div
              key={skill.skillName}
              className="card"
              style={{
                padding: '1.5rem',
                position: 'relative'
              }}
              id={`skill-card-${skill.skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {skill.skillName}
                    </h3>
                    {getStatusBadge(skill.status)}
                  </div>
                  {skill.notes && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {skill.notes}
                    </p>
                  )}
                </div>

                {/* Level Controls & Gap indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Current: <strong style={{ color: 'var(--text-primary)' }}>{skill.currentLevel}/5</strong>
                      <span style={{ margin: '0 0.35rem', color: 'var(--text-muted)' }}>|</span>
                      Target: <strong style={{ color: '#818CF8' }}>{skill.targetLevel}/5</strong>
                    </span>
                    <div style={{ fontSize: '0.72rem', color: gap > 0 ? '#FBBF24' : '#34D399', fontWeight: 600 }}>
                      {gap > 0 ? `Gap: +${gap} level${gap > 1 ? 's' : ''} required` : 'Target Achieved ✨'}
                    </div>
                  </div>

                  {/* Level increment/decrement buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <button
                      onClick={() => handleAdjustLevel(skill.skillName, -1)}
                      disabled={skill.currentLevel <= 1 || updatingSkill === skill.skillName}
                      className="btn"
                      style={{ padding: '0.35rem 0.55rem', background: 'transparent' }}
                      title="Decrease current level"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 0.4rem' }}>
                      {skill.currentLevel}
                    </span>
                    <button
                      onClick={() => handleAdjustLevel(skill.skillName, 1)}
                      disabled={skill.currentLevel >= 5 || updatingSkill === skill.skillName}
                      className="btn"
                      style={{ padding: '0.35rem 0.55rem', background: 'transparent' }}
                      title="Increase current level"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bars Comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Current Level Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <span>Your Current Proficiency</span>
                    <span>Level {skill.currentLevel} ({Math.round(currentPercent)}%)</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${currentPercent}%`,
                        background: skill.currentLevel >= skill.targetLevel
                          ? 'linear-gradient(90deg, #10B981, #059669)'
                          : 'linear-gradient(90deg, #6366F1, #4F46E5)'
                      }}
                    />
                  </div>
                </div>

                {/* Target Level Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#818CF8', marginBottom: '0.25rem' }}>
                    <span>Role Target Level</span>
                    <span>Level {skill.targetLevel} ({Math.round(targetPercent)}%)</span>
                  </div>
                  <div className="progress-bar-track" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${targetPercent}%`,
                        background: 'rgba(99, 102, 241, 0.4)',
                        borderRight: '2px solid #818CF8'
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
