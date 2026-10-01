import React, { useState, useEffect } from 'react';
import { getSavedRoadmap, updateRoadmapSkill, generateRoadmap, ROADMAP_TRACKS } from '../services/roadmapService';
import { awardXP } from '../services/gamificationService';
import CustomSelect from '../components/CustomSelect';
import {
  MapPin,
  CheckCircle2,
  RefreshCw,
  Rocket,
  Printer
} from 'lucide-react';

export default function CareerRoadmapPage({ student }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(student?.careerGoal || '');

  useEffect(() => {
    const goal = student?.careerGoal || '';
    setSelectedGoal(goal);

    getSavedRoadmap(student?.studentId, goal)
      .then((data) => {
        if (goal && (!data || (data.targetRole && data.targetRole.toLowerCase() !== goal.toLowerCase()))) {
          return generateRoadmap(student?.year, student?.branch, goal, student?.studentId);
        }
        return data;
      })
      .then((data) => {
        setRoadmap(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching roadmap:", err);
        setLoading(false);
      });
  }, [student?.studentId, student?.careerGoal, student?.year, student?.branch]);

  const handleToggleSkill = async (phaseIndex, itemIndex, currentDone) => {
    if (!roadmap) return;
    const newDone = !currentDone;

    // Optimistic UI update
    const updatedPhases = [...roadmap.phases];
    updatedPhases[phaseIndex].items[itemIndex].done = newDone;
    setRoadmap({ ...roadmap, phases: updatedPhases });

    if (newDone && student?.studentId) {
      awardXP(student.studentId, 'ROADMAP_CHECKOFF');
    }

    try {
      await updateRoadmapSkill(student?.studentId, roadmap.roadmapId, phaseIndex, itemIndex, newDone);
    } catch (err) {
      console.error("Failed to update skill status:", err);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedGoal) return;
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

        {/* Total Completion Progress Badge & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {roadmap && (
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="Print or Save as PDF"
              id="btn-export-roadmap"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.85rem' }}
            >
              <Printer size={15} color="var(--accent-career)" />
              <span>Export PDF</span>
            </button>
          )}

          {roadmap && (
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
          )}
        </div>
      </div>

      {/* Target Role & Generation Bar */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        position: 'relative',
        zIndex: 30,
        overflow: 'visible'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Target Career Track:
          </span>
          <div style={{ minWidth: '280px' }}>
            <CustomSelect
              id="roadmap-goal-select"
              value={selectedGoal}
              onChange={setSelectedGoal}
              options={ROADMAP_TRACKS.map((t) => ({ value: t, label: t }))}
              placeholder="Select your career track..."
            />
          </div>
        </div>

        <button
          onClick={handleGenerateRoadmap}
          className="btn btn-primary btn-sm"
          disabled={isRegenerating || !selectedGoal}
          id="btn-regenerate-roadmap"
          style={{ minWidth: '180px' }}
        >
          {roadmap ? (
            <>
              <RefreshCw size={14} className={isRegenerating ? 'spin' : ''} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Roadmap'}</span>
            </>
          ) : (
            <>
              <Rocket size={14} />
              <span>{isRegenerating ? 'Generating...' : 'Generate Roadmap'}</span>
            </>
          )}
        </button>
      </div>

      {/* Empty State: No Roadmap Yet */}
      {!loading && !roadmap && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          border: '2px dashed var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: '#A78BFA'
          }}>
            <MapPin size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            No Roadmap Generated Yet
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
            Select your target career track above and click <strong>"Generate Roadmap"</strong> to create a personalized multi-phase learning path with checkable milestones.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {ROADMAP_TRACKS.slice(0, 3).map((track) => (
              <span key={track} className="badge badge-indigo" style={{ cursor: 'pointer' }} onClick={() => {
                setSelectedGoal(track);
              }}>
                {track}
              </span>
            ))}
          </div>
        </div>
      )}

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
          <p style={{ color: 'var(--text-secondary)' }}>Loading roadmap...</p>
        </div>
      ) : roadmap && (
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
