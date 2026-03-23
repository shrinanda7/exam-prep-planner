import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { defaultChapters } from '../data/syllabus';

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

  const dataRef = useRef(data);
  const pendingSaveRef = useRef(null);

  useEffect(() => { dataRef.current = data; }, [data]);

  const migrateSyllabus = (state) => {
      let migrated = { ...state };
      if (!migrated.chapters) migrated.chapters = [];
      if (!migrated.subjects) migrated.subjects = initialSubjects;
      
      const existingNames = new Set(migrated.chapters.map(c => c.name.toLowerCase()));
      const missingChapters = defaultChapters
        .filter(sc => !existingNames.has(sc.name.toLowerCase()))
        .map((sc, i) => ({
           id: `syl-${Date.now()}-${i}-${sc.subjectId}`,
           subjectId: sc.subjectId,
           classLevel: sc.classLevel,
           name: sc.name,
           status: 'Not Started',
           plannedDate: '',
           youtubeLinks: [],
           watched: false, pyqDone: false, practiceDone: false,
           rev1: false, rev2: false, rev3: false
        }));
      
      if (missingChapters.length > 0) {
          migrated.chapters = [...migrated.chapters, ...missingChapters];
      }

      migrated.chapters = migrated.chapters.map(c => {
         if (!c.youtubeLinks) c.youtubeLinks = c.youtubeLink ? [c.youtubeLink] : [];
         if (!c.classLevel) c.classLevel = '11'; 
         return c;
      });

      migrated.subjects = migrated.subjects.map(sub => {
         const subChaps = migrated.chapters.filter(c => c.subjectId === sub.id);
         const completed = subChaps.filter(c => c.status === 'Completed').length;
         const progress = subChaps.length > 0 ? Math.round((completed / subChaps.length) * 100) : 0;
         return { ...sub, progress };
      });
      return migrated;
  };

  useEffect(() => {
    const initializeStore = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareParam = params.get('shareId');

      if (shareParam) {
        setSyncId(shareParam);
        setCloudStatus('Syncing Sister Space...');
        
        const fetchCloud = async () => {
          if (pendingSaveRef.current) return; 
          try {
            const res = await fetch(`https://jsonblob.com/api/jsonBlob/${shareParam}`, {
              headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
              const cloudData = await res.json();
              const migratedCloud = migrateSyllabus(cloudData); // ALWAYS ensure syllabus
              
              if (JSON.stringify(migratedCloud) !== JSON.stringify(dataRef.current)) {
                setData(migratedCloud);
                // Also trigger an immediate cloud save so the cloud blob actually gets the missing chapters natively
                saveToCloud(migratedCloud, shareParam);
              }
              setCloudStatus('Co-op Live Sync 🌸');
            }
          } catch (e) {
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
      
      localData = migrateSyllabus(localData);

      setData(localData);
      localStorage.setItem('nityaVerseData', JSON.stringify(localData));

      let savedSyncId = localStorage.getItem('nityaVerseSyncId');
      
      if (!savedSyncId) {
        try {
          setCloudStatus('Creating Cloud Space...');
          const res = await fetch('https://jsonblob.com/api/jsonBlob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(localData)
          });
          const loc = res.headers.get('Location');
          const id = loc ? loc.split('/').pop() : null;
          if (id) {
            savedSyncId = id;
            localStorage.setItem('nityaVerseSyncId', savedSyncId);
            setSyncId(savedSyncId);
            setCloudStatus('Saved to Cloud');
          } else {
             setCloudStatus('Local Only');
          }
        } catch (e) {
             setCloudStatus('Local Only');
        }
      } else {
        setSyncId(savedSyncId);
        setCloudStatus('Saved to Cloud');
        
        try {
            await fetch(`https://jsonblob.com/api/jsonBlob/${savedSyncId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(localData)
            });
        } catch(e){}
      }
    };

    initializeStore();
  }, []);

  const saveToCloud = (newData, forceId = syncId) => {
    localStorage.setItem('nityaVerseData', JSON.stringify(newData));
    if (forceId) {
      setCloudStatus('Saving...');
      if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current);
      
      pendingSaveRef.current = setTimeout(async () => {
        try {
          const r = await fetch(`https://jsonblob.com/api/jsonBlob/${forceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(newData)
          });
          if (!r.ok) throw new Error('PUT Failed');
          setCloudStatus('Saved to Cloud');
        } catch (e) {
          setCloudStatus('Sync Error');
        } finally {
          pendingSaveRef.current = null;
        }
      }, 1500);
    }
  };

  const updateSubjectProgress = (newData, subjectId) => {
    const subjectChapters = newData.chapters.filter(c => c.subjectId === subjectId);
    const completed = subjectChapters.filter(c => c.status === 'Completed').length;
    const progress = subjectChapters.length > 0 ? Math.round((completed / subjectChapters.length) * 100) : 0;
    
    const newSubjects = newData.subjects.map(sub => 
      sub.id === subjectId ? { ...sub, progress } : sub
    );
    return { ...newData, subjects: newSubjects };
  };

  const addChapter = (chapter) => {
    setData(prev => {
      const next = { ...prev, chapters: [...prev.chapters, { ...chapter, id: Date.now().toString() }] };
      const nextWithProgress = updateSubjectProgress(next, chapter.subjectId);
      saveToCloud(nextWithProgress);
      return nextWithProgress;
    });
  };

  const updateChapter = (chapterId, updates) => {
    setData(prev => {
      const next = { ...prev, chapters: prev.chapters.map(chap => 
        chap.id === chapterId ? { ...chap, ...updates } : chap
      )};
      saveToCloud(next);
      return next;
    });
  };

  const deleteChapter = (chapterId) => {
    setData(prev => {
      const next = { ...prev, chapters: prev.chapters.filter(c => c.id !== chapterId) };
      saveToCloud(next);
      return next;
    });
  };

  const refreshSubjectProgress = (subjectId) => {
    setData(prev => {
      const next = updateSubjectProgress(prev, subjectId);
      saveToCloud(next);
      return next;
    });
  };

  const addDailyTask = (task) => {
    setData(prev => {
      const next = { ...prev, dailyTasks: [...prev.dailyTasks, { ...task, id: Date.now().toString() }] };
      saveToCloud(next);
      return next;
    });
  };

  const updateDailyTask = (taskId, updates) => {
    setData(prev => {
      const next = { ...prev, dailyTasks: prev.dailyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t) };
      saveToCloud(next);
      return next;
    });
  };

  const deleteDailyTask = (taskId) => {
    setData(prev => {
      const next = { ...prev, dailyTasks: prev.dailyTasks.filter(t => t.id !== taskId) };
      saveToCloud(next);
      return next;
    });
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
      refreshSubjectProgress,
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
