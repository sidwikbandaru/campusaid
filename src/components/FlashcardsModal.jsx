import React, { useState } from 'react';
import {
  X,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const FLASHCARD_DECKS = {
  "Distributed Systems & Cloud": [
    {
      q: "What is the CAP Theorem and what does each letter stand for?",
      a: "Consistency (all nodes see same data simultaneously), Availability (every request receives a non-error response), Partition Tolerance (system functions despite network partitions). In distributed systems, you can only guarantee 2 out of 3."
    },
    {
      q: "What is the primary difference between a Docker container and a Virtual Machine?",
      a: "Containers share the host operating system kernel and isolate user space using cgroups/namespaces (lightweight, MBs). VMs virtualize hardware via a hypervisor and require an entire guest OS kernel (heavy, GBs)."
    },
    {
      q: "How does Write-Ahead Logging (WAL) ensure Atomicity and Durability in DBMS?",
      a: "Before any database page modification is written to disk, the change is appended sequentially to an append-only log file. On system crash, uncommitted transactions are rolled back and committed transactions are replayed."
    },
    {
      q: "Explain what happens during a TCP 3-way handshake.",
      a: "1. Client sends SYN (synchronize sequence number). 2. Server responds with SYN-ACK (acknowledging client and sending its sequence). 3. Client replies with ACK. The TCP connection is now established."
    }
  ],
  "DSA & Algorithms": [
    {
      q: "What is the time complexity of Quick Sort in the best, average, and worst cases?",
      a: "Best case: O(N log N). Average case: O(N log N). Worst case: O(N²) (occurs when the chosen pivot is always the smallest or largest element, e.g. on already sorted arrays without randomized pivoting)."
    },
    {
      q: "What is the difference between BFS and DFS traversal in graphs?",
      a: "BFS (Breadth-First Search) uses a Queue and explores level-by-level, finding the shortest unweighted path. DFS (Depth-First Search) uses a Stack (or recursion) and explores down each branch to the leaf."
    },
    {
      q: "When is Dynamic Programming applicable to a problem?",
      a: "When a problem exhibits Overlapping Subproblems (same subproblems are calculated repeatedly) and Optimal Substructure (optimal solution is built from optimal subproblem solutions)."
    }
  ],
  "Security & Defense": [
    {
      q: "What is the difference between Symmetric and Asymmetric Encryption?",
      a: "Symmetric encryption uses a single shared secret key for both encryption and decryption (fast, e.g., AES). Asymmetric uses a public key to encrypt and a private key to decrypt (e.g., RSA, ECC)."
    },
    {
      q: "What is Cross-Site Scripting (XSS) and how do you prevent it?",
      a: "XSS occurs when malicious scripts are injected into trusted websites. Prevention: context-aware HTML encoding/escaping, Content Security Policy (CSP), and avoiding innerHTML."
    }
  ]
};

const QUIZ_QUESTIONS = [
  {
    q: "In an AP distributed database (under the CAP theorem), what happens when a network partition occurs?",
    options: [
      "The system stops accepting any writes to guarantee strict consistency",
      "Nodes continue accepting reads and writes, accepting temporary data divergence",
      "The database automatically shuts down to prevent data loss",
      "All partition traffic is rerouted through a single master node"
    ],
    answer: 1,
    explanation: "AP systems prioritize Availability over strict Consistency during network splits, resolving inconsistencies later via eventual consistency."
  },
  {
    q: "Which Linux kernel feature is used by Docker to limit CPU and memory resource consumption?",
    options: [
      "Linux Namespaces",
      "Control Groups (cgroups)",
      "Chroot jail",
      "SELinux profiles"
    ],
    answer: 1,
    explanation: "Namespaces provide process/network isolation, while cgroups (control groups) enforce resource metering and limits on CPU, RAM, and I/O."
  },
  {
    q: "What is the time complexity of looking up a key in a balanced Hash Table?",
    options: [
      "O(log N)",
      "O(N)",
      "O(1)",
      "O(N log N)"
    ],
    answer: 2,
    explanation: "A well-hashed hash table achieves O(1) average lookup time via direct hash bucket indexing."
  },
  {
    q: "Which HTTP header is essential for preventing clickjacking attacks?",
    options: [
      "X-Frame-Options: DENY",
      "Access-Control-Allow-Origin: *",
      "Cache-Control: no-cache",
      "Strict-Transport-Security"
    ],
    answer: 0,
    explanation: "X-Frame-Options prevents the site from being rendered inside an iframe on another domain, eliminating clickjacking."
  }
];

export default function FlashcardsModal({ isOpen, onClose, initialDeck = "Distributed Systems & Cloud" }) {
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [selectedDeck, setSelectedDeck] = useState(initialDeck);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentDeckCards = FLASHCARD_DECKS[selectedDeck] || FLASHCARD_DECKS["Distributed Systems & Cloud"];
  const currentCard = currentDeckCards[cardIndex] || currentDeckCards[0];
  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % currentDeckCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + currentDeckCards.length) % currentDeckCards.length);
  };

  const handleOptionSelect = (idx) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
    setQuizSubmitted(true);
    if (idx === currentQuiz.answer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setQuizSubmitted(false);
    setSelectedOption(null);
    setQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizSubmitted(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={20} color="var(--accent-learning)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              AI Active Recall & Flashcard Quizzes
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Reinforce core concepts with interactive 3D flip cards and knowledge checkpoint quizzes.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            style={{
              padding: '0.55rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'flashcards' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'flashcards' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🗂️ Interactive Flip Flashcards
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '0.55rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'quiz' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'quiz' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🎯 Multiple Choice Quiz
          </button>
        </div>

        {/* TAB 1: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div>
            {/* Deck Selector pills */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {Object.keys(FLASHCARD_DECKS).map((deckName) => (
                <button
                  key={deckName}
                  onClick={() => {
                    setSelectedDeck(deckName);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`btn btn-sm ${selectedDeck === deckName ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {deckName}
                </button>
              ))}
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                perspective: '1000px',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{
                background: isFlipped
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(49, 46, 129, 0.4) 0%, rgba(30, 27, 75, 0.6) 100%)',
                border: isFlipped ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-md)',
                minHeight: '200px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isFlipped ? '#34D399' : '#A5B4FC'
                  }}>
                    {isFlipped ? 'Answer & Explanation' : 'Question (Click to flip)'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Card {cardIndex + 1} of {currentDeckCards.length}
                  </span>
                </div>

                <div style={{
                  fontSize: isFlipped ? '0.96rem' : '1.15rem',
                  fontWeight: isFlipped ? 500 : 700,
                  color: isFlipped ? '#F1F5F9' : '#FFFFFF',
                  lineHeight: '1.6',
                  margin: '1.5rem 0'
                }}>
                  {isFlipped ? currentCard.a : currentCard.q}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  👆 Click card to {isFlipped ? 'see question' : 'reveal answer'}
                </div>
              </div>
            </div>

            {/* Navigation controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrevCard}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} />
                <span>Flip Card</span>
              </button>

              <button
                onClick={handleNextCard}
                className="btn btn-primary btn-sm"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MULTIPLE CHOICE QUIZ */}
        {activeTab === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-emerald">Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Score: <strong>{quizScore}</strong> / {QUIZ_QUESTIONS.length}
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', lineHeight: '1.5' }}>
              {currentQuiz.q}
            </h3>

            {/* Options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {currentQuiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuiz.answer;

                let border = '1px solid var(--border-subtle)';
                let bg = 'rgba(255, 255, 255, 0.02)';
                let color = 'var(--text-primary)';

                if (quizSubmitted) {
                  if (isCorrect) {
                    border = '1px solid #10B981';
                    bg = 'rgba(16, 185, 129, 0.15)';
                    color = '#34D399';
                  } else if (isSelected && !isCorrect) {
                    border = '1px solid #EF4444';
                    bg = 'rgba(239, 68, 68, 0.15)';
                    color = '#F87171';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={quizSubmitted}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1.1rem',
                      borderRadius: 'var(--radius-sm)',
                      border,
                      background: bg,
                      color,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: quizSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {quizSubmitted && (
              <div style={{
                background: selectedOption === currentQuiz.answer ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: selectedOption === currentQuiz.answer ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {selectedOption === currentQuiz.answer ? (
                    <CheckCircle2 size={16} color="#34D399" />
                  ) : (
                    <AlertCircle size={16} color="#F87171" />
                  )}
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: selectedOption === currentQuiz.answer ? '#34D399' : '#F87171'
                  }}>
                    {selectedOption === currentQuiz.answer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {currentQuiz.explanation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleResetQuiz}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} />
                <span>Reset Quiz</span>
              </button>

              <button
                onClick={handleNextQuiz}
                disabled={!quizSubmitted}
                className="btn btn-primary btn-sm"
              >
                <span>{quizIndex === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
