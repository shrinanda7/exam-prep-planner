import React from 'react';
import { useStore } from '../store/Store';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function SubjectDashboard() {
  const { data } = useStore();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <h1 className="title-cute mb-6">
        <BookOpen color="var(--color-pink-dark)" /> Subjects
      </h1>
      
      <div className="grid-cards">
        {data.subjects.map(sub => {
          const subjectChapters = data.chapters.filter(c => c.subjectId === sub.id);
          const completed = subjectChapters.filter(c => c.status === 'Completed').length;

          return (
            <div 
              key={sub.id} 
              className={`card ${sub.color}`} 
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => navigate(`/subjects/${sub.id}`)}
            >
              <h2 style={{ marginBottom: '0.5rem' }}>{sub.name}</h2>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                {completed} / {subjectChapters.length} Chapters Completed
              </p>
              
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Progress</span>
                <strong>{sub.progress}%</strong>
              </div>
              <div className="progress-container" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                <div className="progress-bar" style={{ width: `${sub.progress}%`, backgroundColor: 'rgba(0,0,0,0.15)' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
