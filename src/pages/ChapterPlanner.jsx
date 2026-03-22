import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/Store';
import { ArrowLeft, Play, Plus, BookOpen, Trash2, Filter } from 'lucide-react';

export default function ChapterPlanner() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { data, addChapter, updateChapter, deleteChapter, refreshSubjectProgress } = useStore();

  const [activeClass, setActiveClass] = useState('All');
  const [newChapterName, setNewChapterName] = useState('');

  const subject = data.subjects.find(s => s.id === subjectId);
  const allChapters = data.chapters.filter(c => c.subjectId === subjectId);
  
  const filteredChapters = useMemo(() => {
    if (activeClass === 'All') return allChapters;
    return allChapters.filter(c => c.classLevel === activeClass);
  }, [allChapters, activeClass]);

  if (!subject) return <div>Subject not found</div>;

  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;
    addChapter({
      subjectId,
      classLevel: activeClass === 'All' ? '11' : activeClass,
      name: newChapterName,
      status: 'Not Started',
      plannedDate: '',
      youtubeLinks: [],
      watched: false,
      pyqDone: false,
      practiceDone: false,
      rev1: false,
      rev2: false,
      rev3: false
    });
    setNewChapterName('');
  };

  const syncUpdateChapter = (id, updates) => {
    updateChapter(id, updates);
    setTimeout(() => {
        refreshSubjectProgress(subjectId);
    }, 50);
  };

  const handleAddLink = (chapId, currentLinks, newLink) => {
    if (!newLink.trim()) return;
    if (newLink.includes('youtube.com') || newLink.includes('youtu.be')) {
      syncUpdateChapter(chapId, { youtubeLinks: [...(currentLinks || []), newLink] });
    } else {
      alert("Please enter a valid YouTube link (youtube.com or youtu.be)");
    }
  };

  const handleRemoveLink = (chapId, currentLinks, idxToRemove) => {
    syncUpdateChapter(chapId, { youtubeLinks: currentLinks.filter((_, i) => i !== idxToRemove) });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-completed';
      case 'Ongoing': return 'badge-ongoing';
      default: return 'badge-notstarted';
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/subjects')} className="btn btn-icon mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <ArrowLeft size={20} />
      </button>

      <div className={`card ${subject.color} mb-6`} style={{ border: 'none' }}>
        <h1 className="title-cute" style={{ margin: 0 }}>
          <BookOpen /> {subject.name} Planner
        </h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
          {allChapters.filter(c => c.status === 'Completed').length} / {allChapters.length} Total Chapters Completed
        </p>
      </div>

      <div className="flex gap-2 mb-6" style={{ background: 'var(--color-surface)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', boxShadow: 'var(--shadow-sm)' }}>
        <button className={`btn ${activeClass === 'All' ? 'btn-primary' : ''}`} onClick={() => setActiveClass('All')} style={{ background: activeClass === 'All' ? 'var(--color-pink-dark)' : 'transparent', color: activeClass === 'All' ? 'white' : 'var(--color-text-light)', boxShadow: 'none' }}>
          All
        </button>
        <button className={`btn ${activeClass === '11' ? 'btn-primary' : ''}`} onClick={() => setActiveClass('11')} style={{ background: activeClass === '11' ? 'var(--color-pink-dark)' : 'transparent', color: activeClass === '11' ? 'white' : 'var(--color-text-light)', boxShadow: 'none' }}>
          Class 11
        </button>
        <button className={`btn ${activeClass === '12' ? 'btn-primary' : ''}`} onClick={() => setActiveClass('12')} style={{ background: activeClass === '12' ? 'var(--color-pink-dark)' : 'transparent', color: activeClass === '12' ? 'white' : 'var(--color-text-light)', boxShadow: 'none' }}>
          Class 12
        </button>
      </div>

      <form onSubmit={handleAddChapter} className="flex gap-4 mb-6">
        <input 
          type="text" 
          className="input-cute" 
          placeholder={`Add a new ${activeClass !== 'All' ? `Class ${activeClass} ` : ''}chapter...`}
          value={newChapterName}
          onChange={(e) => setNewChapterName(e.target.value)}
          style={{ flex: 1, maxWidth: '400px' }}
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={18} /> Add
        </button>
      </form>

      <div className="table-container">
        <table className="styled-table" style={{ minWidth: '950px' }}>
          <thead>
            <tr>
              <th>Chapter Name</th>
              <th>Class</th>
              <th>Status</th>
              <th>Planned Date</th>
              <th style={{ minWidth: '200px' }}>YouTube Links</th>
              <th colSpan="2">Tasks</th>
              <th colSpan="3">Revisions</th>
            </tr>
            <tr>
              <th colSpan="5"></th>
              <th style={{ fontSize: '0.75rem' }}>Watch</th>
              <th style={{ fontSize: '0.75rem' }}>PYQ & Prac</th>
              <th style={{ fontSize: '0.75rem' }}>R1</th>
              <th style={{ fontSize: '0.75rem' }}>R2</th>
              <th style={{ fontSize: '0.75rem' }}>R3</th>
            </tr>
          </thead>
          <tbody>
            {filteredChapters.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>
                  No chapters yet. Start planning! ✨
                </td>
              </tr>
            ) : (
              filteredChapters.map(chap => (
                <tr key={chap.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div className="flex justify-between items-center gap-2">
                      <span>{chap.name}</span>
                      <button 
                        onClick={() => {
                          if(window.confirm('Delete this chapter?')) {
                            deleteChapter(chap.id);
                            setTimeout(() => refreshSubjectProgress(subjectId), 50);
                          }
                        }} 
                        style={{ color: 'var(--color-pink-dark)' }}
                        title="Delete Chapter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-medium" style={{ backgroundColor: 'var(--color-beige)' }}>
                       {chap.classLevel}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="input-cute"
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      value={chap.status}
                      onChange={(e) => syncUpdateChapter(chap.id, { status: e.target.value })}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="date" 
                      className="input-cute"
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      value={chap.plannedDate || ''}
                      onChange={(e) => syncUpdateChapter(chap.id, { plannedDate: e.target.value })}
                    />
                  </td>
                  <td>
                    <div className="flex-col gap-2">
                      {chap.youtubeLinks?.map((link, idx) => (
                        <div key={idx} className="flex gap-2 items-center" style={{ backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-pink-dark)', fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                            Video {idx + 1}
                          </a>
                          <button onClick={() => handleRemoveLink(chap.id, chap.youtubeLinks, idx)} style={{ color: 'var(--color-text-light)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <input 
                        type="url" 
                        className="input-cute"
                        placeholder="+ Add URL (Enter)"
                        style={{ padding: '0.3rem', fontSize: '0.75rem', width: '150px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLink(chap.id, chap.youtubeLinks, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </td>
                  
                  {/* Tasks */}
                  <td>
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="checkbox-cute"
                        checked={chap.watched}
                        onChange={(e) => syncUpdateChapter(chap.id, { watched: e.target.checked })}
                        title="Watched"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2 justify-center">
                       <input 
                        type="checkbox" 
                        className="checkbox-cute"
                        checked={chap.pyqDone}
                        onChange={(e) => syncUpdateChapter(chap.id, { pyqDone: e.target.checked })}
                        title="PYQ Done"
                      />
                      <input 
                        type="checkbox" 
                        className="checkbox-cute"
                        checked={chap.practiceDone}
                        onChange={(e) => syncUpdateChapter(chap.id, { practiceDone: e.target.checked })}
                        title="Practice Done"
                      />
                    </div>
                  </td>

                  {/* Revisions */}
                  <td>
                    <input 
                      type="checkbox" 
                      className="checkbox-cute"
                      checked={chap.rev1}
                      onChange={(e) => syncUpdateChapter(chap.id, { rev1: e.target.checked })}
                    />
                  </td>
                  <td>
                    <input 
                      type="checkbox" 
                      className="checkbox-cute"
                      checked={chap.rev2}
                      onChange={(e) => syncUpdateChapter(chap.id, { rev2: e.target.checked })}
                    />
                  </td>
                  <td>
                    <input 
                      type="checkbox" 
                      className="checkbox-cute"
                      checked={chap.rev3}
                      onChange={(e) => syncUpdateChapter(chap.id, { rev3: e.target.checked })}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
