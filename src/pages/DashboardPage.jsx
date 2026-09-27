import React, { useEffect, useState } from 'react';
import ProgressRing from '../components/ProgressRing';
import { getDashboardMetrics } from '../services/studentService';
import {
  Sparkles,
  ArrowRight,
  Compass,
  MessageSquareCode,
  MapPin,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Database
} from 'lucide-react';

export default function DashboardPage({ student, setActivePage }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics(student?.studentId)
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading metrics:", err);
        setLoading(false);
      });
  }, [student?.studentId]);

  return (
    <div className="dashboard-page">
      {/* Student Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        marginBottom: '2rem',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle accent glow */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '200px',
          height: '200px',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(50px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-indigo">
                <Sparkles size={12} />
                Student Portal Active
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ID: {student?.studentId || 'stu_c9842a1'}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
              Welcome back, {student?.name || 'Alex'}! 👋
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>{student?.year || '3rd Year'}</span>
              <span>•</span>
              <span>{student?.branch || 'Computer Science & Engineering'}</span>
            </p>
          </div>

          {/* Career Goal Pill */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            minWidth: '260px'
          }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#818CF8', fontWeight: 600, marginBottom: '0.25rem' }}>
              🎯 Target Career Goal
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {student?.careerGoal || 'Cloud & DevOps Solutions Architect'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Roadmap synced with AWS DynamoDB
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 3 Progress Rings & Today's Recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card: 3 Progress Rings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#6366F1" />
                Readiness Milestones
              </h2>
              <span className="badge badge-indigo">Real-time</span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              Aggregated from your study queries, roadmap checkboxes, and mock interviews.
            </p>

            {/* Three Progress Rings */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '1rem',
              padding: '0.5rem 0'
            }}>
              {/* Ring 1: Learning % */}
              <ProgressRing
                percentage={metrics ? metrics.learningProgress : 74}
                color="var(--accent-learning)"
                label="Learning"
                sublabel="Coursework"
              />

              {/* Ring 2: Career % */}
              <ProgressRing
                percentage={metrics ? metrics.careerProgress : 65}
                color="var(--accent-career)"
                label="Career"
                sublabel="Roadmap"
              />

              {/* Ring 3: Interview % */}
              <ProgressRing
                percentage={metrics ? metrics.interviewProgress : 80}
                color="var(--accent-interview)"
                label="Interview"
                sublabel="Simulations"
              />
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span>Overall Readiness: <strong>Proficient</strong></span>
            <span>Target completion: <strong>Spring 2027</strong></span>
          </div>
        </div>

        {/* Card: Today's Recommendation */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '4px solid #6366F1',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#818CF8" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Recommendation</h2>
              </div>
              <span className="badge badge-amber">
                {metrics?.todayRecommendation?.badge || 'High Impact'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Synthesized by AI Bedrock based on your current skill gap analysis:
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={15} color="var(--accent-learning)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-learning)', fontWeight: 600 }}>
                  Estimated Time: {metrics?.todayRecommendation?.timeEstimate || '25 mins'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {metrics?.todayRecommendation?.category || 'DevOps Core'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {metrics?.todayRecommendation?.title || 'Master Docker Multi-Stage Builds & Container Optimization'}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {metrics?.todayRecommendation?.reason || 'Identified a 2-level gap in Docker containerization on your Cloud Roadmap.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('roadmap')}
            className="btn btn-primary"
            style={{ width: '100%' }}
            id="btn-rec-action"
          >
            <span>Open Career Roadmap Phase</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Quick Launchpad to all 4 feature modules */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        CampusAid Copilot Modules
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Module 1: Study Assistant */}
        <div
          onClick={() => setActivePage('study')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-study-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(14, 165, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8',
            marginBottom: '1rem'
          }}>
            <MessageSquareCode size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Study Assistant</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Ask engineering questions & get explanations, code examples, and 3 key takeaways.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Ask Question <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 2: Career Roadmap */}
        <div
          onClick={() => setActivePage('roadmap')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-roadmap-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A78BFA',
            marginBottom: '1rem'
          }}>
            <MapPin size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Career Roadmap</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Multi-phase structured milestones with skill checkoffs synced to DynamoDB.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#A78BFA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View Milestones <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 3: Skill Gap */}
        <div
          onClick={() => setActivePage('skills')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-skills-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FBBF24',
            marginBottom: '1rem'
          }}>
            <TrendingUp size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Skill Gap Analysis</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Compare your current vs target level across Python, Linux, AWS, Docker & Terraform.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#FBBF24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Analyze Levels <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 4: Interview Prep */}
        <div
          onClick={() => setActivePage('interview')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-interview-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D399',
            marginBottom: '1rem'
          }}>
            <Award size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Interview Prep</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Simulate 5 technical questions with AI scoring (/10), feedback, and model answers.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Start Mock Round <ArrowRight size={14} />
          </span>
        </div>

      </div>

      {/* DynamoDB & Bedrock Status Bar */}
      <div className="footer-aws-badge">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="aws-pill">AWS Ready Architecture</span>
          <span>Target Services: Amazon Bedrock (Claude 3 / Titan) • Amazon DynamoDB (Single Table Design) • AWS Lambda</span>
        </div>
        <span>DynamoDB Partition: <code>STUDENT#{student?.studentId || 'stu_c9842a1'}</code></span>
      </div>
    </div>
  );
}
