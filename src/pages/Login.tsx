import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';

// GoogleLoginButton은 조건부로만 로드
// Cursor 브라우저에서는 절대 로드되지 않도록 별도 파일로 분리
const GoogleLoginButton = lazy(() => {
  // 모듈 로드 시점에 브라우저 감지
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    const isCursorBrowser = userAgent.includes('electron') || userAgent.includes('cursor');
    
    if (isCursorBrowser) {
      // Cursor 브라우저에서는 빈 컴포넌트 반환 (모듈 로드 방지)
      return Promise.resolve({ 
        default: () => {
          console.warn('[DEBUG] GoogleLoginButton should not be rendered in Cursor browser');
          return null;
        }
      });
    }
  }
  
  // 일반 브라우저에서만 실제 컴포넌트 로드
  return import('../components/GoogleLoginButton');
});

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 에러 확인
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      // URL에서 에러 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);
  
  // 리디렉션 방식 로그인 핸들러
  const handleGoogleLoginRedirect = () => {
    setIsLoading(true);
    const returnUrl = window.location.pathname === '/login' ? '/' : window.location.pathname;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const redirectUrl = `${apiBaseUrl}/api/auth/google/redirect?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = redirectUrl;
  };

  const handleGoogleLoginSuccess = async (credentialResponse: { credential: string }) => {
    setIsLoading(true);
    try {
      // Google ID 토큰을 백엔드로 전송하여 인증
      const response = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const data = await response.json();
      
      // AuthContext에 사용자 정보 저장
      login(data.user, data.idToken);
      
      toast.success(`환영합니다, ${data.user.name}님!`);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = (error: any) => {
    console.error('Google Login Error:', error);
  };

  return (
    <div className="flex items-center justify-center min-h-full py-8">
      <Card className="w-full max-w-md mx-4 border-0 shadow-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Heart className="w-8 h-8 text-rose-600 fill-current" />
          </div>
          <CardTitle className="text-2xl">GGFinder에 오신 것을 환영합니다</CardTitle>
          <CardDescription>
            한국 신랑과 베트남 신부의 행복한 만남
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <div className="flex justify-center">
            <div className="space-y-4 w-full">
              {/* 리디렉션 방식 로그인 버튼 (모든 브라우저에서 작동) */}
              <button
                onClick={handleGoogleLoginRedirect}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {isLoading ? '처리 중...' : 'Google로 계속하기'}
                </span>
              </button>
              
              {/* 팝업 방식 로그인 버튼 (선택사항, 일반 브라우저에서만) */}
              {(() => {
                const userAgent = navigator.userAgent.toLowerCase();
                const isCursorBrowser = userAgent.includes('electron') || userAgent.includes('cursor');
                
                if (!isCursorBrowser) {
                  return (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">또는</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {(() => {
                const userAgent = navigator.userAgent.toLowerCase();
                const isCursorBrowser = userAgent.includes('electron') || userAgent.includes('cursor');
                
                if (!isCursorBrowser) {
                  return (
                    <Suspense fallback={<div className="text-sm text-gray-500">로딩 중...</div>}>
                      <GoogleLoginButton
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                      />
                    </Suspense>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t">
            로그인함으로써 GGFinder의{' '}
            <button className="text-rose-600 hover:underline">이용약관</button>과{' '}
            <button className="text-rose-600 hover:underline">개인정보처리방침</button>에 동의합니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
}