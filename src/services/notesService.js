/**
 * CampusAid AI - Notes & Bookmarks Service
 * Save, star, search, and manage study answers as personal notes.
 */

function getKey(studentId) {
  return `campusaid_notes_${studentId}`;
}

export function getNotes(studentId) {
  try {
    const raw = localStorage.getItem(getKey(studentId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotes(studentId, notes) {
  localStorage.setItem(getKey(studentId), JSON.stringify(notes));
}

export function addNote(studentId, { topic, content, source = 'study', tags = [] }) {
  const notes = getNotes(studentId);
  const note = {
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    topic,
    content,
    source,
    tags,
    starred: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.unshift(note);
  saveNotes(studentId, notes);
  return note;
}

export function toggleStar(studentId, noteId) {
  const notes = getNotes(studentId);
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.starred = !note.starred;
    note.updatedAt = Date.now();
    saveNotes(studentId, notes);
  }
  return notes;
}

export function deleteNote(studentId, noteId) {
  let notes = getNotes(studentId);
  notes = notes.filter(n => n.id !== noteId);
  saveNotes(studentId, notes);
  return notes;
}

export function updateNote(studentId, noteId, updates) {
  const notes = getNotes(studentId);
  const note = notes.find(n => n.id === noteId);
  if (note) {
    Object.assign(note, updates, { updatedAt: Date.now() });
    saveNotes(studentId, notes);
  }
  return notes;
}

export function searchNotes(studentId, query) {
  const notes = getNotes(studentId);
  const q = query.toLowerCase();
  return notes.filter(n =>
    n.topic.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  );
}
