import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseSetup';
import { ref as dbRef, push, remove, get, update, query, orderByChild } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  School,
  Logout
} from '@mui/icons-material';

const DEFAULT_SUBJECTS = ['mathematics', 'chemistry', 'physics'];

const AdminDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [stats, setStats] = useState({ totalVideos: 0, totalStudents: 0 });
  const [openChapterDialog, setOpenChapterDialog] = useState(false);
  const [newChapter, setNewChapter] = useState('');
  const [users, setUsers] = useState([]);
  const [chapters, setChapters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadVideos();
    loadStats();
    loadUsers();
  }, []);

  useEffect(() => {
    if (subject) {
      loadChapters(subject);
    }
  }, [subject]);

  const checkAdminAuth = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }

    const userRef = dbRef(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists() || snapshot.val().role !== 'admin') {
      navigate('/study-page');
    }
  };

  const loadStats = async () => {
    const videosRef = dbRef(database, 'videos');
    const usersRef = dbRef(database, 'users');
    
    const [videosSnapshot, usersSnapshot] = await Promise.all([
      get(videosRef),
      get(usersRef)
    ]);

    const totalVideos = videosSnapshot.exists() ? Object.keys(videosSnapshot.val()).length : 0;
    const totalStudents = usersSnapshot.exists() 
      ? Object.values(usersSnapshot.val()).filter(user => user.role === 'student').length 
      : 0;

    setStats({ totalVideos, totalStudents });
  };

  const loadVideos = async () => {
    const videosRef = dbRef(database, 'videos');
    const videosQuery = query(videosRef, orderByChild('timestamp'));
    const snapshot = await get(videosQuery);
    console.log('Admin Videos snapshot:', snapshot.val());
    if (snapshot.exists()) {
      const videosData = Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...data
        }))
        .reverse();
      setVideos(videosData);
    }
  };

  const loadUsers = async () => {
    const usersRef = dbRef(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data
      }));
      setUsers(usersData);
    }
  };

  const loadChapters = async (subject) => {
    const chaptersRef = dbRef(database, `subjects/${subject}/chapters`);
    const snapshot = await get(chaptersRef);
    if (snapshot.exists()) {
      setChapters(snapshot.val());
    } else {
      setChapters({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const videoData = {
        title,
        description,
        url,
        subject,
        chapter,
        timestamp: Date.now()
      };

      if (editingVideo) {
        // Update existing video
        await update(dbRef(database, `videos/${editingVideo.id}`), videoData);
        setSuccess('Video updated successfully!');
      } else {
        // Add new video
        await push(dbRef(database, 'videos'), videoData);
        setSuccess('Video added successfully!');
      }

      setTitle('');
      setDescription('');
      setUrl('');
      setSubject('');
      setChapter('');
      setEditingVideo(null);
      setOpenDialog(false);
      loadVideos();
      loadStats();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description);
    setUrl(video.url);
    setSubject(video.subject);
    setChapter(video.chapter);
    setOpenDialog(true);
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setLoading(true);
      try {
        await remove(dbRef(database, `videos/${videoId}`));
        loadVideos();
        loadStats();
        setSuccess('Video deleted successfully!');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleAddChapter = async () => {
    if (!subject || !newChapter) return;
    setLoading(true);
    try {
      const chaptersRef = dbRef(database, `subjects/${subject}/chapters`);
      const newChapterRef = push(chaptersRef);
      await update(newChapterRef, { name: newChapter });
      setSuccess('Chapter added successfully!');
      setNewChapter('');
      setOpenChapterDialog(false);
      loadChapters(subject);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    setLoading(true);
    try {
      await update(dbRef(database, `users/${userId}`), { role: newRole });
      loadUsers();
      setSuccess('User role updated successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = async (subject, chapterKey, newName) => {
    const chapterRef = dbRef(database, `subjects/${subject}/chapters/${chapterKey}`);
    try {
      await update(chapterRef, { name: newName });
      setSuccess('Chapter updated successfully');
      loadChapters(subject);
    } catch (error) {
      setError('Error updating chapter');
    }
  };

  const handleDeleteChapter = async (subject, chapterKey) => {
    const chapterRef = dbRef(database, `subjects/${subject}/chapters/${chapterKey}`);
    try {
      await remove(chapterRef);
      setSuccess('Chapter deleted successfully');
      loadChapters(subject);
    } catch (error) {
      setError('Error deleting chapter');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#e1f5fe' }}>
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1976d2' }}>
        <Toolbar>
          <School sx={{ mr: 2, color: '#ffffff' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
            Sab Padhega India Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout sx={{ color: '#ffffff' }} />} sx={{ color: '#ffffff' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px', bgcolor: '#e1f5fe' }}>
        {error && <Alert severity="error" sx={{ mb: 3, bgcolor: '#e1f5fe' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, bgcolor: '#e1f5fe' }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom sx={{ color: '#1976d2' }}>
                  Total Videos
                </Typography>
                <Typography variant="h3" sx={{ color: '#1976d2' }}>
                  {stats.totalVideos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom sx={{ color: '#1976d2' }}>
                  Total Students
                </Typography>
                <Typography variant="h3" sx={{ color: '#1976d2' }}>
                  {stats.totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Video List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  Video Library
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingVideo(null);
                    setTitle('');
                    setDescription('');
                    setUrl('');
                    setSubject('');
                    setChapter('');
                    setOpenDialog(true);
                  }}
                  sx={{ bgcolor: '#1976d2', color: '#ffffff' }}
                >
                  Add Video
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setOpenChapterDialog(true)}
                  sx={{ color: '#1976d2' }}
                >
                  Add Chapter
                </Button>
              </Box>
              <List>
                {videos.map((video) => (
                  <React.Fragment key={video.id}>
                    <ListItem>
                      <ListItemText
                        primary={video.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ color: '#1976d2' }}>
                              {chapters[video.chapter]?.name}
                            </Typography>
                            {" — "}{video.description}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit">
                          <IconButton edge="end" onClick={() => handleEdit(video)} sx={{ mr: 1, color: '#1976d2' }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton edge="end" onClick={() => handleDelete(video.id)} sx={{ color: '#1976d2' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Chapter List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Chapter List
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#1976d2' }}>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                  sx={{ color: '#1976d2' }}
                >
                  {DEFAULT_SUBJECTS.map((subj) => (
                    <MenuItem key={subj} value={subj} sx={{ color: '#1976d2' }}>
                      {subj.charAt(0).toUpperCase() + subj.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {subject && (
                <List>
                  {Object.entries(chapters).map(([chapterKey, chapter]) => (
                    <React.Fragment key={chapterKey}>
                      <ListItem>
                        <ListItemText primary={chapter.name} sx={{ color: '#1976d2' }} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleEditChapter(subject, chapterKey, prompt('Enter new chapter name:'))} sx={{ color: '#1976d2' }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteChapter(subject, chapterKey)} sx={{ color: '#1976d2' }}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* User List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#e1f5fe', borderRadius: 2, border: '1px solid #90caf9' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                User Management
              </Typography>
              <List>
                {users.map((user) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemText
                        primary={user.email}
                        secondary={`Role: ${user.role}`}
                        sx={{ color: '#1976d2' }}
                      />
                      <ListItemSecondaryAction>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            label="Role"
                            sx={{ color: '#1976d2' }}
                          >
                            <MenuItem value="student" sx={{ color: '#1976d2' }}>Student</MenuItem>
                            <MenuItem value="admin" sx={{ color: '#1976d2' }}>Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Add/Edit Video Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: '#1976d2' }}>
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
                sx={{ color: '#1976d2' }}
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                required
                sx={{ color: '#1976d2' }}
              />
              <TextField
                fullWidth
                label="YouTube URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                margin="normal"
                required
                helperText="Enter a valid YouTube video URL"
                sx={{ color: '#1976d2' }}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: '#1976d2' }}>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                  sx={{ color: '#1976d2' }}
                >
                  {DEFAULT_SUBJECTS.map((subj) => (
                    <MenuItem key={subj} value={subj} sx={{ color: '#1976d2' }}>
                      {subj.charAt(0).toUpperCase() + subj.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: '#1976d2' }}>Chapter</InputLabel>
                <Select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  label="Chapter"
                  disabled={!subject}
                  sx={{ color: '#1976d2' }}
                >
                  {subject && Object.keys(chapters).map((key) => (
                    <MenuItem key={key} value={key} sx={{ color: '#1976d2' }}>
                      {chapters[key].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#1976d2' }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#1976d2', color: '#ffffff' }}
            >
              {loading ? <CircularProgress size={24} /> : editingVideo ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Chapter Dialog */}
        <Dialog open={openChapterDialog} onClose={() => setOpenChapterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: '#1976d2' }}>Add New Chapter</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{ color: '#1976d2' }}>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                  sx={{ color: '#1976d2' }}
                >
                  {DEFAULT_SUBJECTS.map((subj) => (
                    <MenuItem key={subj} value={subj} sx={{ color: '#1976d2' }}>
                      {subj.charAt(0).toUpperCase() + subj.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Chapter Name"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                margin="normal"
                required
                sx={{ color: '#1976d2' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenChapterDialog(false)} sx={{ color: '#1976d2' }}>Cancel</Button>
            <Button
              onClick={handleAddChapter}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#1976d2', color: '#ffffff' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Chapter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
