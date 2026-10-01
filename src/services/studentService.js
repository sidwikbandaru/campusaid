/**
 * CampusAid AI - Student Service & Real-Life Authentication
 * 
 * Supports:
 * - Dynamic Sign Up with student profile creation (Major, Year, Career Goal)
 * - Sign In with real email & password validation
 * - Persistent local storage session management
 * - DynamoDB-compatible data structure
 * - REAL dynamic dashboard metrics computed from actual user activity
 */

const STORAGE_USERS_KEY = 'campusaid_registered_users';
const STORAGE_SESSION_KEY = 'campusaid_active_session';

// Avatar generator utility for unique student identities
function generateAvatar(name = 'Student') {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save users:", err);
  }
}

/**
 * Get active student session from localStorage
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

import { createFreshRoadmap, saveRoadmap } from './roadmapService.js';
import { generateSkillsForGoal, saveSkills } from './skillGapService.js';

/**
 * Cryptographic SHA-256 password hashing
 */
export async function hashPassword(password) {
  if (!password) return '';
  try {
    const msgBuffer = new TextEncoder().encode(password + "_campusaid_salt_2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return btoa(password);
  }
}

/**
 * Register a new student
 */
export async function signUpUser({ name, email, password, year, branch, careerGoal }) {
  const hashedPassword = await hashPassword(password);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return reject(new Error('An account with this email address already exists.'));
      }

      const newStudent = {
        studentId: 'stu_' + Math.random().toString(36).substring(2, 9),
        name: (name || '').trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        year: year || '3rd Year',
        branch: branch || 'Computer Science & Engineering',
        careerGoal: careerGoal || '',
        avatarUrl: generateAvatar(name)
      };

      users.push(newStudent);
      saveUsers(users);

      // Initialize dynamic student records cleanly (100% real, 0% fake progress)
      if (newStudent.careerGoal) {
        const freshRoadmap = createFreshRoadmap(newStudent.studentId, newStudent.careerGoal);
        saveRoadmap(newStudent.studentId, freshRoadmap);

        const freshSkills = generateSkillsForGoal(newStudent.studentId, newStudent.careerGoal);
        saveSkills(newStudent.studentId, freshSkills);
      }
      localStorage.setItem(`campusaid_course_progress_${newStudent.studentId}`, JSON.stringify({}));
      localStorage.setItem(`campusaid_interviews_${newStudent.studentId}`, JSON.stringify([]));
      localStorage.setItem(`campusaid_study_history_${newStudent.studentId}`, JSON.stringify([]));

      // Set active session (exclude password hash)
      const sessionUser = { ...newStudent };
      delete sessionUser.password;
      delete sessionUser.passwordHash;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 250);
  });
}

/**
 * Sign in an existing student
 */
export async function signInUser(email, password) {
  const hashedInput = await hashPassword(password);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return reject(new Error('No account found with this email. Please check your credentials or Sign Up.'));
      }

      const isValid = (user.passwordHash && user.passwordHash === hashedInput) || 
                      (user.password && user.password === password) ||
                      (user.password && user.password === hashedInput);

      if (!isValid) {
        return reject(new Error('Incorrect password. Please try again.'));
      }

      // Set active session
      const sessionUser = { ...user };
      delete sessionUser.password;
      delete sessionUser.passwordHash;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 250);
  });
}

/**
 * Sign out current student
 */
export function signOutUser() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

/**
 * Fetch student profile by studentId
 */
export async function getStudentProfile(studentId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = getCurrentSession();
      if (session && (!studentId || session.studentId === studentId)) {
        return resolve({ ...session });
      }
      const users = getStoredUsers();
      const user = users.find((u) => u.studentId === studentId);
      if (user) {
        resolve({ ...user });
      } else if (session) {
        resolve({ ...session });
      } else {
        resolve(null);
      }
    }, 120);
  });
}

/**
 * Update student profile attributes
 */
export async function updateStudentProfile(studentId, updates) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.studentId === studentId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveUsers(users);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(users[idx]));
        resolve(users[idx]);
      } else {
        const session = getCurrentSession() || {};
        const updated = { ...session, ...updates };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
        resolve(updated);
      }
    }, 120);
  });
}

/**
 * Get REAL aggregated dashboard progress metrics
 * Computed dynamically from the student's actual saved data
 */
export async function getDashboardMetrics(studentId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = getCurrentSession();
      const goal = session?.careerGoal || '';

      // === 1. Learning Progress: from enrolled course progress stored per-student ===
      const courseProgressKey = `campusaid_course_progress_${studentId || session?.studentId}`;
      let courseProgressData = {};
      try {
        const raw = localStorage.getItem(courseProgressKey);
        if (raw) courseProgressData = JSON.parse(raw);
      } catch { /* empty */ }
      
      // Calculate actual learning progress from saved course data
      const courseProgressValues = Object.values(courseProgressData);
      let learningProgress = 0;
      if (courseProgressValues.length > 0) {
        learningProgress = Math.round(
          courseProgressValues.reduce((sum, v) => sum + (v || 0), 0) / courseProgressValues.length
        );
      }

      // === 2. Career Progress: from roadmap skill checkoffs ===
      const roadmapKey = `campusaid_roadmap_${studentId || session?.studentId}`;
      let careerProgress = 0;
      try {
        const raw = localStorage.getItem(roadmapKey);
        if (raw) {
          const roadmap = JSON.parse(raw);
          if (roadmap.phases && roadmap.phases.length > 0) {
            let totalItems = 0;
            let doneItems = 0;
            roadmap.phases.forEach(phase => {
              phase.items.forEach(item => {
                totalItems++;
                if (item.done) doneItems++;
              });
            });
            careerProgress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
          }
        }
      } catch { /* empty */ }

      // === 3. Interview Progress: from mock interview history ===
      const interviewKey = `campusaid_interviews_${studentId || session?.studentId}`;
      let interviewProgress = 0;
      try {
        const raw = localStorage.getItem(interviewKey);
        if (raw) {
          const interviews = JSON.parse(raw);
          if (interviews.length > 0) {
            const totalScore = interviews.reduce((sum, i) => sum + (i.averageScore || 0), 0);
            // Scale: average score out of 10, mapped to 0-100
            interviewProgress = Math.round((totalScore / interviews.length) * 10);
          }
        }
      } catch { /* empty */ }

      // === 4. Today's Recommendation: dynamically based on roadmap & actual gaps ===
      let recTitle = "Set up your Career Roadmap to get personalized recommendations";
      let recCat = "Getting Started";
      let recReason = "Select your career goal and start checking off skills to receive AI-powered daily tasks.";
      let recBadge = "Start Here";

      try {
        const raw = localStorage.getItem(roadmapKey);
        if (raw) {
          const roadmap = JSON.parse(raw);
          if (roadmap && roadmap.phases && roadmap.phases.length > 0) {
            let found = false;
            for (const phase of roadmap.phases) {
              const nextItem = phase.items?.find(item => !item.done);
              if (nextItem) {
                recTitle = `${careerProgress === 0 ? 'Start' : 'Complete'}: ${nextItem.skill}`;
                recCat = phase.name.split(':')[0] || 'Milestone';
                recReason = `Your next targeted technical milestone for ${roadmap.targetRole || goal || 'career readiness'}.`;
                recBadge = careerProgress === 0 ? 'First Step' : 'High Impact';
                found = true;
                break;
              }
            }
            if (!found && careerProgress === 100) {
              recTitle = "All Career Milestones Completed!";
              recCat = "Placement Ready";
              recReason = "You have mastered all milestones in your career roadmap. Try mock interviews next!";
              recBadge = "Mastered";
            }
          }
        }
      } catch { /* empty */ }

      // === 5. Weekly Stats: from actual usage ===
      const studyHistoryKey = `campusaid_study_history_${studentId || session?.studentId}`;
      let questionsAsked = 0;
      try {
        const raw = localStorage.getItem(studyHistoryKey);
        if (raw) {
          const history = JSON.parse(raw);
          // Count questions asked in the last 7 days
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          questionsAsked = history.filter(h => (h.timestamp || 0) > weekAgo).length;
        }
      } catch { /* empty */ }

      // Count skills mastered from skill gap data
      const skillsKey = `campusaid_skills_${studentId || session?.studentId}`;
      let skillsMastered = 0;
      try {
        const raw = localStorage.getItem(skillsKey);
        if (raw) {
          const skills = JSON.parse(raw);
          skillsMastered = skills.filter(s => s.currentLevel >= s.targetLevel).length;
        }
      } catch { /* empty */ }

      // Count interviews done
      let mockInterviewsDone = 0;
      try {
        const raw = localStorage.getItem(interviewKey);
        if (raw) {
          const interviews = JSON.parse(raw);
          mockInterviewsDone = interviews.length;
        }
      } catch { /* empty */ }

      resolve({
        learningProgress,
        careerProgress,
        interviewProgress,
        todayRecommendation: {
          id: "rec_" + Date.now(),
          title: recTitle,
          category: recCat,
          timeEstimate: careerProgress > 0 ? '25 mins' : '5 mins',
          reason: recReason,
          actionUrl: "roadmap",
          badge: recBadge
        },
        weeklyStats: {
          questionsAsked,
          skillsMastered,
          mockInterviewsDone
        }
      });
    }, 150);
  });
}
