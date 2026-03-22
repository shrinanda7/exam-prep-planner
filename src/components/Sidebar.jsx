import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, CalendarDays, Share2, Cloud, CloudOff } from 'lucide-react';
import { useStore } from '../store/Store';

export default function Sidebar() {
  const { generateShareLink, cloudStatus } = useStore();

  const handleShare = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  return (
    <aside className="sidebar">
      <div className="mb-6 title-cute">
        <h2 style={{ margin: 0 }}>NityaVerse 🌸</h2>
      </div>

      <nav className="flex-col gap-2">
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/subjects" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          Subjects
        </NavLink>
        <NavLink to="/daily" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          Daily Tasks
        </NavLink>
        <NavLink to="/weekly" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <CalendarDays size={20} />
          Weekly Plan
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
          {cloudStatus.includes('Error') ? <CloudOff size={14} color="var(--color-pink-dark)"/> : <Cloud size={14} color="var(--color-mint-dark)" />}
          {cloudStatus}
        </div>
        <button onClick={handleShare} className="btn btn-outline w-full justify-center">
          <Share2 size={18} />
          Share Co-op Link
        </button>
      </div>
    </aside>
  );
}
