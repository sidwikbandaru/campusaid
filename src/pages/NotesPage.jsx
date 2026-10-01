import React, { useState, useEffect } from 'react';
import {
  BookmarkPlus,
  Star,
  Search,
  Trash2,
  StickyNote,
  Tag,
  Clock,
  X,
  Plus
} from 'lucide-react';
import { getNotes, addNote, toggleStar, deleteNote } from '../services/notesService';
import { awardXP } from '../services/gamificationService';

export default function NotesPage({ student }) {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'starred'
  const [showAdd, setShowAdd] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    if (student?.studentId) {
      setNotes(getNotes(student.studentId));
    }
  }, [student?.studentId]);

  const handleAdd = () => {
    if (!newTopic.trim() || !newContent.trim()) return;
    addNote(student.studentId, {
      topic: newTopic.trim(),
      content: newContent.trim(),
      source: 'manual',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    awardXP(student.studentId, 'NOTE_SAVED');
    setNotes(getNotes(student.studentId));
    setNewTopic('');
    setNewContent('');
    setNewTags('');
    setShowAdd(false);
  };

  const handleStar = (noteId) => {
    toggleStar(student.studentId, noteId);
    setNotes(getNotes(student.studentId));
  };

  const handleDelete = (noteId) => {
    deleteNote(student.studentId, noteId);
    setNotes(getNotes(student.studentId));
  };

  const filtered = notes.filter(n => {
    if (filterMode === 'starred' && !n.starred) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.topic.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <StickyNote size={26} color="#EC4899" />
            Notes & Bookmarks
          </h1>
          <p className="page-desc">
            Save study answers, bookmark key concepts, and revisit important topics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-purple">{notes.length} Notes</span>
          <span className="badge badge-amber"><Star size={12} /> {notes.filter(n => n.starred).length} Starred</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes by topic, content, or tag..."
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Filters */}
        <button
          onClick={() => setFilterMode(filterMode === 'all' ? 'starred' : 'all')}
          className={`btn btn-sm ${filterMode === 'starred' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Star size={14} />
          {filterMode === 'starred' ? 'Starred Only' : 'All Notes'}
        </button>

        {/* Add */}
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary btn-sm">
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          {showAdd ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookmarkPlus size={18} color="#EC4899" /> Create New Note
          </h3>
          <div className="form-group">
            <label className="form-label">Topic / Title</label>
            <input className="form-input" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="e.g. Binary Search Key Points" />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Write your notes here..."
              rows={5}
              style={{ resize: 'vertical', width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0.65rem 0.95rem', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="e.g. algorithms, trees, interview" />
          </div>
          <button onClick={handleAdd} className="btn btn-primary" disabled={!newTopic.trim() || !newContent.trim()}>
            <BookmarkPlus size={16} /> Save Note (+8 XP)
          </button>
        </div>
      )}

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <StickyNote size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {searchQuery ? 'No notes match your search' : 'No notes yet'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {searchQuery ? 'Try different keywords or clear your search.' : 'Save important study answers or create manual notes to build your knowledge library.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filtered.map(note => (
            <div key={note.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>{note.topic}</h4>
                  <button
                    onClick={() => handleStar(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.starred ? '#FBBF24' : 'var(--text-muted)', padding: '0.2rem' }}
                    title={note.starred ? 'Unstar' : 'Star'}
                  >
                    <Star size={16} fill={note.starred ? '#FBBF24' : 'none'} />
                  </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '0.75rem', maxHeight: '120px', overflow: 'hidden' }}>
                  {note.content}
                </p>
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {note.tags.map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(139, 92, 246, 0.12)',
                        color: '#C4B5FD',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                      }}>
                        <Tag size={9} style={{ marginRight: '2px' }} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={11} /> {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(note.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
