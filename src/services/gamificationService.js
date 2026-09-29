/**
 * CampusAid AI - Gamification Engine (XP, Levels & Badges)
 * Tracks student engagement points and unlocks achievement badges.
 */

const XP_ACTIONS = {
  STUDY_QUESTION: 10,
  ROADMAP_CHECKOFF: 15,
  SKILL_LEVEL_UP: 20,
  INTERVIEW_COMPLETE: 50,
  INTERVIEW_PERFECT: 100,
  FLASHCARD_SESSION: 12,
  RESUME_SCAN: 25,
  DAILY_LOGIN: 5,
  NOTE_SAVED: 8,
  STREAK_BONUS: 30,
};

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Freshman Explorer' },
  { level: 2, xp: 50, title: 'Curious Learner' },
  { level: 3, xp: 150, title: 'Rising Scholar' },
  { level: 4, xp: 300, title: 'Code Apprentice' },
  { level: 5, xp: 500, title: 'Knowledge Builder' },
  { level: 6, xp: 800, title: 'Skill Specialist' },
  { level: 7, xp: 1200, title: 'Tech Strategist' },
  { level: 8, xp: 1800, title: 'Campus Champion' },
  { level: 9, xp: 2500, title: 'Industry Ready' },
  { level: 10, xp: 3500, title: 'Placement Legend' },
];

const BADGE_DEFINITIONS = [
  { id: 'first_question', name: 'First Question', icon: '❓', desc: 'Ask your first study question', condition: (s) => s.totalQuestions >= 1 },
  { id: 'ten_questions', name: 'Curious Mind', icon: '🧠', desc: 'Ask 10 study questions', condition: (s) => s.totalQuestions >= 10 },
  { id: 'first_interview', name: 'Interview Rookie', icon: '🎤', desc: 'Complete your first mock interview', condition: (s) => s.totalInterviews >= 1 },
  { id: 'five_interviews', name: 'Interview Pro', icon: '🏅', desc: 'Complete 5 mock interviews', condition: (s) => s.totalInterviews >= 5 },
  { id: 'roadmap_started', name: 'Pathfinder', icon: '🗺️', desc: 'Check off your first roadmap skill', condition: (s) => s.roadmapCheckoffs >= 1 },
  { id: 'roadmap_ten', name: 'Milestone Master', icon: '🏗️', desc: 'Complete 10 roadmap skills', condition: (s) => s.roadmapCheckoffs >= 10 },
  { id: 'skill_mastered', name: 'Skill Slayer', icon: '⚔️', desc: 'Master your first skill (meet target)', condition: (s) => s.skillsMastered >= 1 },
  { id: 'level_5', name: 'Rising Star', icon: '⭐', desc: 'Reach Level 5', condition: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Campus Legend', icon: '👑', desc: 'Reach Level 10', condition: (s) => s.level >= 10 },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', desc: 'Maintain a 3-day login streak', condition: (s) => s.streak >= 3 },
  { id: 'streak_7', name: 'Unstoppable', icon: '💎', desc: '7-day login streak', condition: (s) => s.streak >= 7 },
  { id: 'note_taker', name: 'Note Taker', icon: '📝', desc: 'Save 5 study notes', condition: (s) => s.notesSaved >= 5 },
  { id: 'resume_scanned', name: 'Resume Polished', icon: '📄', desc: 'Scan your resume', condition: (s) => s.resumeScans >= 1 },
  { id: 'xp_500', name: 'XP Hunter', icon: '💰', desc: 'Earn 500 total XP', condition: (s) => s.totalXP >= 500 },
  { id: 'xp_2000', name: 'XP Titan', icon: '🏆', desc: 'Earn 2000 total XP', condition: (s) => s.totalXP >= 2000 },
];

function getKey(studentId) {
  return `campusaid_gamification_${studentId}`;
}

function getDefaultState() {
  return {
    totalXP: 0,
    level: 1,
    title: 'Freshman Explorer',
    streak: 0,
    lastLoginDate: null,
    totalQuestions: 0,
    totalInterviews: 0,
    roadmapCheckoffs: 0,
    skillsMastered: 0,
    notesSaved: 0,
    resumeScans: 0,
    unlockedBadges: [],
    xpHistory: [],
  };
}

export function getGamificationState(studentId) {
  try {
    const raw = localStorage.getItem(getKey(studentId));
    if (raw) return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch { /* empty */ }
  return getDefaultState();
}

function saveState(studentId, state) {
  localStorage.setItem(getKey(studentId), JSON.stringify(state));
}

function calculateLevel(xp) {
  let result = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.xp) result = t;
  }
  return result;
}

function getNextLevel(currentLevel) {
  const idx = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel);
  return idx < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[idx + 1] : null;
}

export function awardXP(studentId, action, customAmount = null) {
  const state = getGamificationState(studentId);
  const xpGain = customAmount || XP_ACTIONS[action] || 0;
  if (xpGain <= 0) return state;

  state.totalXP += xpGain;

  // Track action counts
  if (action === 'STUDY_QUESTION') state.totalQuestions++;
  if (action === 'INTERVIEW_COMPLETE' || action === 'INTERVIEW_PERFECT') state.totalInterviews++;
  if (action === 'ROADMAP_CHECKOFF') state.roadmapCheckoffs++;
  if (action === 'NOTE_SAVED') state.notesSaved++;
  if (action === 'RESUME_SCAN') state.resumeScans++;

  // XP history entry
  state.xpHistory.push({
    action,
    xp: xpGain,
    timestamp: Date.now(),
  });
  // Keep last 100 entries
  if (state.xpHistory.length > 100) state.xpHistory = state.xpHistory.slice(-100);

  // Recalculate level
  const levelInfo = calculateLevel(state.totalXP);
  state.level = levelInfo.level;
  state.title = levelInfo.title;

  // Check badges
  checkAndUnlockBadges(state);

  saveState(studentId, state);
  return state;
}

export function recordDailyLogin(studentId) {
  const state = getGamificationState(studentId);
  const today = new Date().toDateString();

  if (state.lastLoginDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streak = (state.lastLoginDate === yesterday) ? state.streak + 1 : 1;
    state.lastLoginDate = today;
    state.totalXP += XP_ACTIONS.DAILY_LOGIN;

    if (state.streak > 0 && state.streak % 3 === 0) {
      state.totalXP += XP_ACTIONS.STREAK_BONUS;
    }

    const levelInfo = calculateLevel(state.totalXP);
    state.level = levelInfo.level;
    state.title = levelInfo.title;
    checkAndUnlockBadges(state);
    saveState(studentId, state);
  }
  return state;
}

function checkAndUnlockBadges(state) {
  for (const badge of BADGE_DEFINITIONS) {
    if (!state.unlockedBadges.includes(badge.id) && badge.condition(state)) {
      state.unlockedBadges.push(badge.id);
    }
  }
}

export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

export function getNextLevelInfo(currentLevel) {
  return getNextLevel(currentLevel);
}

export { XP_ACTIONS, LEVEL_THRESHOLDS };
