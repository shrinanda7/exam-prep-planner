import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { Calendar, Plus, Trash2 } from 'lucide-react';

export default function DailyPlanner() {
  const { data, addDailyTask, updateDailyTask, deleteDailyTask } = useStore();
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Medium');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = data.dailyTasks.filter(t => t.date === todayStr);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    addDailyTask({
      task: newTask,
      priority,
      date: todayStr,
      completed: false
    });
    setNewTask('');
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'High': return 'badge-high';
      case 'Low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="title-cute mb-6">
        <Calendar color="var(--color-pink-dark)" /> Today's Plan ✨
      </h1>

      <form onSubmit={handleAddTask} className="card mb-6 flex gap-4 items-center">
        <input 
          type="text" 
          className="input-cute" 
          placeholder="What are we studying today?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ flex: 1 }}
        />
        <select 
          className="input-cute" 
          style={{ width: '150px' }}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low Priority</option>
        </select>
        <button type="submit" className="btn btn-primary">
          <Plus size={18} /> Add
        </button>
      </form>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr' }}>
        {todaysTasks.length === 0 ? (
          <div className="card text-center text-muted py-8">
            <p>No tasks for today. Take a rest or add some! 🌸</p>
          </div>
        ) : (
          todaysTasks.map(task => (
            <div key={task.id} className="card flex items-center gap-4" style={{ padding: '1rem 1.5rem' }}>
              <input 
                type="checkbox" 
                className="checkbox-cute"
                checked={task.completed}
                onChange={(e) => updateDailyTask(task.id, { completed: e.target.checked })}
              />
              <div style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{task.task}</span>
              </div>
              <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                {task.priority}
              </span>
              <button 
                onClick={() => window.confirm('Delete this task?') && deleteDailyTask(task.id)}
                style={{ color: 'var(--color-text-light)' }}
                className="btn-icon"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
