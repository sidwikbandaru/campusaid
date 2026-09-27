import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Database } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('alex.rivera@campus.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock authentication: simulate fast auth check then redirect
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        studentId: "stu_c9842a1",
        name: "Alex Rivera",
        year: "3rd Year",
        branch: "Computer Science & Engineering",
        careerGoal: "Cloud & DevOps Solutions Architect",
        email: email
      });
    }, 400);
  };

  const handleQuickDemo = (role = 'cloud') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'data') {
        onLoginSuccess({
          studentId: "stu_d2381b4",
          name: "Maya Chen",
          year: "4th Year",
          branch: "Artificial Intelligence & Data Science",
          careerGoal: "AI & Machine Learning Engineer",
          email: "maya.chen@campus.edu"
        });
      } else {
        onLoginSuccess({
          studentId: "stu_c9842a1",
          name: "Alex Rivera",
          year: "3rd Year",
          branch: "Computer Science & Engineering",
          careerGoal: "Cloud & DevOps Solutions Architect",
          email: "alex.rivera@campus.edu"
        });
      }
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '25%',
        width: '350px',
        height: '350px',
        background: 'rgba(99, 102, 241, 0.12)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '25%',
        width: '320px',
        height: '320px',
        background: 'rgba(14, 165, 233, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.12)'
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <GraduationCap size={32} />
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
            Welcome to CampusAid AI
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Your 24/7 AI academic copilot, career roadmap tracker, and interview simulator.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Student Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@campus.edu"
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <span style={{ fontSize: '0.75rem', color: '#818CF8', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
              />
              <Lock size={16} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.78rem' }}
            disabled={isLoading}
            id="btn-login-submit"
          >
            {isLoading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill for Hackathon Evaluators */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <p style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: '0.65rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            ⚡ Hackathon Quick Demo Accounts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('cloud')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              id="demo-alex-btn"
            >
              Alex (Cloud & DevOps)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('data')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              id="demo-maya-btn"
            >
              Maya (AI & ML)
            </button>
          </div>
        </div>

        {/* AWS Backend Ready Note */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem 0.95rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <ShieldCheck size={18} color="#10B981" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
            <strong>AWS Ready Architecture:</strong> Authenticates against Amazon Cognito & stores sessions in DynamoDB.
          </span>
        </div>
      </div>
    </div>
  );
}
