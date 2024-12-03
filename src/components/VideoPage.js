import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, AppBar, Toolbar, IconButton, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ref, get } from 'firebase/database';
import { auth, database } from '../firebaseSetup';

const VideoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedVideo } = location.state || {};

  const playerRef = useRef(null);

  const opts = {
    height: '500',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
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
          <Button color="inherit" sx={{ color: '#ffffff' }}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px', bgcolor: '#e1f5fe' }}>
        {selectedVideo ? (
          <Card sx={{ bgcolor: '#e1f5fe' }}>
            <CardContent>
              <iframe
                ref={playerRef}
                title="YouTube video player"
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '8px', border: '1px solid #90caf9' }}
              ></iframe>
              <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
                {selectedVideo.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {selectedVideo.subject.charAt(0).toUpperCase() + selectedVideo.subject.slice(1)} - {
                  selectedVideo.chapter
                }
              </Typography>
              <Typography variant="body1">
                {selectedVideo.description}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="h6">No video selected</Typography>
        )}
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2, bgcolor: '#1976d2', color: '#ffffff' }}>
          Back
        </Button>
      </Container>
    </Box>
  );
};

export default VideoPage;
