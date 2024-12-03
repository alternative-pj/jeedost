import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthUI from './authUI';
import AIStudyAssistant from './AIStudyAssistant';
import AdminDashboard from './components/AdminDashboard';
import StudyPage from './components/StudyPage';
import VideoPage from './components/VideoPage';
import { auth } from './firebaseSetup';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthUI />} />
          <Route 
            path="/ai-assistant" 
            element={
              <ProtectedRoute>
                <AIStudyAssistant />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-page" 
            element={
              <ProtectedRoute>
                <StudyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video" 
            element={
              <ProtectedRoute>
                <VideoPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
