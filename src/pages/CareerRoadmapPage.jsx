import React, { useState, useEffect } from 'react';
import { getSavedRoadmap, updateRoadmapSkill, generateRoadmap } from '../services/roadmapService';
import {
  MapPin,
  CheckCircle2,
  Circle,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';

export default function CareerRoadmapPage({ student }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(student?.careerGoal || "Cloud & DevOps Solutions Architect");

  useEffect(() => {
    getSavedRoadmap(student?.studentId)
      .then((data) => {
        setRoadmap(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching roadmap:", err);
        setLoading(false);
      });
  }, [student?.studentId]);

  const handleToggleSkill = async (phaseIndex, itemIndex, currentDone) => {
    if (!roadmap) return;
    const newDone = !currentDone;

    // Optimistic UI update
    const updatedPhases = [...roadmap.phases];
    updatedPhases[phaseIndex].items[itemIndex].done = newDone;
    setRoadmap({ ...roadmap, phases: updatedPhases });

    try {
      await updateRoadmapSkill(student?.studentId, roadmap.roadmapId, phaseIndex, itemIndex, newDone);
    } catch (err) {
      console.error("Failed to update skill status:", err);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newRoadmap = await generateRoadmap(student?.year, student?.branch, selectedGoal, student?.studentId);
      setRoadmap(newRoadmap);
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Calculate statistics
  let totalSkills = 0;
  let completedSkills = 0;
  if (roadmap && roadmap.phases) {
    roadmap.phases.forEach((phase) => {
      phase.items.forEach((item) => {
        totalSkills++;
        if (item.done) completedSkills++;
      });
    });
  }
  const overallPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  return (
    <div className="career-roadmap-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <MapPin size={26} color="var(--accent-career)" />
            Career Milestone Roadmap
          </h1>
          <p className="page-desc">
            Phased technical roadmap tailored to your graduation year and target role. Check off skills as you learn them.
          </p>
        </div>

        {/* Total Completion Progress Badge */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#C4B5FD', fontWeight: 600 }}>
              Milestone Progress
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {completedSkills} / {totalSkills} Skills ({overallPercent}%)
            </div>
          </div>
          <div style={{ width: '60px' }}>
            <div className="progress-bar-track" style={{ height: '8px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${overallPercent}%`, background: 'var(--accent-career)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Target Role & Regeneration Bar */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Target Career Track:
          </span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '280px', padding: '0.45rem 0.85rem' }}
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            id="roadmap-goal-select"
          >
            <option value="Cloud & DevOps Solutions Architect">Cloud & DevOps Solutions Architect</option>
            <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
            <option value="Full Stack Web Developer">Full Stack Web Developer</option>
          </select>
        </div>

        <button
          onClick={handleRegenerate}
          className="btn btn-secondary btn-sm"
          disabled={isRegenerating}
          id="btn-regenerate-roadmap"
        >
          <RefreshCw size={14} className={isRegenerating ? 'spin' : ''} />
          <span>{isRegenerating ? 'Regenerating with Bedrock...' : 'Regenerate Roadmap'}</span>
        </button>
      </div>

      {/* Phases Timeline */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: '#8B5CF6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading roadmap from DynamoDB...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {roadmap?.phases?.map((phase, pIdx) => {
            const phaseTotal = phase.items.length;
            const phaseDone = phase.items.filter((i) => i.done).length;
            const phasePercent = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
            const isAllDone = phasePercent === 100;

            return (
              <div
                key={pIdx}
                className="card"
                style={{
                  borderLeft: isAllDone ? '4px solid #10B981' : '4px solid #8B5CF6',
                  transition: 'border-color 0.3s ease'
                }}
              >
                {/* Phase Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: isAllDone ? '#34D399' : '#A78BFA'
                    }}>
                      Stage 0{pIdx + 1}
                    </span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {phase.name}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {phaseDone} / {phaseTotal} completed ({phasePercent}%)
                    </span>
                    {isAllDone && (
                      <span className="badge badge-emerald">
                        Phase Mastered 🎉
                      </span>
                    )}
                  </div>
                </div>

                {/* Phase Progress Bar */}
                <div className="progress-bar-track" style={{ marginBottom: '1.25rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${phasePercent}%`,
                      background: isAllDone ? 'var(--accent-interview)' : 'var(--accent-career)'
                    }}
                  />
                </div>

                {/* Skills Checkbox Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {phase.items.map((item, itemIdx) => (
                    <label
                      key={itemIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: item.done ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: item.done ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      id={`skill-phase-${pIdx}-item-${itemIdx}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleSkill(pIdx, itemIdx, item.done)}
                        style={{ display: 'none' }}
                      />

                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: item.done ? 'none' : '2px solid var(--text-muted)',
                        background: item.done ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {item.done && <CheckCircle2 size={15} />}
                      </div>

                      <span style={{
                        fontSize: '0.88rem',
                        color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)',
                        textDecoration: item.done ? 'line-through' : 'none',
                        opacity: item.done ? 0.8 : 1,
                        fontWeight: item.done ? 500 : 400
                      }}>
                        {item.skill}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
