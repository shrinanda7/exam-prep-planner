import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SubjectDashboard from './pages/SubjectDashboard';
import ChapterPlanner from './pages/ChapterPlanner';
import DailyPlanner from './pages/DailyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';

export default function App() {
  return (
    <HashRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectDashboard />} />
            <Route path="/subjects/:subjectId" element={<ChapterPlanner />} />
            <Route path="/daily" element={<DailyPlanner />} />
            <Route path="/weekly" element={<WeeklyPlanner />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
