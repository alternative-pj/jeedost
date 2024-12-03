import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseSetup';
import { ref as dbRef, get, query, orderByChild, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  ListItemIcon,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandLess,
  PlayCircleOutline,
  MenuBook,
  School,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import './StudyPage.css';

const DEFAULT_SUBJECTS = ['mathematics', 'chemistry', 'physics'];

const StudyPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userProgress, setUserProgress] = useState({}); 
  const [chapters, setChapters] = useState({});
  const [subjects, setSubjects] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }
      const userRef = dbRef(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserRole(snapshot.val().role);
      }
      await loadUserProgress(user.uid);
    };

    checkAuth();
    loadVideos();
    loadSubjects();
  }, [navigate]);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    console.log('Chapters:', chapters);
    console.log('Videos:', videos);
  }, [chapters, videos]);

  useEffect(() => {
    console.log('Subjects:', subjects);
    console.log('Chapters:', chapters);
  }, [subjects, chapters]);

  const loadUserProgress = async (userId) => {
    const progressRef = dbRef(database, `userProgress/${userId}`);
    const snapshot = await get(progressRef);
    if (snapshot.exists()) {
      setUserProgress(snapshot.val()); 
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const videosRef = dbRef(database, 'videos');
      const videosQuery = query(videosRef, orderByChild('timestamp'));
      const snapshot = await get(videosQuery);
      console.log('Videos snapshot:', snapshot.val());
      if (snapshot.exists()) {
        const videosData = Object.entries(snapshot.val())
          .map(([id, data]) => ({
            id,
            ...data,
            youtubeId: extractYoutubeId(data.url)
          }))
          .reverse();
        setVideos(videosData);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (subject) => {
    const chaptersRef = dbRef(database, `subjects/${subject}/chapters`);
    const snapshot = await get(chaptersRef);
    console.log('Chapters snapshot:', snapshot.val());
    if (snapshot.exists()) {
      setChapters(snapshot.val());
    } else {
      setChapters({});
    }
  };

  const loadSubjects = async () => {
    const subjectsRef = dbRef(database, 'subjects');
    const snapshot = await get(subjectsRef);
    console.log('Subjects snapshot:', snapshot.val());
    if (snapshot.exists()) {
      setSubjects(snapshot.val());
    } else {
      setSubjects({});
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubjectClick = (subject) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
    setSelectedSubject(subject);
  };

  const handleChapterClick = (subject, chapter) => {
    setSelectedChapter(chapter);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === '' || video.subject === selectedSubject;
    const matchesChapter = selectedChapter === '' || video.chapter === selectedChapter;
    return matchesSearch && matchesSubject && matchesChapter;
  });

  const organizedVideos = {};
  filteredVideos.forEach(video => {
    if (!organizedVideos[video.subject]) {
      organizedVideos[video.subject] = {};
    }
    if (!organizedVideos[video.subject][video.chapter]) {
      organizedVideos[video.subject][video.chapter] = [];
    }
    organizedVideos[video.subject][video.chapter].push(video);
  });

  const opts = {
    height: '500',
    width: '100%',
    playerVars: {
      autoplay: 0, 
    },
  };

  const getVideosForChapter = (subjectKey, chapterKey) => {
    return videos.filter(video => video.subject === subjectKey && video.chapter === chapterKey);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#e1f5fe' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1976d2' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
            Sab Padhega India
          </Typography>
          <Button color="inherit" sx={{ color: '#ffffff' }} onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px', bgcolor: '#e1f5fe' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 0 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ p: 0 }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
                  Select a lecture to start learning
                </Typography>
                <Box sx={{ p: 0 }}>
                  {Object.entries(subjects).map(([subjectKey, subject]) => (
                    <Accordion key={subjectKey} sx={{ mb: 1, bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
                      <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#bbdefb', borderBottom: '1px solid #90caf9' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>{subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1)}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {subject.chapters && Object.entries(subject.chapters).map(([chapterKey, chapter], chapterIndex) => (
                          <Accordion key={chapterKey} sx={{ mb: 1, bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #81d4fa' }}>
                            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#b3e5fc', borderBottom: '1px solid #81d4fa' }}>
                              <Typography sx={{ fontWeight: 'bold', color: '#1565c0' }}>{chapterIndex + 1}. {chapter.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List>
                                {getVideosForChapter(subjectKey, chapterKey).map((video, videoIndex) => (
                                  <ListItem button key={video.id} onClick={() => navigate('/video', { state: { selectedVideo: video } })} sx={{ bgcolor: '#e1f5fe', boxShadow: 1, '&:hover': { bgcolor: '#bbdefb', boxShadow: 3 }, borderRadius: 2, border: '1px solid #90caf9', mb: 1 }}>
                                    <ListItemText primary={`${videoIndex + 1}. ${video.title}`} sx={{ color: '#0d47a1' }} />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudyPage;
