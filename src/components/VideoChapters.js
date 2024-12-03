import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseSetup';
import { ref, get, set, update } from 'firebase/database';
import './VideoChapters.css';

const VideoChapters = ({ videoId, currentTime, onSeek }) => {
  const [chapters, setChapters] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', timestamp: '' });
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    loadChapters();
    checkUserRole();
  }, [videoId]);

  const checkUserRole = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      setUserRole(snapshot.val().role);
    }
  };

  const loadChapters = async () => {
    if (!videoId) return;

    const chaptersRef = ref(database, `videoChapters/${videoId}`);
    const snapshot = await get(chaptersRef);
    
    if (snapshot.exists()) {
      const chaptersData = Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...data
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setChapters(chaptersData);
    }
  };

  const getCurrentChapter = () => {
    if (!chapters.length) return null;
    
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].timestamp) {
        return chapters[i];
      }
    }
    return chapters[0];
  };

  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseTimestamp = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const handleAddChapter = async () => {
    if (!videoId || !newChapter.title || !newChapter.timestamp) return;

    const timestamp = parseTimestamp(newChapter.timestamp);
    const chapterId = Date.now().toString();
    const chapterRef = ref(database, `videoChapters/${videoId}/${chapterId}`);
    
    await set(chapterRef, {
      title: newChapter.title,
      timestamp: timestamp
    });

    setNewChapter({ title: '', timestamp: '' });
    loadChapters();
  };

  const handleDeleteChapter = async (chapterId) => {
    const chapterRef = ref(database, `videoChapters/${videoId}/${chapterId}`);
    await set(chapterRef, null);
    loadChapters();
  };

  const currentChapter = getCurrentChapter();

  return (
    <div className="video-chapters">
      <div className="chapters-header">
        <h3>Chapters</h3>
        {userRole === 'admin' && (
          <button 
            className="edit-chapters-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done' : 'Edit Chapters'}
          </button>
        )}
      </div>

      {isEditing && userRole === 'admin' && (
        <div className="add-chapter-form">
          <input
            type="text"
            placeholder="Chapter Title"
            value={newChapter.title}
            onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Timestamp (mm:ss)"
            value={newChapter.timestamp}
            onChange={(e) => setNewChapter({ ...newChapter, timestamp: e.target.value })}
          />
          <button onClick={handleAddChapter}>Add Chapter</button>
        </div>
      )}

      <div className="chapters-list">
        {chapters.map((chapter) => (
          <div 
            key={chapter.id}
            className={`chapter-item ${currentChapter?.id === chapter.id ? 'active' : ''}`}
            onClick={() => onSeek(chapter.timestamp)}
          >
            <div className="chapter-content">
              <span className="chapter-timestamp">{formatTimestamp(chapter.timestamp)}</span>
              <span className="chapter-title">{chapter.title}</span>
            </div>
            {isEditing && userRole === 'admin' && (
              <button 
                className="delete-chapter-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChapter(chapter.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoChapters;
