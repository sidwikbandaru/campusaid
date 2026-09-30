import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, isGeminiActive } from '../services/geminiService';

export default function AiSettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setSavedSuccess(false);
      setTestStatus(null);
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClear = () => {
    setApiKey('');
    setGeminiApiKey('');
    setSavedSuccess(true);
    setTestStatus(null);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please enter a Gemini API Key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection to Google Gemini API...');

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToTest}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with "OK" in 2 words.' }] }]
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }

      setGeminiApiKey(keyToTest);
      setTestStatus('success');
      setTestMessage('Connected to Gemini 1.5 Flash API successfully!');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '92%' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                AI Engine Settings
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by Google Gemini 1.5 Flash
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Status Banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: isGeminiActive() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.08)',
              border: `1px solid ${isGeminiActive() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {isGeminiActive() ? (
              <Zap size={20} color="#10B981" />
            ) : (
              <ShieldCheck size={20} color="#6366F1" />
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isGeminiActive() ? '#10B981' : 'var(--text-primary)' }}>
                {isGeminiActive() ? 'Google Gemini AI is Active' : 'Offline / Mock Fallback Active'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isGeminiActive()
                  ? 'Study Assistant, Mock Interviews, and Career Counselor use live Gemini models.'
                  : 'Add your free Gemini API Key below for real-time generative responses.'}
              </div>
            </div>
          </div>

          {/* Input field */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Key size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Google Gemini API Key
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.88rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--accent-learning)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                Get a free API key at Google AI Studio <ExternalLink size={11} />
              </a>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>100% Free • No card needed</span>
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:
                  testStatus === 'success'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : testStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(99, 102, 241, 0.1)',
                color:
                  testStatus === 'success'
                    ? '#10B981'
                    : testStatus === 'error'
                    ? '#EF4444'
                    : 'var(--text-primary)',
                border: `1px solid ${
                  testStatus === 'success'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : testStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(99, 102, 241, 0.3)'
                }`
              }}
            >
              {testStatus === 'success' && <CheckCircle2 size={16} />}
              {testStatus === 'error' && <AlertCircle size={16} />}
              {testStatus === 'testing' && <Sparkles size={16} className="spin-animation" />}
              <span>{testMessage}</span>
            </div>
          )}

          {savedSuccess && !testStatus && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={15} />
              <span>Settings saved locally.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary btn-sm"
            style={{ color: '#EF4444' }}
            title="Remove stored key"
          >
            <Trash2 size={14} /> Clear
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              className="btn btn-secondary btn-sm"
              disabled={testStatus === 'testing'}
            >
              <Sparkles size={14} /> Test Connection
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
