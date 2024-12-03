import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, push, onValue, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const AdminDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ title: '', chapter: '', subject: '', file: null });

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState('');

  const database = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const videoRef = ref(database, 'videos');
    onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      const videoList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
      setVideos(videoList);
    });

    const subjectRef = ref(database, 'subjects');
    onValue(subjectRef, (snapshot) => {
      const data = snapshot.val();
      const subjectList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
      setSubjects(subjectList);
    });

    const chapterRef = ref(database, 'chapters');
    onValue(chapterRef, (snapshot) => {
      const data = snapshot.val();
      const chapterList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
      setChapters(chapterList);
    });
  }, [database]);

  const handleFileChange = (e) => {
    setNewVideo({ ...newVideo, file: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideo({ ...newVideo, [name]: value });
  };

  const addVideo = async () => {
    if (newVideo.file) {
      const storageReference = storageRef(storage, 'videos/' + newVideo.file.name);
      await uploadBytes(storageReference, newVideo.file);
      const url = await getDownloadURL(storageReference);
      const newVideoRef = push(ref(database, 'videos'));
      await set(newVideoRef, { ...newVideo, url });
      setNewVideo({ title: '', chapter: '', subject: '', file: null });
    }
  };

  const deleteVideo = async (id) => {
    await remove(ref(database, 'videos/' + id));
  };

  const addSubject = async () => {
    const newSubjectRef = push(ref(database, 'subjects'));
    await set(newSubjectRef, { name: newSubject });
    setNewSubject('');
  };

  const deleteSubject = async (id) => {
    await remove(ref(database, 'subjects/' + id));
  };

  const addChapter = async () => {
    const newChapterRef = push(ref(database, 'chapters'));
    await set(newChapterRef, { name: newChapter });
    setNewChapter('');
  };

  const deleteChapter = async (id) => {
    await remove(ref(database, 'chapters/' + id));
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Add New Video</h2>
      <input type="text" name="title" placeholder="Title" value={newVideo.title} onChange={handleInputChange} />
      <input type="text" name="chapter" placeholder="Chapter" value={newVideo.chapter} onChange={handleInputChange} />
      <input type="text" name="subject" placeholder="Subject" value={newVideo.subject} onChange={handleInputChange} />
      <input type="file" onChange={handleFileChange} />
      <button onClick={addVideo}>Add Video</button>

      <h2>Video List</h2>
      <ul>
        {videos.map((video) => (
          <li key={video.id}>
            {video.title} - {video.chapter} - {video.subject}
            <button onClick={() => deleteVideo(video.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Manage Subjects</h2>
      <input type="text" placeholder="New Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
      <button onClick={addSubject}>Add Subject</button>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id}>
            {subject.name}
            <button onClick={() => deleteSubject(subject.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Manage Chapters</h2>
      <input type="text" placeholder="New Chapter" value={newChapter} onChange={(e) => setNewChapter(e.target.value)} />
      <button onClick={addChapter}>Add Chapter</button>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            {chapter.name}
            <button onClick={() => deleteChapter(chapter.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
