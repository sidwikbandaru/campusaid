import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarDrawer from './components/SidebarDrawer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudyAssistantPage from './pages/StudyAssistantPage';
import CareerRoadmapPage from './pages/CareerRoadmapPage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import ResumeMatcherPage from './pages/ResumeMatcherPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PlannerPage from './pages/PlannerPage';
import NotesPage from './pages/NotesPage';
import CareerCounselorPage from './pages/CareerCounselorPage';
import ProfileModal from './components/ProfileModal';
import NotificationModal from './components/NotificationModal';
import AiSettingsModal from './components/AiSettingsModal';
import { getCurrentSession, signOutUser, getStudentProfile } from './services/studentService';
import { recordDailyLogin } from './services/gamificationService';
import { generateContextualNotifications } from './services/notificationService';

export default function App() {
  const [student, setStudent] = useState(() => getCurrentSession());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getCurrentSession()));
  const [activePage, setActivePage] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('campusaid_theme') || 'dark';
  });

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campusaid_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const existing = getCurrentSession();
    if (existing) {
      getStudentProfile(existing.studentId)
        .then((data) => {
          setStudent(data);
          setIsAuthenticated(true);
          // Gamification streak & daily login bonus
          const gamState = recordDailyLogin(data.studentId);
          generateContextualNotifications(data.studentId, gamState);
        })
        .catch((err) => console.error("Error loading student profile:", err));
    }
  }, []);

  const handleLoginSuccess = (studentData) => {
    setStudent(studentData);
    setIsAuthenticated(true);
    setActivePage('dashboard');
    const gamState = recordDailyLogin(studentData.studentId);
    generateContextualNotifications(studentData.studentId, gamState);
  };

  const handleLogout = () => {
    signOutUser();
    setStudent(null);
    setIsAuthenticated(false);
    setActivePage('dashboard');
    setIsDrawerOpen(false);
  };

  const handleProfileUpdated = (updated) => {
    setStudent(updated);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top sticky Navigation Header */}
      <Navbar
        setActivePage={setActivePage}
        student={student}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Slide-over Left Navigation Drawer (Overlay - does not disturb main screen) */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
        student={student}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <main className="main-content">
        {activePage === 'dashboard' && (
          <DashboardPage student={student} setActivePage={setActivePage} />
        )}
        {activePage === 'study' && (
          <StudyAssistantPage student={student} />
        )}
        {activePage === 'roadmap' && (
          <CareerRoadmapPage student={student} />
        )}
        {activePage === 'skills' && (
          <SkillGapPage student={student} />
        )}
        {activePage === 'interview' && (
          <InterviewPrepPage student={student} />
        )}
        {activePage === 'resume' && (
          <ResumeMatcherPage student={student} />
        )}
        {activePage === 'analytics' && (
          <AnalyticsPage student={student} />
        )}
        {activePage === 'planner' && (
          <PlannerPage student={student} />
        )}
        {activePage === 'notes' && (
          <NotesPage student={student} />
        )}
        {activePage === 'counselor' && (
          <CareerCounselorPage student={student} />
        )}
      </main>

      {/* Student Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        student={student}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        studentId={student?.studentId}
        onNavigate={(pageId) => {
          setActivePage(pageId);
          setIsNotificationsOpen(false);
        }}
      />

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />
    </div>
  );
}
