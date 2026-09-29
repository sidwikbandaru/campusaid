import React, { useEffect, useState } from 'react';
import ProgressRing from '../components/ProgressRing';
import { getDashboardMetrics } from '../services/studentService';
import { getEnrolledCourses } from '../services/roadmapService';
import { getGamificationState } from '../services/gamificationService';
import CertificateModal from '../components/CertificateModal';
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
  Database,
  FileText,
  Flame,
  Zap,
  BarChart3,
  CalendarDays,
  StickyNote,
  Bot
} from 'lucide-react';

export default function DashboardPage({ student, setActivePage }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [courses, setCourses] = useState([]);
  const [gamState, setGamState] = useState(null);

  useEffect(() => {
    const sid = student?.studentId;
    if (!sid) return;

    setGamState(getGamificationState(sid));

    Promise.all([
      getDashboardMetrics(sid),
      getEnrolledCourses(sid)
    ]).then(([metricsData, coursesData]) => {
      setMetrics(metricsData);
      setCourses(coursesData);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading dashboard:", err);
      setLoading(false);
    });
  }, [student?.studentId]);

  // Compute readiness label from actual progress
  const getReadinessLabel = () => {
    if (!metrics) return 'Not Started';
    const avg = Math.round((metrics.learningProgress + metrics.careerProgress + metrics.interviewProgress) / 3);
    if (avg === 0) return 'Not Started';
    if (avg < 25) return 'Beginner';
    if (avg < 50) return 'Developing';
    if (avg < 75) return 'Proficient';
    return 'Advanced';
  };

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
                ID: {student?.studentId || '—'}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
              Welcome back, {student?.name || 'Student'}! 👋
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>{student?.year || '—'}</span>
              <span>•</span>
              <span>{student?.branch || '—'}</span>
            </p>

            {gamState && (
              <div
                onClick={() => setActivePage('analytics')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'background var(--transition-fast)'
                }}
                title="Click to view Study Analytics & Badges"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818CF8', fontWeight: 700 }}>
                  <Zap size={13} />
                  Level {gamState.level}: {gamState.title}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {gamState.totalXP} XP
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B', fontWeight: 600 }}>
                  <Flame size={13} />
                  {gamState.streak}d streak
                </span>
              </div>
            )}
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
              {student?.careerGoal || 'Not set — choose a career track'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {student?.careerGoal ? 'Roadmap synced with your progress' : 'Go to Career Roadmap to get started'}
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              className="btn btn-secondary btn-sm"
              style={{
                marginTop: '0.75rem',
                width: '100%',
                fontSize: '0.75rem',
                justifyContent: 'center',
                padding: '0.35rem 0.65rem'
              }}
              id="btn-open-certificate"
            >
              <Award size={13} color="#FBBF24" />
              <span>Placement Readiness Report</span>
            </button>
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
                percentage={metrics ? metrics.learningProgress : 0}
                color="var(--accent-learning)"
                label="Learning"
                sublabel="Coursework"
              />

              {/* Ring 2: Career % */}
              <ProgressRing
                percentage={metrics ? metrics.careerProgress : 0}
                color="var(--accent-career)"
                label="Career"
                sublabel="Roadmap"
              />

              {/* Ring 3: Interview % */}
              <ProgressRing
                percentage={metrics ? metrics.interviewProgress : 0}
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
            <span>Overall Readiness: <strong>{getReadinessLabel()}</strong></span>
            <span>Stats: <strong>{metrics?.weeklyStats?.questionsAsked || 0} questions this week</strong></span>
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
                {metrics?.todayRecommendation?.badge || 'Start Here'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {metrics?.careerProgress > 0 
                ? 'Based on your current skill gap analysis and roadmap progress:'
                : 'Get started with your personalized learning journey:'
              }
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
                  Estimated Time: {metrics?.todayRecommendation?.timeEstimate || '5 mins'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {metrics?.todayRecommendation?.category || 'Getting Started'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {metrics?.todayRecommendation?.title || 'Set up your Career Roadmap'}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {metrics?.todayRecommendation?.reason || 'Choose your career track to unlock personalized recommendations.'}
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
            Multi-phase structured milestones with skill checkoffs synced to your profile.
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
            Compare your current vs target level across skills relevant to your career goal.
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

        {/* Module 5: Resume ATS */}
        <div
          onClick={() => setActivePage('resume')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-resume-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818CF8',
            marginBottom: '1rem'
          }}>
            <FileText size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Resume ATS Scanner</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Benchmark resume keywords against hiring rubrics and generate STAR bullet rewrites.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Scan Resume <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 6: Study Analytics */}
        <div
          onClick={() => setActivePage('analytics')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-analytics-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F87171',
            marginBottom: '1rem'
          }}>
            <BarChart3 size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Study Analytics & XP</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Track total XP points, unlocked badges, streaks, and weekly activity charts.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#F87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View Analytics <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 7: Study Planner */}
        <div
          onClick={() => setActivePage('planner')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-planner-card"
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
            <CalendarDays size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Weekly Study Planner</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Schedule study tasks, allocate hours per subject, and track weekly task completion.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Open Planner <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 8: Notes & Bookmarks */}
        <div
          onClick={() => setActivePage('notes')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-notes-card"
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
            <StickyNote size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Notes & Bookmarks</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Organize bookmarked AI study responses, star key notes, and search by subject tags.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#FBBF24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Browse Notes <ArrowRight size={14} />
          </span>
        </div>

        {/* Module 9: AI Career Counselor */}
        <div
          onClick={() => setActivePage('counselor')}
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="dash-counselor-card"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C084FC',
            marginBottom: '1rem'
          }}>
            <Bot size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>AI Career Counselor</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Get personalized advice on FAANG interviews, salary negotiation, resume tips, and internships.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#C084FC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Chat with Counselor <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Enrolled Courses & Academic Curriculum Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent-learning)" />
              Enrolled Semester Courses & Academic Modules
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track lecture syllabus progress and query the AI Study Assistant for any course module.
            </p>
          </div>
          <span className="badge badge-cyan">
            {courses.length} Enrolled Courses
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.1rem'
        }}>
          {courses.map((course) => (
            <div
              key={course.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${course.color}`,
                padding: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    background: `${course.color}20`,
                    color: course.color
                  }}>
                    {course.code} • {course.credits} Credits
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {course.semester}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Instructor: {course.instructor}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Syllabus Mastery</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{course.progress}%</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: '6px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${course.progress}%`, background: course.color }}
                    />
                  </div>
                </div>

                {/* Key Syllabus Topics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem' }}>
                  {course.topics.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setActivePage('study')}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem'
                }}
              >
                <Sparkles size={13} color={course.color} />
                <span>Study Topics with AI Copilot</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DynamoDB & Bedrock Status Bar */}
      <div className="footer-aws-badge">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="aws-pill">AWS Ready Architecture</span>
          <span>Target Services: Amazon Bedrock (Claude 3 / Titan) • Amazon DynamoDB (Single Table Design) • AWS Lambda</span>
        </div>
        <span>DynamoDB Partition: <code>STUDENT#{student?.studentId || '—'}</code></span>
      </div>

      {/* Official Placement Readiness Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        student={student}
        metrics={metrics}
      />
    </div>
  );
}
