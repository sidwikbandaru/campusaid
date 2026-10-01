import React, { useState } from 'react';
import {
  Briefcase,
  Send,
  User,
  Sparkles,
  Target
} from 'lucide-react';
import { generateGeminiCareerAdvice, isGeminiActive } from '../services/geminiService';

const CAREER_TOPICS = [
  "What skills should I prioritize for my first job?",
  "How to prepare for FAANG interviews?",
  "Best projects to add on my resume",
  "How to negotiate my first salary?",
  "Open source contribution strategy",
  "Should I do an internship or build projects?",
];

// Career advice knowledge base
const CAREER_KB = [
  {
    matcher: (q) => q.includes('faang') || q.includes('google') || q.includes('amazon') || q.includes('microsoft') || q.includes('meta') || q.includes('apple') || q.includes('big tech'),
    answer: {
      title: 'FAANG / Big Tech Interview Preparation Strategy',
      advice: 'Big Tech companies follow a structured interview pipeline: Online Assessment → Phone Screen → Virtual/Onsite (4-6 rounds). Focus areas differ by company but generally include Data Structures & Algorithms (60%), System Design (25%), and Behavioral (15%). Start preparation 3-6 months before applications open.',
      actionItems: [
        'Solve 150-200 LeetCode problems across Easy/Medium/Hard (focus on Blind 75 list first).',
        'Build 2-3 production-grade projects that demonstrate system design thinking.',
        'Practice mock interviews weekly using platforms like Pramp or Interviewing.io.',
        'Study the Leadership Principles (Amazon) or Googleyness traits specific to your target company.',
        'Apply to multiple companies simultaneously to maximize offer leverage.'
      ],
      resources: ['LeetCode Blind 75', 'System Design Primer (GitHub)', 'Cracking the Coding Interview', 'Grokking the System Design Interview']
    }
  },
  {
    matcher: (q) => q.includes('skill') || q.includes('prioritize') || q.includes('first job') || q.includes('learn first') || q.includes('important'),
    answer: {
      title: 'High-Impact Skills to Prioritize for Your First Tech Role',
      advice: 'Employers evaluate entry-level candidates on three pillars: (1) Core CS fundamentals, (2) Practical building experience, and (3) Communication & collaboration skills. The most in-demand skills shift yearly, but fundamentals remain constant.',
      actionItems: [
        'Master one programming language deeply (Python or JavaScript/TypeScript for versatility).',
        'Build strong foundations in DSA — arrays, trees, graphs, dynamic programming, and sorting.',
        'Learn Git, CI/CD, and basic cloud (AWS/GCP) — these are non-negotiable in modern engineering.',
        'Deploy at least 2 end-to-end projects with a backend, database, and hosted frontend.',
        'Practice technical writing: document your projects clearly on GitHub READMEs.'
      ],
      resources: ['freeCodeCamp Full Stack', 'The Odin Project', 'CS50 Harvard', 'Roadmap.sh']
    }
  },
  {
    matcher: (q) => q.includes('resume') || q.includes('cv') || q.includes('portfolio'),
    answer: {
      title: 'Resume & Portfolio Optimization for New Graduates',
      advice: 'Your resume is your first impression — it gets 6-8 seconds of recruiter attention. For new graduates, projects and skills matter more than work experience. Use the STAR format (Situation, Task, Action, Result) for every bullet point.',
      actionItems: [
        'Keep your resume to 1 page — use a clean ATS-friendly template (no graphics/columns).',
        'Lead every bullet with a strong action verb and quantify impact (e.g., "Reduced API latency by 40%").',
        'List 3-4 projects with tech stack, your role, and measurable outcomes.',
        'Include a GitHub link with pinned repositories that have clean READMEs and live demos.',
        'Tailor your resume keywords to each job description — match their exact terminology.'
      ],
      resources: ['Jake\'s Resume Template (Overleaf)', 'Resume Worded', 'Jobscan ATS Checker', 'Harvard Resume Guide']
    }
  },
  {
    matcher: (q) => q.includes('salary') || q.includes('negotiate') || q.includes('offer') || q.includes('compensation'),
    answer: {
      title: 'Salary Negotiation Playbook for New Graduates',
      advice: 'Most candidates leave 10-20% on the table by not negotiating. Companies expect negotiation — it signals confidence and business awareness. Always negotiate base salary, signing bonus, and equity/RSUs separately.',
      actionItems: [
        'Research market rates on Levels.fyi, Glassdoor, and Blind before any negotiation.',
        'Never share your current/expected salary first — ask for their range.',
        'Use competing offers as leverage, but be honest about what you have.',
        'Negotiate signing bonus and equity separately from base salary.',
        'Get everything in writing before accepting — verbal promises are not binding.'
      ],
      resources: ['Levels.fyi Compensation Data', 'Haseeb Qureshi Negotiation Guide', 'Candor Salary Negotiation', 'Patrick McKenzie Blog']
    }
  },
  {
    matcher: (q) => q.includes('project') || q.includes('build') || q.includes('portfolio project'),
    answer: {
      title: 'Best Projects to Build for Your Engineering Portfolio',
      advice: 'Recruiters look for projects that demonstrate end-to-end thinking, not just tutorial clones. Build projects that solve a real problem, use a modern tech stack, and are deployed live. Quality over quantity — 3 great projects beat 10 tutorial copies.',
      actionItems: [
        'Build a full-stack SaaS app with auth, CRUD, real-time updates, and deployment.',
        'Create an open-source developer tool or CLI that solves a genuine pain point.',
        'Build a data pipeline or ML model with a clean API and visualization dashboard.',
        'Contribute meaningfully to 1-2 popular open source repos (not just typo fixes).',
        'Document each project with architecture diagrams, tech decisions, and demo videos.'
      ],
      resources: ['Build Your Own X (GitHub)', 'Project-Based Learning Repo', 'Codecrafters.io', 'DevProjects by Codementor']
    }
  },
  {
    matcher: (q) => q.includes('internship') || q.includes('intern') || q.includes('experience'),
    answer: {
      title: 'Internship Strategy & Getting Real-World Experience',
      advice: 'Internships remain the #1 path to full-time offers — 70%+ of interns receive return offers at top companies. Start applying 6-9 months before the internship period. If you can\'t land an internship, open source contributions and freelance work are strong alternatives.',
      actionItems: [
        'Apply to 50-100+ internships across tiers (FAANG → mid-size → startups) starting in August/September.',
        'Attend career fairs, hackathons, and tech meetups for direct recruiter connections.',
        'Cold-email engineers at target companies with a specific, personalized message.',
        'If no internship: contribute to open source, build production apps, or freelance on Upwork.',
        'During your internship: document everything, ask for feedback weekly, and build relationships.'
      ],
      resources: ['Simplify Jobs (GitHub)', 'PittCSC Internship List', 'LinkedIn Easy Apply', 'Handshake']
    }
  },
  {
    matcher: (q) => q.includes('open source') || q.includes('contribute') || q.includes('github'),
    answer: {
      title: 'Open Source Contribution Strategy for Career Growth',
      advice: 'Open source contributions demonstrate real-world collaboration skills, code review experience, and the ability to work with large codebases. Focus on projects you actually use — your genuine interest will show.',
      actionItems: [
        'Start with "good first issue" labels on repos you use daily (VS Code, React, Next.js, etc.).',
        'Read the CONTRIBUTING.md before your first PR — follow their code style strictly.',
        'Begin with documentation fixes, then graduate to bug fixes, then feature PRs.',
        'Join the project\'s Discord/Slack to build relationships with maintainers.',
        'Maintain consistency: 2-3 contributions per month is more valuable than a one-time burst.'
      ],
      resources: ['First Contributions (GitHub)', 'Good First Issues Aggregator', 'Up For Grabs', 'CodeTriage']
    }
  },
];

function getCareerAdvice(question) {
  const q = question.toLowerCase();

  for (const item of CAREER_KB) {
    if (item.matcher(q)) return item.answer;
  }

  // Dynamic fallback
  const cleanQ = question.replace(/^(how to|what|should i|best way to|tips for|advice on)\s+/i, '').replace(/[?.,!]+$/, '').trim();
  const topic = cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1);

  return {
    title: topic || 'Career Guidance',
    advice: `Regarding "${topic}": In today's competitive tech landscape, the most successful early-career engineers combine deep technical proficiency with strategic networking and personal branding. Focus on building demonstrable skills through projects, contributing to open source, and actively engaging with the developer community.`,
    actionItems: [
      'Break this goal into weekly micro-targets and track your progress systematically.',
      'Find a mentor or community (Discord, Reddit, local meetups) focused on this area.',
      'Build a public portfolio piece that demonstrates your progress in this domain.',
      'Set a 90-day review checkpoint to evaluate your growth and adjust your strategy.',
      'Document your learning journey — blog posts and project READMEs build credibility.'
    ],
    resources: ['Roadmap.sh', 'freeCodeCamp', 'Dev.to Community', 'Hacker News']
  };
}

export default function CareerCounselorPage({ student }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      answer: {
        title: `Welcome, ${student?.name || 'Student'}! 👋`,
        advice: `I'm your AI Career Counselor — I help you navigate the job market, optimize your resume, plan interview prep, and make strategic career decisions. Ask me anything about your tech career journey!`,
        actionItems: [
          'Ask about interview preparation strategies for specific companies.',
          'Get advice on which skills to prioritize for your career goal.',
          'Learn how to negotiate salary offers and evaluate compensation packages.',
        ],
        resources: []
      }
    }
  ]);

  const handleSend = async (text = input) => {
    const q = (text || '').trim();
    if (!q || isLoading) return;

    setMessages(prev => [...prev, { id: 'u_' + Date.now(), type: 'user', text: q }]);
    setInput('');
    setIsLoading(true);

    try {
      let advice = null;
      if (isGeminiActive()) {
        try {
          advice = await generateGeminiCareerAdvice(q, student);
        } catch (err) {
          console.warn("Gemini career advice failed, falling back:", err.message);
        }
      }

      if (!advice) {
        advice = getCareerAdvice(q);
      }

      setMessages(prev => [...prev, { id: 'ai_' + Date.now(), type: 'ai', answer: advice }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={26} color="#10B981" />
            AI Career Counselor
          </h1>
          <p className="page-desc">
            Get personalized career advice, job market insights, and strategic guidance for your tech career.
          </p>
        </div>
        <span className="badge badge-emerald"><Sparkles size={12} /> AI-Powered Advice</span>
      </div>

      {/* Quick Prompts */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>💡 Popular questions:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
          {CAREER_TOPICS.map((prompt, idx) => (
            <button key={idx} onClick={() => handleSend(prompt)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.76rem', borderRadius: 'var(--radius-full)' }}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {messages.map((msg) => {
          if (msg.type === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <div style={{
                  maxWidth: '75%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px 16px 4px 16px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  fontSize: '0.95rem', fontWeight: 500
                }}>
                  {msg.text}
                </div>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'var(--bg-input)', border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6EE7B7', flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              </div>
            );
          }

          const a = msg.answer;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Briefcase size={20} />
              </div>
              <div className="card" style={{ flex: 1, padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} color="#34D399" />
                  {a.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '1rem' }}>
                  {a.advice}
                </p>

                {a.actionItems && a.actionItems.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34D399', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✅ Action Items
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {a.actionItems.map((item, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ color: '#34D399', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {a.resources && a.resources.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>📚 Resources:</span>
                    {a.resources.map((r, i) => (
                      <span key={i} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Briefcase size={20} />
            </div>
            <div className="card" style={{ padding: '1rem 1.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Analyzing your question and generating personalized advice...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ position: 'sticky', bottom: '1rem', background: 'var(--bg-primary)', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="form-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about interviews, skills, salary, career paths..."
            style={{ flex: 1 }}
          />
          <button onClick={() => handleSend()} className="btn btn-primary" disabled={isLoading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
