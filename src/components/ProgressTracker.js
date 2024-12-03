import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseSetup';
import { ref, set, get, update } from 'firebase/database';
import './ProgressTracker.css';

const ProgressTracker = ({ videoId, onProgressUpdate }) => {
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [videoId]);

  const loadProgress = async () => {
    const user = auth.currentUser;
    if (!user || !videoId) return;

    const progressRef = ref(database, `userProgress/${user.uid}/${videoId}`);
    const snapshot = await get(progressRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      setProgress(data.progress || 0);
      setIsBookmarked(data.bookmarked || false);
      setNotes(data.notes || '');
    } else {
      setProgress(0);
      setIsBookmarked(false);
      setNotes('');
    }
  };

  const updateProgress = async (newProgress) => {
    const user = auth.currentUser;
    if (!user || !videoId) return;

    const progressRef = ref(database, `userProgress/${user.uid}/${videoId}`);
    await update(progressRef, {
      progress: newProgress,
      lastUpdated: Date.now()
    });

    setProgress(newProgress);
    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  };

  const toggleBookmark = async () => {
    const user = auth.currentUser;
    if (!user || !videoId) return;

    const newBookmarkState = !isBookmarked;
    const progressRef = ref(database, `userProgress/${user.uid}/${videoId}`);
    await update(progressRef, {
      bookmarked: newBookmarkState,
      lastUpdated: Date.now()
    });

    setIsBookmarked(newBookmarkState);
  };

  const saveNotes = async () => {
    const user = auth.currentUser;
    if (!user || !videoId) return;

    const progressRef = ref(database, `userProgress/${user.uid}/${videoId}`);
    await update(progressRef, {
      notes: notes,
      lastUpdated: Date.now()
    });
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          />
          <span className="progress-text">{Math.round(progress)}% Complete</span>
        </div>
        <button 
          className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={toggleBookmark}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      <div className="notes-section">
        <button 
          className="notes-toggle"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? 'Hide Notes' : 'Show Notes'}
        </button>
        
        {showNotes && (
          <div className="notes-container">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes about this video..."
              className="notes-input"
            />
            <button 
              className="save-notes-btn"
              onClick={saveNotes}
            >
              Save Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
