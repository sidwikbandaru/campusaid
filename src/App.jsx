import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudyAssistantPage from './pages/StudyAssistantPage';
import CareerRoadmapPage from './pages/CareerRoadmapPage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import { getStudentProfile } from './services/studentService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for instant preview, can log out anytime
  const [activePage, setActivePage] = useState('dashboard');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    getStudentProfile()
      .then((data) => setStudent(data))
      .catch((err) => console.error("Error loading student profile:", err));
  }, []);

  const handleLoginSuccess = (studentData) => {
    setStudent(studentData);
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActivePage('login');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top sticky Navigation Header */}
      <Navbar
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
      </main>
    </div>
  );
}
