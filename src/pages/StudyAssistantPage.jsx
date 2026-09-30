import React, { useState } from 'react';
import { getStudyAnswer, cleanQuestion } from '../services/studyService';
import { addNote } from '../services/notesService';
import { awardXP } from '../services/gamificationService';
import FlashcardsModal from '../components/FlashcardsModal';
import CodePlaygroundModal from '../components/CodePlaygroundModal';
import {
  MessageSquareCode,
  Send,
  BookOpen,
  CheckCircle,
  Bot,
  User,
  Lightbulb,
  Cpu,
  Layers,
  Code2,
  BookmarkPlus,
  BookmarkCheck
} from 'lucide-react';

export default function StudyAssistantPage({ student }) {
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showCodeSandbox, setShowCodeSandbox] = useState(false);
  const [savedNotesMap, setSavedNotesMap] = useState({});

  // Chat message history initialized with a welcoming session
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      timestamp: 'Just now',
      answer: {
        topic: 'Welcome to CampusAid Study Assistant',
        explanation: `Hi ${student?.name || 'there'}! I am your AI Study Assistant. Ask me any academic or technical question, and I will break it down with a concise explanation, a concrete example, and 3 key points.`,
        example: `For example, try asking about "What is recursion?", "Explain page replacement in OS", or "Database normalization in DBMS".`,
        keyPoints: [
          "Plain-language conceptual clarity on core engineering topics.",
          "Every response includes an explanation, one concrete example, and 3 key points.",
          "Sessions are recorded for continuous study review and preparation."
        ]
      }
    }
  ]);

  const quickPrompts = [
    "What is recursion?",
    "Explain page replacement in OS",
    "Database normalization in DBMS",
    "What is Docker containerization?",
    "CAP theorem in distributed systems"
  ];

  const handleAsk = async (textToAsk = questionInput) => {
    // Strip parenthetical text in brackets/parentheses before displaying or processing
    const raw = (textToAsk || '').trim();
    const q = cleanQuestion(raw);
    if (!q || isLoading) return;

    // Add user message with cleaned question text
    const userMsg = {
      id: 'user_' + Date.now(),
      type: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestionInput('');
    setIsLoading(true);

    try {
      const sessionRecord = await getStudyAnswer(q, student?.studentId, student);

      const aiMsg = {
        id: sessionRecord.sessionId,
        type: 'ai',
        sessionId: sessionRecord.sessionId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer: sessionRecord.answer
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (student?.studentId) {
        awardXP(student.studentId, 'STUDY_QUESTION');
      }
    } catch (err) {
      console.error("Error fetching study answer:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          type: 'ai',
          error: true,
          answer: {
            topic: 'Connection Notice',
            explanation: 'Unable to reach the Study Assistant service. Please try again.',
            example: 'Retry your question in a few seconds.',
            keyPoints: ['Check local network', 'Verify serverless function', 'Try another topic']
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotes = (msg) => {
    if (!student?.studentId || savedNotesMap[msg.id]) return;
    const content = `${msg.answer?.explanation || ''}\n\nExample:\n${msg.answer?.example || ''}\n\nKey Points:\n${(msg.answer?.keyPoints || []).map((k, i) => `${i + 1}. ${k}`).join('\n')}`;
    addNote(student.studentId, {
      topic: msg.answer?.topic || 'Study Note',
      content,
      source: 'study_assistant',
      tags: ['Study Assistant']
    });
    awardXP(student.studentId, 'NOTE_SAVED');
    setSavedNotesMap(prev => ({ ...prev, [msg.id]: true }));
  };

  return (
    <div className="study-assistant-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <MessageSquareCode size={26} color="var(--accent-learning)" />
            AI Study Assistant
          </h1>
          <p className="page-desc">
            Ask any academic, systems, or coding question. Every answer yields an explanation, 1 code example, and 3 key points.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFlashcards(true)}
            className="btn btn-secondary btn-sm"
            id="btn-open-flashcards"
          >
            <Layers size={14} color="#38BDF8" />
            <span>Flashcards & Quiz</span>
          </button>

          <button
            onClick={() => setShowCodeSandbox(true)}
            className="btn btn-secondary btn-sm"
            id="btn-open-codesandbox"
          >
            <Code2 size={14} color="#818CF8" />
            <span>Code Sandbox</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>
          💡 Try asking:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.03)' }}
              id={`quick-prompt-${idx}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {messages.map((msg, index) => {
          if (msg.type === 'user') {
            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px 16px 4px 16px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{msg.text}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '0.35rem', textAlign: 'right' }}>
                    {msg.timestamp}
                  </div>
                </div>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A5B4FC',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              </div>
            );
          }

          // AI Response Card
          const answer = msg.answer;
          return (
            <div
              key={msg.id || index}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
              }}>
                <Bot size={20} />
              </div>

              <div className="card" style={{
                flex: 1,
                padding: '1.5rem',
                borderLeft: '4px solid var(--accent-learning)',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* Header metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {answer.topic || 'CampusAid Mentor Response'}
                    </span>
                    {msg.sessionId && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        (Session: {msg.sessionId})
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {msg.timestamp}
                    </span>
                    {msg.id !== 'welcome' && !msg.error && (
                      <button
                        onClick={() => handleSaveToNotes(msg)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Save this answer to your notes"
                      >
                        {savedNotesMap[msg.id] ? (
                          <>
                            <BookmarkCheck size={12} color="#10B981" />
                            <span style={{ color: '#10B981' }}>Saved (+8 XP)</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={12} />
                            <span>Save Note</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 1: Explanation */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-learning)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    <BookOpen size={16} />
                    Explanation
                  </div>
                  <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                    {answer.explanation}
                  </p>
                </div>

                {/* Section 2: Example */}
                {answer.example && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      <Lightbulb size={16} />
                      Example
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65'
                    }}>
                      {answer.example}
                    </div>
                  </div>
                )}

                {/* Section 3: Key Points */}
                {answer.keyPoints && answer.keyPoints.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-interview)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      <CheckCircle size={16} />
                      Key Points
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {answer.keyPoints.map((point, pIdx) => (
                        <div key={pIdx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {pIdx + 1}
                          </span>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Bot size={20} />
            </div>
            <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                borderTopColor: '#6366F1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Synthesizing explanation, code example, and key points via Bedrock...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="card" style={{
        position: 'sticky',
        bottom: '1rem',
        zIndex: 20,
        padding: '0.85rem 1rem',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <input
            type="text"
            className="form-input"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask a question (e.g. 'What is Docker vs Virtual Machines?', 'Explain CAP theorem')..."
            style={{ fontSize: '0.92rem' }}
            disabled={isLoading}
            id="study-input"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !questionInput.trim()}
            id="study-submit-btn"
          >
            <Send size={16} />
            <span style={{ display: 'inline-block' }}>Ask</span>
          </button>
        </form>
      </div>

      {/* Interactive Active Recall Flashcards & Quiz Modal */}
      <FlashcardsModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
      />

      {/* Live In-Browser Code Sandbox Modal */}
      <CodePlaygroundModal
        isOpen={showCodeSandbox}
        onClose={() => setShowCodeSandbox(false)}
      />
    </div>
  );
}
