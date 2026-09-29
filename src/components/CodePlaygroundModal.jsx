import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Terminal,
  Code2,
  CheckCircle2,
  Copy,
  Sparkles
} from 'lucide-react';

const SAMPLE_SNIPPETS = {
  "Binary Search (JS)": `// Binary Search in JavaScript: O(log N)
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let steps = 0;

  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    console.log(\`Step \${steps}: checking index \${mid} (value \${arr[mid]})\`);

    if (arr[mid] === target) {
      return { foundIndex: mid, stepsTaken: steps };
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return { foundIndex: -1, stepsTaken: steps };
}

const numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;
console.log("Searching for:", target);
const result = binarySearch(numbers, target);
console.log("Result:", result);`,

  "Async API Retry Loop": `// Exponential Backoff Retry Pattern
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(\`Attempt \${attempt}: Requesting \${url}...\`);
      if (attempt < 3) {
        throw new Error("503 Service Unavailable (Transient)");
      }
      return { status: 200, data: "Payload successfully retrieved!" };
    } catch (err) {
      console.log(\`Warning: \${err.message}\`);
      if (attempt === maxRetries) throw err;
      const delay = Math.pow(2, attempt) * 100;
      console.log(\`Backing off for \${delay}ms...\`);
    }
  }
}

fetchWithRetry("https://api.campusaid.edu/v1/courses")
  .then(res => console.log("Final Response:", res));`,

  "Event Loop Simulator": `// JavaScript Event Loop: Call Stack vs Microtask vs Macrotask
console.log("1. Synchronous log (Call Stack)");

setTimeout(() => {
  console.log("4. Macrotask (setTimeout callback)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Microtask (Promise .then resolution)");
});

console.log("2. Synchronous log ends");`
};

export default function CodePlaygroundModal({ isOpen, onClose }) {
  const [activeSnippetKey, setActiveSnippetKey] = useState("Binary Search (JS)");
  const [code, setCode] = useState(SAMPLE_SNIPPETS["Binary Search (JS)"]);
  const [outputLogs, setOutputLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectSnippet = (key) => {
    setActiveSnippetKey(key);
    setCode(SAMPLE_SNIPPETS[key]);
    setOutputLogs([]);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    const logs = [];

    // Custom console wrapper
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args) => {
        logs.push("[WARN] " + args.join(' '));
      },
      error: (...args) => {
        logs.push("[ERROR] " + args.join(' '));
      }
    };

    try {
      // Execute within custom context
      const runFn = new Function('console', code);
      runFn(customConsole);
      setOutputLogs(logs.length > 0 ? logs : ["Code executed with no console output."]);
    } catch (err) {
      setOutputLogs([...logs, `[RUNTIME ERROR]: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '840px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(14, 165, 233, 0.2)',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={22} color="var(--accent-learning)" />
              Interactive Code Sandbox
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Test code algorithms in real time with instant console logging and runtime execution.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Object.keys(SAMPLE_SNIPPETS).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectSnippet(key)}
                className={`btn btn-sm ${activeSnippetKey === key ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0B0F19',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            border: '1px solid var(--border-subtle)',
            borderBottom: 'none'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              JavaScript Sandbox (ES6+)
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                background: 'none',
                border: 'none',
                color: copied ? '#34D399' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem'
              }}
            >
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              background: '#0B0F19',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              color: '#E2E8F0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              padding: '0.85rem',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setOutputLogs([])}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            <RotateCcw size={13} />
            <span>Clear Output</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
            id="btn-run-code"
          >
            <Play size={14} fill="currentColor" />
            <span>Run Code</span>
          </button>
        </div>

        {/* Terminal Console Output */}
        <div style={{
          background: '#030712',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          minHeight: '110px',
          maxHeight: '160px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <Terminal size={14} />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Output</span>
          </div>

          {outputLogs.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Click "Run Code" above to execute and view output...
            </span>
          ) : (
            outputLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: log.includes('[RUNTIME ERROR]') ? '#EF4444' : log.includes('[WARN]') ? '#FBBF24' : '#A5B4FC',
                  lineHeight: '1.45',
                  marginBottom: '2px'
                }}
              >
                &gt; {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
