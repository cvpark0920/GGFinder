import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
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
import { isNativePlatform } from './utils/platform';

// 플랫폼에 따라 적절한 라우터 선택
const PlatformRouter = ({ children }: { children: React.ReactNode }) => {
  // 네이티브 플랫폼(Android/iOS)에서는 HashRouter 사용
  // 웹에서는 BrowserRouter 사용 (SEO 최적화)
  // 안전하게 플랫폼 감지 (웹 환경에서 Capacitor가 없을 수 있음)
  let useHashRouter = false;
  try {
    useHashRouter = isNativePlatform();
  } catch (error) {
    // 에러 발생 시 웹 환경으로 간주
    useHashRouter = false;
  }
  
  if (useHashRouter) {
    return <HashRouter>{children}</HashRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <PlatformRouter>
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
          </PlatformRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}