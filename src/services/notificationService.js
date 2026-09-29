/**
 * CampusAid AI - Notification Center Service
 * Manages reminders, streak alerts, and recommended daily tasks.
 */

function getKey(studentId) {
  return `campusaid_notifications_${studentId}`;
}

export function getNotifications(studentId) {
  try {
    const raw = localStorage.getItem(getKey(studentId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotifications(studentId, notifs) {
  localStorage.setItem(getKey(studentId), JSON.stringify(notifs));
}

export function addNotification(studentId, { title, message, type = 'info', icon = '🔔' }) {
  const notifs = getNotifications(studentId);
  const notif = {
    id: 'notif_' + Date.now(),
    title,
    message,
    type, // 'info' | 'success' | 'warning' | 'xp' | 'badge' | 'streak'
    icon,
    read: false,
    createdAt: Date.now(),
  };
  notifs.unshift(notif);
  // Keep last 50
  if (notifs.length > 50) notifs.length = 50;
  saveNotifications(studentId, notifs);
  return notif;
}

export function markAsRead(studentId, notifId) {
  const notifs = getNotifications(studentId);
  const n = notifs.find(x => x.id === notifId);
  if (n) {
    n.read = true;
    saveNotifications(studentId, notifs);
  }
  return notifs;
}

export function markAllAsRead(studentId) {
  const notifs = getNotifications(studentId);
  notifs.forEach(n => n.read = true);
  saveNotifications(studentId, notifs);
  return notifs;
}

export function clearAll(studentId) {
  saveNotifications(studentId, []);
  return [];
}

export function getUnreadCount(studentId) {
  return getNotifications(studentId).filter(n => !n.read).length;
}

// Generate contextual notifications based on student activity
export function generateContextualNotifications(studentId, gamState) {
  const notifs = [];
  
  if (gamState.streak >= 3 && gamState.streak % 3 === 0) {
    notifs.push({ title: '🔥 Streak Bonus!', message: `${gamState.streak}-day streak! +30 XP bonus awarded.`, type: 'streak', icon: '🔥' });
  }
  
  if (gamState.level >= 5 && !gamState.unlockedBadges.includes('level_5_notified')) {
    notifs.push({ title: '⭐ Level Up!', message: `You reached Level ${gamState.level}: ${gamState.title}!`, type: 'xp', icon: '⭐' });
  }

  // Check recent badges
  const recentBadges = gamState.unlockedBadges.slice(-1);
  if (recentBadges.length > 0) {
    notifs.push({ title: '🏆 Badge Unlocked!', message: `New achievement unlocked! Check your badges.`, type: 'badge', icon: '🏆' });
  }

  notifs.forEach(n => addNotification(studentId, n));
  return notifs;
}
