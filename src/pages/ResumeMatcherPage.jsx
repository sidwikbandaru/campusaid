import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
  Printer
} from 'lucide-react';
import { analyzeResume, SAMPLE_RESUME } from '../services/resumeService';
import { awardXP } from '../services/gamificationService';
import { ROADMAP_TRACKS } from '../services/roadmapService';
import CustomSelect from '../components/CustomSelect';

export default function ResumeMatcherPage({ student }) {
  const [targetRole, setTargetRole] = useState(student?.careerGoal || "Full Stack Web Developer");
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    if (student?.careerGoal) {
      setTargetRole(student.careerGoal);
    }
  }, [student?.careerGoal]);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeResume(resumeText, targetRole);
      setResult(data);
      if (student?.studentId) {
        awardXP(student.studentId, 'RESUME_SCAN');
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setResult(null);
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
  };

  return (
    <div className="resume-matcher-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={26} color="#818CF8" />
            AI Resume & ATS Keyword Scanner
          </h1>
          <p className="page-desc">
            Benchmark your resume markdown or text against industry hiring rubrics for your target role.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {result && (
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="Print or Save as PDF"
              id="btn-export-resume"
            >
              <Printer size={14} />
              <span>Export PDF</span>
            </button>
          )}
          <span className="badge badge-purple">
            Google XYZ & STAR Formatter
          </span>
        </div>
      </div>

      {/* Configuration & Input Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Target Job Role:
            </span>
            <div style={{ minWidth: '300px' }}>
              <CustomSelect
                id="resume-role-select"
                value={targetRole}
                onChange={setTargetRole}
                options={ROADMAP_TRACKS.map((t) => ({ value: t, label: t }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleLoadSample}
              className="btn btn-secondary btn-sm"
              title="Insert sample college student resume"
            >
              <Zap size={13} color="#FBBF24" />
              <span>Prefill Sample Resume</span>
            </button>
            <button
              onClick={handleClear}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="resume-text-input">
            Paste Resume (Markdown, Plain Text, or Bullet Points)
          </label>
          <textarea
            id="resume-text-input"
            className="form-textarea"
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your education, skills, projects, and work experience here..."
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', lineHeight: '1.6' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={handleAnalyze}
            disabled={!resumeText.trim() || isAnalyzing}
            className="btn btn-primary"
            id="btn-analyze-resume"
          >
            <Sparkles size={16} />
            <span>{isAnalyzing ? 'Scanning ATS Keywords...' : 'Run AI ATS Scan'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Score Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-indigo">ATS Compatibility Analysis</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Role: {result.targetRole}</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Match Score: {result.atsScore} / 100
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {result.summary}
              </p>
            </div>

            {/* Score Ring indicator */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `conic-gradient(#6366F1 ${result.atsScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.35)'
            }}>
              <div style={{
                width: '82px',
                height: '82px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A5B4FC' }}>{result.atsScore}%</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ATS Match</span>
              </div>
            </div>
          </div>

          {/* Keywords Breakdown (Matched vs Missing) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Matched Keywords */}
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34D399', fontWeight: 700, marginBottom: '0.85rem' }}>
                <CheckCircle2 size={18} />
                <span>Found Target Keywords ({result.matchedKeywords.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {result.matchedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#6EE7B7',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#FBBF24', fontWeight: 700, marginBottom: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>Recommended Missing Keywords ({result.missingKeywords.length})</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Adding these industry terms to project descriptions improves automated recruiter indexing:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {result.missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#FCD34D',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bullet Optimization Recommendations (Google XYZ format) */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={20} color="#818CF8" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Google XYZ Bullet Point Optimizations</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Accomplished [X], as measured by [Y], by doing [Z]
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Original Bullet:
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '0.2rem', fontStyle: 'italic' }}>
                      "{rec.original}"
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '6px',
                    padding: '0.85rem 1rem',
                    marginBottom: '0.65rem'
                  }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 700 }}>
                      AI Recommended Rewrite:
                    </span>
                    <p style={{ fontSize: '0.9rem', color: '#F8FAFC', fontWeight: 600, marginTop: '0.2rem', lineHeight: '1.5' }}>
                      "{rec.improved}"
                    </p>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    💡 <strong>Why this works:</strong> {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
