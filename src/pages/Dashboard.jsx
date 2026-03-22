import React from 'react';
import { useStore } from '../store/Store';
import { Target, Trophy, Flame } from 'lucide-react';

export default function Dashboard() {
  const { data } = useStore();
  
  const totalChapters = data.chapters.length;
  const completedChapters = data.chapters.filter(c => c.status === 'Completed').length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  
  const completedToday = data.dailyTasks.filter(t => t.completed && t.date === new Date().toISOString().split('T')[0]).length;
  let streak = completedToday > 0 ? 1 : 0;

  return (
    <div className="animate-fade-in">
      <div className="header-banner">
        <div>
          <h1 style={{ color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Welcome back, {data.preferences.name} 🌸</h1>
          <p style={{ color: '#fff', opacity: 0.9, fontSize: '1.1rem', fontWeight: 500 }}>
            "You are closer than yesterday ✨"
          </p>
        </div>
        <div className="streak-card">
          <Flame color="#ff7b5a" size={20} />
          {streak} Day Streak
        </div>
      </div>

      <div className="grid-cards mb-6">
        <div className="card flex items-center gap-4">
          <div className="btn-icon" style={{ backgroundColor: 'var(--color-mint)' }}>
            <Target size={24} color="var(--color-mint-dark)" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Overall Progress</h3>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{overallProgress}%</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${overallProgress}%`, backgroundColor: 'var(--color-mint-dark)' }}></div>
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="btn-icon" style={{ backgroundColor: 'var(--color-lavender)' }}>
            <Trophy size={24} color="var(--color-lavender-dark)" />
          </div>
          <div>
            <h3 className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Chapters Completed</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{completedChapters} / {totalChapters}</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Subject Progress</h2>
      <div className="grid-cards">
        {data.subjects.map(sub => (
          <div key={sub.id} className={`card ${sub.color}`} style={{ border: 'none' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{sub.name}</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Completion</span>
              <strong>{sub.progress}%</strong>
            </div>
            <div className="progress-container" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
              <div className="progress-bar" style={{ width: `${sub.progress}%`, backgroundColor: 'rgba(0,0,0,0.15)' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
