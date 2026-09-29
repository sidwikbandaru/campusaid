import React, { useState } from 'react';
import {
  X,
  User,
  Save,
  CheckCircle2
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import { updateStudentProfile } from '../services/studentService';
import { ROADMAP_TRACKS } from '../services/roadmapService';

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

export default function ProfileModal({ isOpen, onClose, student, onProfileUpdated }) {
  const [name, setName] = useState(student?.name || '');
  const [year, setYear] = useState(student?.year || '1st Year');
  const [branch, setBranch] = useState(student?.branch || 'Computer Science & Engineering');
  const [careerGoal, setCareerGoal] = useState(student?.careerGoal || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever student updates
  React.useEffect(() => {
    if (student) {
      setName(student.name || '');
      setYear(student.year || '1st Year');
      setBranch(student.branch || 'Computer Science & Engineering');
      setCareerGoal(student.careerGoal || '');
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await updateStudentProfile(student?.studentId, {
        name,
        year,
        branch,
        careerGoal
      });
      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
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
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(99, 102, 241, 0.2)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818CF8'
          }}>
            <User size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Profile Settings</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Manage your academic parameters and switch your target career track.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <CustomSelect
                id="profile-year-select"
                value={year}
                onChange={setYear}
                options={YEAR_OPTIONS}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Major</label>
              <CustomSelect
                id="profile-branch-select"
                value={branch}
                onChange={setBranch}
                options={BRANCH_OPTIONS}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Target Career Goal</label>
            <CustomSelect
              id="profile-goal-select"
              value={careerGoal}
              onChange={setCareerGoal}
              options={ROADMAP_TRACKS.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary btn-sm"
              id="btn-save-profile"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
