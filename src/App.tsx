import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profiles from './pages/Profiles';
import ProfileList from './pages/ProfileList';
import ProfileDetail from './pages/ProfileDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ProcessDetail from './pages/ProcessDetail';
import Messages from './pages/Messages';
import VideoCall from './pages/VideoCall';
import ReceivedFavoritesPage from './pages/ReceivedFavoritesPage';
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="profiles" element={<Profiles />} />
                <Route path="brides" element={<ProfileList type="bride" />} />
                <Route path="grooms" element={<ProfileList type="groom" />} />
                <Route path="profile/:id" element={<ProfileDetail />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute requireActive={true} allowedRoles={['super_admin', 'platform_admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="process/:id"
                  element={
                    <ProtectedRoute requireActive={true}>
                      <ProcessDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute requireActive={true} allowedRoles={['super_admin', 'platform_admin']}>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="video-call"
                  element={
                    <ProtectedRoute requireActive={true}>
                      <VideoCall />
                    </ProtectedRoute>
                  }
                />
                <Route path="login" element={<Login />} />
                <Route path="auth/callback" element={<AuthCallback />} />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute requireActive={true}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="received-favorites"
                  element={
                    <ProtectedRoute requireActive={true}>
                      <ReceivedFavoritesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}