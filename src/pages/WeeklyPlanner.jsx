import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

export default function WeeklyPlanner() {
  const { data, addDailyTask, updateDailyTask, deleteDailyTask } = useStore();
  const [newTasks, setNewTasks] = useState({});
  
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate()
    };
  });

  const weekTasks = data.dailyTasks.filter(t => weekDays.some(d => d.dateStr === t.date));
  const weekCompleted = weekTasks.filter(t => t.completed).length;
  const weekProgress = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  const handleAddTask = (dateStr) => {
    if (!newTasks[dateStr] || !newTasks[dateStr].trim()) return;
    addDailyTask({
      task: newTasks[dateStr],
      priority: 'Medium',
      date: dateStr,
      completed: false
    });
    setNewTasks(prev => ({ ...prev, [dateStr]: '' }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title-cute m-0">
          <CalendarDays color="var(--color-pink-dark)" /> Weekly Preview 🌿
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>{weekCompleted} / {weekTasks.length} Completed</span>
          <div className="progress-container" style={{ width: '150px', margin: 0 }}>
            <div className="progress-bar" style={{ width: `${weekProgress}%`, backgroundColor: 'var(--color-mint-dark)' }}></div>
          </div>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {weekDays.map(dayObj => {
          const dayTasks = data.dailyTasks.filter(t => t.date === dayObj.dateStr);
          const isToday = dayObj.dateStr === new Date().toISOString().split('T')[0];

          return (
            <div key={dayObj.dateStr} className="card flex-col" style={{ border: isToday ? '2px solid var(--color-pink-dark)' : '1px solid var(--color-border)', minHeight: '300px' }}>
              <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <strong style={{ color: isToday ? 'var(--color-pink-dark)' : 'var(--color-text)' }}>
                  {dayObj.dayName}
                </strong>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{dayObj.dateNum}</span>
              </div>
              
              <div className="flex-col gap-2 mb-4" style={{ flex: 1, overflowY: 'auto' }}>
                {dayTasks.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>No tasks</p>
                ) : (
                  dayTasks.map(task => (
                    <div key={task.id} className="flex gap-2 items-start justify-between" style={{ fontSize: '0.9rem' }}>
                      <div className="flex gap-2 items-start">
                        <input 
                          type="checkbox" 
                          className="checkbox-cute"
                          style={{ width: '16px', height: '16px', flexShrink: 0 }}
                          checked={task.completed}
                          onChange={(e) => updateDailyTask(task.id, { completed: e.target.checked })}
                        />
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1, wordBreak: 'break-word', marginTop: '1px' }}>
                          {task.task}
                        </span>
                      </div>
                      <button 
                        onClick={() => window.confirm('Delete this task?') && deleteDailyTask(task.id)}
                        style={{ color: 'var(--color-pink-dark)', padding: '2px', background: 'transparent' }}
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2" style={{ marginTop: 'auto' }}>
                <input 
                  type="text" 
                  className="input-cute"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  placeholder="Add task..."
                  value={newTasks[dayObj.dateStr] || ''}
                  onChange={(e) => setNewTasks(prev => ({ ...prev, [dayObj.dateStr]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask(dayObj.dateStr)}
                />
                <button className="btn btn-icon" onClick={() => handleAddTask(dayObj.dateStr)} style={{ flexShrink: 0 }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
