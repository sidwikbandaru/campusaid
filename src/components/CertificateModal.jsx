import React from 'react';
import {
  X,
  Printer,
  Award
} from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, student, metrics }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '750px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(99, 102, 241, 0.25)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
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

        {/* Certificate Printable Sheet */}
        <div id="placement-certificate" style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Watermark badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Award size={36} />
          </div>

          <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#818CF8', fontWeight: 700, marginBottom: '0.35rem' }}>
            CAMPUSAID AI • OFFICIAL PLACEMENT READINESS REPORT
          </h3>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1.25rem', color: '#FFFFFF' }}>
            Technical Competency Certificate
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            This verified dossier certifies that
          </p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>
            {student?.name || 'Student'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
            has completed targeted curriculum milestones and demonstrated technical interview competency in:
          </p>

          {/* Goal Pill */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            color: '#C7D2FE',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '2rem'
          }}>
            {student?.careerGoal || 'Career Track in Progress'}
          </div>

          {/* Verified Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 0'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-learning)' }}>
                {metrics?.learningProgress ?? 0}%
              </div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Coursework Mastery
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-career)' }}>
                {metrics?.careerProgress ?? 0}%
              </div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Roadmap Milestones
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-interview)' }}>
                {metrics?.interviewProgress ?? 0}%
              </div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Mock Interview Score
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>Verified Student ID: <code>{student?.studentId || '—'}</code></span>
            <span>Issue Date: <strong>{currentDate}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            id="btn-print-certificate"
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
