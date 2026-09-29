import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { signInUser, signUpUser } from '../services/studentService';
import CustomSelect from '../components/CustomSelect';

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year (Freshman)' },
  { value: '2nd Year', label: '2nd Year (Sophomore)' },
  { value: '3rd Year', label: '3rd Year (Junior)' },
  { value: '4th Year', label: '4th Year (Senior)' },
  { value: 'Graduate Student', label: 'Graduate Student (Master\'s / Ph.D.)' }
];

const BRANCH_OPTIONS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Artificial Intelligence & Data Science', label: 'Artificial Intelligence & Data Science (AI & DS)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Cybersecurity & Defense', label: 'Cybersecurity & Defense' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Electronics & Communication', label: 'Electronics & Communication (ECE)' }
];

const CAREER_GOAL_OPTIONS = [
  { value: 'Cloud & DevOps Solutions Architect', label: 'Cloud & DevOps Solutions Architect' },
  { value: 'AI & Machine Learning Engineer', label: 'AI & Machine Learning Engineer' },
  { value: 'Full Stack Web Developer', label: 'Full Stack Web Developer' },
  { value: 'Cybersecurity & Ethical Hacking', label: 'Cybersecurity & Ethical Hacking' },
  { value: 'Data Engineering & Big Data', label: 'Data Engineering & Big Data' },
  { value: 'Mobile App Developer (React Native & Flutter)', label: 'Mobile App Developer (React Native & Flutter)' }
];

export default function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpYear, setSignUpYear] = useState('3rd Year');
  const [signUpBranch, setSignUpBranch] = useState('Computer Science & Engineering');
  const [signUpGoal, setSignUpGoal] = useState('Cloud & DevOps Solutions Architect');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const student = await signInUser(signInEmail, signInPassword);
      onLoginSuccess(student);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const newStudent = await signUpUser({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        year: signUpYear,
        branch: signUpBranch,
        careerGoal: signUpGoal
      });
      setSuccessMessage('Account created successfully! Launching your workspace...');
      setTimeout(() => {
        onLoginSuccess(newStudent);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role = 'alex') => {
    setErrorMessage('');
    if (role === 'alex') {
      setSignInEmail('alex.rivera@campus.edu');
      setSignInPassword('password123');
    } else {
      setSignInEmail('maya.chen@campus.edu');
      setSignInPassword('password123');
    }
    setActiveTab('signin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      position: 'relative'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: '380px',
        height: '380px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="card" style={{
        maxWidth: activeTab === 'signup' ? '540px' : '460px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 24px 50px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.12)',
        transition: 'all 0.3s ease'
      }}>
        {/* Header Icon & Title */}
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
            CampusAid AI
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Your 24/7 AI academic copilot, career roadmap tracker, and interview simulator.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'signin' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'signin' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            id="tab-signin"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'signup' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            id="tab-signup"
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.84rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '0.84rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label" htmlFor="signin-email">Student Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  placeholder="student@university.edu"
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
                <label className="form-label" htmlFor="signin-password">Password</label>
                <span style={{ fontSize: '0.75rem', color: '#818CF8', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showSignInPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  title={showSignInPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
        )}

        {/* TAB 2: SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  placeholder="e.g. Sarah Jenkins"
                />
                <User size={16} style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Student Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  placeholder="sarah.jenkins@university.edu"
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

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Create Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showSignUpPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                />
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <CustomSelect
                  id="signup-year-select"
                  value={signUpYear}
                  onChange={setSignUpYear}
                  options={YEAR_OPTIONS}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <CustomSelect
                  id="signup-branch-select"
                  value={signUpBranch}
                  onChange={setSignUpBranch}
                  options={BRANCH_OPTIONS}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Target Career Track</label>
              <CustomSelect
                id="signup-goal-select"
                value={signUpGoal}
                onChange={setSignUpGoal}
                options={CAREER_GOAL_OPTIONS}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.78rem' }}
              disabled={isLoading}
              id="btn-signup-submit"
            >
              {isLoading ? (
                <span>Creating Student Account...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Account & Launch Copilot</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Pre-fill helper (unobtrusive) */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.65rem'
          }}>
            Testing or evaluating? Fill sample credentials:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('alex')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
              id="demo-alex-btn"
            >
              Alex (Cloud & DevOps)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('maya')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
              id="demo-maya-btn"
            >
              Maya (AI & ML)
            </button>
          </div>
        </div>

        {/* AWS Backend Ready Note */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
            <strong>Production Ready:</strong> Authenticates users, persists session state, and syncs learning progress.
          </span>
        </div>
      </div>
    </div>
  );
}
