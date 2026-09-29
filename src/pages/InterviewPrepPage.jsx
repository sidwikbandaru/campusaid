import React, { useState, useEffect } from 'react';
import {
  generateInterviewQuestions,
  getInterviewFeedback,
  AVAILABLE_ROLES,
  getTopicsForRole
} from '../services/interviewService';
import { awardXP } from '../services/gamificationService';
import CustomSelect from '../components/CustomSelect';
import {
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Zap,
  Mic,
  MicOff,
  Printer
} from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: "Junior", label: "Junior (0–2 years)" },
  { value: "Mid-level", label: "Mid-level (2–5 years)" },
  { value: "Senior", label: "Senior (Staff / Architect)" }
];

function getRoleFromGoal(goal = '') {
  const lower = goal.toLowerCase();
  if (lower.includes('fullstack') || lower.includes('full stack') || lower.includes('web')) {
    return "Full Stack Developer";
  }
  if (lower.includes('data') || lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) {
    return "Data & AI Engineer";
  }
  if (lower.includes('cyber') || lower.includes('security')) {
    return "Cybersecurity Specialist";
  }
  if (lower.includes('mobile')) {
    return "Mobile App Developer";
  }
  return "Full Stack Developer";
}

export default function InterviewPrepPage({ student }) {
  const initialRole = getRoleFromGoal(student?.careerGoal);
  const [role, setRole] = useState(initialRole);
  const [topic, setTopic] = useState(() => {
    const topics = getTopicsForRole(initialRole);
    return topics[0] || "System Design & APIs";
  });
  const [difficulty, setDifficulty] = useState("Mid-level");

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  // Keep role synced when student careerGoal updates (only before a session starts)
  useEffect(() => {
    if (!session && student?.careerGoal) {
      const matched = getRoleFromGoal(student.careerGoal);
      setRole(matched);
      const topics = getTopicsForRole(matched);
      if (topics.length > 0 && !topics.includes(topic)) {
        setTopic(topics[0]);
      }
    }
  }, [student?.careerGoal]);

  // Voice speech-to-text handler
  const toggleVoiceMode = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setVoiceError(''), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Generate 5 questions via Bedrock service
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const newSession = await generateInterviewQuestions(role, topic, difficulty, student?.studentId);
      setSession(newSession);
      setCurrentIndex(0);
      setAnswerInput('');
    } catch (err) {
      console.error("Error generating interview questions:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate the student's answer
  const handleSubmitAnswer = async () => {
    if (!session || !answerInput.trim() || isEvaluating) return;

    const currentQ = session.questions[currentIndex];
    setIsEvaluating(true);

    try {
      const feedback = await getInterviewFeedback(
        currentQ.q,
        answerInput,
        session.role,
        session.topic,
        session.difficulty
      );

      // Update question in session record
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        studentAnswer: answerInput,
        feedback: feedback,
        score: feedback.score
      };

      setSession({
        ...session,
        questions: updatedQuestions
      });

      if (student?.studentId) {
        awardXP(student.studentId, feedback.score >= 9 ? 'INTERVIEW_PERFECT' : 'INTERVIEW_COMPLETE');
      }
    } catch (err) {
      console.error("Error evaluating answer:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Navigate between questions
  const goToQuestion = (index) => {
    if (!session) return;
    setCurrentIndex(index);
    const targetQ = session.questions[index];
    setAnswerInput(targetQ.studentAnswer || '');
  };

  // Fast prefill sample response for hackathon evaluator convenience
  const handlePrefillAnswer = () => {
    setAnswerInput(
      "In production environments, we approach this by decoupling the components, enforcing least-privilege IAM permissions, and introducing automated health checks. For example, when configuring containerized workloads, we rely on multi-stage builds to strip build toolchains and run as an unprivileged user (USER appuser) to minimize root exploit surfaces. Furthermore, we handle graceful SIGTERM termination to avoid dropping active requests."
    );
  };

  const currentQ = session ? session.questions[currentIndex] : null;
  const currentFeedback = currentQ?.feedback;

  return (
    <div className="interview-prep-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={26} color="var(--accent-interview)" />
            AI Interview Simulator
          </h1>
          <p className="page-desc">
            Practice technical interview rounds. Generate 5 progressive questions, draft your answer, and receive rubric-based AI scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {session && (
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="Print or Save as PDF"
              id="btn-export-interview"
            >
              <Printer size={14} />
              <span>Export PDF</span>
            </button>
          )}
          <span className="badge badge-emerald">Bedrock Rubric Evaluation</span>
        </div>
      </div>

      {/* Configuration & Generator Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', position: 'relative', zIndex: 30, overflow: 'visible' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
          position: 'relative'
        }}>
          {/* Role Dropdown */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="form-label" htmlFor="role-select">Target Engineering Role</label>
            <CustomSelect
              id="role-select"
              value={role}
              onChange={(newRole) => {
                setRole(newRole);
                const availableTopics = getTopicsForRole(newRole);
                if (availableTopics.length > 0 && !availableTopics.includes(topic)) {
                  setTopic(availableTopics[0]);
                }
              }}
              options={AVAILABLE_ROLES.map((r) => ({ value: r, label: r }))}
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="form-label" htmlFor="difficulty-select">Seniority Difficulty</label>
            <CustomSelect
              id="difficulty-select"
              value={difficulty}
              onChange={setDifficulty}
              options={DIFFICULTY_OPTIONS}
            />
          </div>

          {/* Topic Dropdown */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="form-label" htmlFor="topic-select">Technical Topic</label>
            <CustomSelect
              id="topic-select"
              value={topic}
              onChange={setTopic}
              options={getTopicsForRole(role).map((t) => ({ value: t, label: t }))}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuestions}
            className="btn btn-primary"
            disabled={isGenerating}
            id="btn-generate-questions"
            style={{ height: '42px' }}
          >
            <Sparkles size={16} />
            <span>{isGenerating ? 'Generating 5 Questions...' : 'Generate 5 Questions'}</span>
          </button>
        </div>
      </div>

      {/* When no session exists yet */}
      {!session && !isGenerating && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D399',
            marginBottom: '1rem'
          }}>
            <Award size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.45rem' }}>
            Ready to test your interview readiness?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
            Select your role, topic, and difficulty above, then click <strong>Generate 5 Questions</strong> to start your simulated technical round.
          </p>
          <button
            onClick={handleGenerateQuestions}
            className="btn btn-primary"
          >
            Start Mock Interview
          </button>
        </div>
      )}

      {/* Active Question Carousel View */}
      {session && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Question Index Tabs (1 to 5) */}
          <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Questions:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {session.questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = q.score !== null;

                    return (
                      <button
                        key={idx}
                        onClick={() => goToQuestion(idx)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isCurrent ? '2px solid #6366F1' : '1px solid var(--border-subtle)',
                          background: isCurrent
                            ? 'var(--accent-primary-light)'
                            : isAnswered
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(255, 255, 255, 0.03)',
                          color: isCurrent
                            ? '#FFFFFF'
                            : isAnswered
                            ? '#34D399'
                            : 'var(--text-secondary)'
                        }}
                        id={`q-tab-${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next controls */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary btn-sm"
                  id="btn-prev-q"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => goToQuestion(Math.min(4, currentIndex + 1))}
                  disabled={currentIndex === 4}
                  className="btn btn-secondary btn-sm"
                  id="btn-next-q"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Question Prompt Card */}
          <div className="card" style={{
            borderLeft: '4px solid var(--accent-interview)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-emerald">
                Question {currentIndex + 1} of 5
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Session: {session.sessionId} • {session.role} ({session.difficulty})
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.45', color: 'var(--text-primary)' }}>
              {currentQ.q}
            </h2>
          </div>

          {/* Answer Text Area */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" htmlFor="student-answer-input" style={{ marginBottom: 0, fontWeight: 600 }}>
                Your Answer
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  className={`btn btn-sm ${isListening ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.65rem',
                    background: isListening ? '#EF4444' : undefined,
                    borderColor: isListening ? '#DC2626' : undefined,
                    boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.5)' : undefined
                  }}
                  title={isListening ? "Click to stop recording" : "Speak your answer via microphone"}
                  id="btn-voice-answer"
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} color="#A5B4FC" />}
                  <span>{isListening ? 'Listening... (Click to stop)' : 'Voice Mode'}</span>
                </button>

                <button
                  onClick={handlePrefillAnswer}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                  title="Insert a sample realistic answer for rapid testing"
                  id="btn-prefill-answer"
                >
                  <Zap size={12} color="#FBBF24" />
                  <span>Prefill Demo Answer</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Word count: {answerInput.trim() ? answerInput.trim().split(/\s+/).length : 0}
                </span>
              </div>
            </div>

            {voiceError && (
              <div style={{
                fontSize: '0.75rem',
                color: '#EF4444',
                marginBottom: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '0.35rem 0.65rem',
                borderRadius: '4px'
              }}>
                {voiceError}
              </div>
            )}

            <textarea
              id="student-answer-input"
              className="form-textarea"
              rows={5}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Type your explanation here. Mention concrete mechanisms, system boundaries, error cases, and production trade-offs..."
              style={{ lineHeight: '1.6', fontSize: '0.92rem' }}
              disabled={isEvaluating}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                💡 Tip: Structure your response: definition → execution flow → production trade-offs.
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={!answerInput.trim() || isEvaluating}
                className="btn btn-primary"
                id="btn-submit-answer"
              >
                {isEvaluating ? (
                  <span>Bedrock Evaluating...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Answer for AI Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Rubric Feedback Card (Shows after submitting answer) */}
          {currentFeedback && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '1.75rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Score Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399'
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Interviewer Evaluation</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rubric-graded against Amazon Bar Raiser criteria</p>
                  </div>
                </div>

                {/* Score Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.35rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34D399' }}>
                    {currentFeedback.score}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ 10</span>
                </div>
              </div>

              {/* Feedback Points Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                
                {/* Strengths */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34D399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                    <CheckCircle2 size={16} />
                    <span>What Was Good</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {currentFeedback.whatWasGood}
                  </p>
                </div>

                {/* Areas for Improvement */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.04)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#FBBF24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                    <AlertCircle size={16} />
                    <span>What to Improve</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {currentFeedback.whatToImprove}
                  </p>
                </div>

              </div>

              {/* Model Answer */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#818CF8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                  <BookOpen size={16} />
                  <span>Model Benchmark Answer</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.65' }}>
                  {currentFeedback.modelAnswer}
                </p>
              </div>

              {/* Next Question Shortcut */}
              {currentIndex < 4 && (
                <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                  <button
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="btn btn-secondary btn-sm"
                    id="btn-next-after-review"
                  >
                    <span>Proceed to Question {currentIndex + 2}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
