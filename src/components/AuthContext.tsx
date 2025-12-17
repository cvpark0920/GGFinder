import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  picture: string | null;
  realName?: string | null;
  phone?: string | null;
  role: string;
  status: string;
  agencyId: number | null;
  agency?: {
    id: number;
    name: string;
    role: string;
  } | null;
  joinDate: string;
  lastLogin: string | null;
}

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User, token: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:login',message:'Login called',data:{userId:userData?.id,userRole:userData?.role,userName:userData?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    setUser(userData);
    setIdToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('idToken', token);
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('idToken');
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('idToken');
    // #region agent log
    const storedUser = localStorage.getItem('user');
    fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:checkAuth:entry',message:'checkAuth called',data:{hasToken:!!storedToken,storedUserRole:storedUser?JSON.parse(storedUser).role:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:checkAuth:apiResponse',message:'API response received',data:{userId:data.user?.id,userRole:data.user?.role,userName:data.user?.name,joinDate:data.user?.joinDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // joinDate를 ISO 문자열로 변환하여 저장
        const userData = {
          ...data.user,
          joinDate: data.user.joinDate ? (typeof data.user.joinDate === 'string' ? data.user.joinDate : new Date(data.user.joinDate).toISOString()) : null,
          lastLogin: data.user.lastLogin ? (typeof data.user.lastLogin === 'string' ? data.user.lastLogin : new Date(data.user.lastLogin).toISOString()) : null,
        };
        setUser(userData);
        setIdToken(storedToken);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:checkAuth:setUser',message:'User state updated',data:{userId:data.user?.id,userRole:data.user?.role,joinDate:userData.joinDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } else {
        // 토큰이 유효하지 않으면 로그아웃
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
