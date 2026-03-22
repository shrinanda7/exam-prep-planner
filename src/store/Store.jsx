import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const initialSubjects = [
  { id: '1', name: 'Physics', color: 'theme-physics', progress: 0 },
  { id: '2', name: 'Chemistry', color: 'theme-chemistry', progress: 0 },
  { id: '3', name: 'Mathematics', color: 'theme-maths', progress: 0 },
  { id: '4', name: 'Biology', color: 'theme-biology', progress: 0 },
];

const defaultState = {
  subjects: initialSubjects,
  chapters: [],
  dailyTasks: [],
  preferences: { name: 'Nitya' }
};

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [data, setData] = useState(defaultState);
  const [syncId, setSyncId] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('Initializing...');

  const isFirstLoad = useRef(true);
  const dataRef = useRef(data);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    const initializeStore = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareParam = params.get('shareId');

      if (shareParam) {
        setSyncId(shareParam);
        setCloudStatus('Syncing Sister Space...');
        
        const fetchCloud = async () => {
          try {
            const res = await fetch(`/api/jsonblob?id=${shareParam}`);
            if (res.ok) {
              const cloudData = await res.json();
              if (JSON.stringify(cloudData) !== JSON.stringify(dataRef.current)) {
                setData(cloudData);
              }
              setCloudStatus('Co-op Live Sync 🌸');
            }
          } catch (e) {
            console.error('Fetch error:', e);
            setCloudStatus('Sync Error');
          }
        };

        await fetchCloud();
        const interval = setInterval(fetchCloud, 5000);
        return () => clearInterval(interval);
      }

      let localData = defaultState;
      const saved = localStorage.getItem('nityaVerseData');
      if (saved) {
        try { localData = JSON.parse(saved); } catch(e){}
      }
      
      localData.chapters = localData.chapters.map(c => {
         if (!c.youtubeLinks) c.youtubeLinks = c.youtubeLink ? [c.youtubeLink] : [];
         return c;
      });
      setData(localData);

      let savedSyncId = localStorage.getItem('nityaVerseSyncId');
      
      if (!savedSyncId) {
        try {
          setCloudStatus('Creating Cloud Space...');
          const res = await fetch('/api/jsonblob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localData)
          });
          const { id } = await res.json();
          if (id) {
            savedSyncId = id;
            localStorage.setItem('nityaVerseSyncId', savedSyncId);
            setSyncId(savedSyncId);
            setCloudStatus('Saved to Cloud');
          } else {
             setCloudStatus('Local Only');
          }
        } catch (e) {
             console.error('Failed to create blob', e);
             setCloudStatus('Local Only');
        }
      } else {
        setSyncId(savedSyncId);
        setCloudStatus('Saved to Cloud');
        
        try {
            const res = await fetch(`/api/jsonblob?id=${savedSyncId}`);
            if (res.ok) setData(await res.json());
        } catch (e) {}
      }
    };

    initializeStore();
  }, []);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
    }
    
    localStorage.setItem('nityaVerseData', JSON.stringify(data));
    
    if (syncId) {
      setCloudStatus('Saving...');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(async () => {
        try {
          const r = await fetch(`/api/jsonblob?id=${syncId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataRef.current)
          });
          if (!r.ok) throw new Error('PUT Failed');
          setCloudStatus('Saved to Cloud');
        } catch (e) {
          setCloudStatus('Sync Error');
        }
      }, 1500);
    }
  }, [data, syncId]);

  const updateSubjectProgress = (subjectId) => {
    setData(prev => {
      const subjectChapters = prev.chapters.filter(c => c.subjectId === subjectId);
      const completed = subjectChapters.filter(c => c.status === 'Completed').length;
      const progress = subjectChapters.length > 0 ? Math.round((completed / subjectChapters.length) * 100) : 0;
      
      const newSubjects = prev.subjects.map(sub => 
        sub.id === subjectId ? { ...sub, progress } : sub
      );
      return { ...prev, subjects: newSubjects };
    });
  };

  const addChapter = (chapter) => {
    setData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { ...chapter, id: Date.now().toString() }]
    }));
    updateSubjectProgress(chapter.subjectId);
  };

  const updateChapter = (chapterId, updates) => {
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(chap => 
        chap.id === chapterId ? { ...chap, ...updates } : chap
      )
    }));
  };

  const deleteChapter = (chapterId) => {
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== chapterId)
    }));
  };

  const addDailyTask = (task) => {
    setData(prev => ({
      ...prev,
      dailyTasks: [...prev.dailyTasks, { ...task, id: Date.now().toString() }]
    }));
  };

  const updateDailyTask = (taskId, updates) => {
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
  };

  const deleteDailyTask = (taskId) => {
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter(t => t.id !== taskId)
    }));
  };

  const generateShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('data');
    if (syncId) {
      url.searchParams.set('shareId', syncId);
    }
    return url.toString();
  };

  return (
    <StoreContext.Provider value={{
      data,
      cloudStatus,
      addChapter,
      updateChapter,
      deleteChapter,
      updateSubjectProgress,
      addDailyTask,
      updateDailyTask,
      deleteDailyTask,
      generateShareLink
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
