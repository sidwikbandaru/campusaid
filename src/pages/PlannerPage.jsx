import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Code2,
  Brain,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = [
  { value: 'study', label: 'Study Session', icon: '📖', color: '#0EA5E9' },
  { value: 'coding', label: 'Coding Practice', icon: '💻', color: '#8B5CF6' },
  { value: 'interview', label: 'Interview Prep', icon: '🎤', color: '#10B981' },
  { value: 'project', label: 'Project Work', icon: '🔧', color: '#F59E0B' },
  { value: 'exam', label: 'Exam / Deadline', icon: '📝', color: '#EF4444' },
  { value: 'reading', label: 'Reading / Research', icon: '📚', color: '#6366F1' },
];

function getKey(studentId) {
  return `campusaid_planner_${studentId}`;
}

function loadPlanner(studentId) {
  try {
    const raw = localStorage.getItem(getKey(studentId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePlanner(studentId, data) {
  localStorage.setItem(getKey(studentId), JSON.stringify(data));
}

export default function PlannerPage({ student }) {
  const [planner, setPlanner] = useState({});
  const [showAdd, setShowAdd] = useState(null); // day name or null
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('study');
  const [newDuration, setNewDuration] = useState('60');

  useEffect(() => {
    if (student?.studentId) {
      setPlanner(loadPlanner(student.studentId));
    }
  }, [student?.studentId]);

  const addTask = (day) => {
    if (!newTitle.trim()) return;
    const updated = { ...planner };
    if (!updated[day]) updated[day] = [];
    updated[day].push({
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      duration: parseInt(newDuration) || 60,
      done: false,
    });
    // Sort by time
    updated[day].sort((a, b) => a.time.localeCompare(b.time));
    setPlanner(updated);
    savePlanner(student.studentId, updated);
    setNewTitle('');
    setShowAdd(null);
  };

  const removeTask = (day, taskId) => {
    const updated = { ...planner };
    updated[day] = (updated[day] || []).filter(t => t.id !== taskId);
    setPlanner(updated);
    savePlanner(student.studentId, updated);
  };

  const toggleDone = (day, taskId) => {
    const updated = { ...planner };
    const task = (updated[day] || []).find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      setPlanner({ ...updated });
      savePlanner(student.studentId, updated);
    }
  };

  const totalTasks = Object.values(planner).flat().length;
  const completedTasks = Object.values(planner).flat().filter(t => t.done).length;
  const totalMinutes = Object.values(planner).flat().reduce((s, t) => s + (t.duration || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarDays size={26} color="#8B5CF6" />
            Weekly Study Planner
          </h1>
          <p className="page-desc">
            Schedule study blocks, deadlines, and exam prep across your week.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-purple"><Clock size={12} /> {Math.round(totalMinutes / 60)}h planned</span>
          <span className="badge badge-emerald"><CheckCircle2 size={12} /> {completedTasks}/{totalTasks} done</span>
        </div>
      </div>

      {/* Weekly Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DAYS.map(day => {
          const tasks = planner[day] || [];
          const dayDone = tasks.filter(t => t.done).length;
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

          return (
            <div
              key={day}
              className="card"
              style={{
                borderLeft: isToday ? '4px solid #6366F1' : '4px solid transparent',
                padding: '1.25rem',
              }}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tasks.length > 0 ? '0.85rem' : '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{day}</h3>
                  {isToday && <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>Today</span>}
                  {tasks.length > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {dayDone}/{tasks.length} completed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setShowAdd(showAdd === day ? null : day); setNewTitle(''); }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  {showAdd === day ? <X size={14} /> : <Plus size={14} />}
                  {showAdd === day ? 'Cancel' : 'Add'}
                </button>
              </div>

              {/* Add Task Form */}
              {showAdd === day && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  alignItems: 'flex-end',
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Task</label>
                    <input
                      className="form-input"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Review Binary Trees"
                      onKeyDown={e => e.key === 'Enter' && addTask(day)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
                    <select
                      className="form-select"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Duration</label>
                    <select
                      className="form-select"
                      value={newDuration}
                      onChange={e => setNewDuration(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <button onClick={() => addTask(day)} className="btn btn-primary btn-sm" style={{ height: '38px' }}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              )}

              {/* Task List */}
              {tasks.length === 0 && showAdd !== day && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No tasks scheduled. Click "Add" to plan your day.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {tasks.map(task => {
                  const cat = CATEGORIES.find(c => c.value === task.category) || CATEGORIES[0];
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: task.done ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${task.done ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                        opacity: task.done ? 0.7 : 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleDone(day, task.id)}
                        style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.92rem' }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          textDecoration: task.done ? 'line-through' : 'none',
                          color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}>
                          {task.title}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: cat.color,
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        background: `${cat.color}15`,
                        borderRadius: '4px',
                      }}>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {task.time}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {task.duration}m
                      </span>
                      <button
                        onClick={() => removeTask(day, task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                        title="Remove task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
