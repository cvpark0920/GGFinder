import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 이미 처리했으면 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    const token = searchParams.get('token');
    const returnUrl = searchParams.get('returnUrl') || '/';
    const error = searchParams.get('error');

    // 처리 시작 표시
    hasProcessed.current = true;

    if (error) {
      toast.error(`로그인 실패: ${error}`);
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('인증 토큰이 없습니다.');
      navigate('/login');
      return;
    }

    // 토큰으로 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const response = await fetch(`${apiBaseUrl}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Authentication failed');
        }

        const data = await response.json();
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AuthCallback.tsx:fetchUserInfo',
            message: 'User info received',
            data: {
              hasRealName: !!data.user.realName,
              hasPhone: !!data.user.phone,
              userId: data.user.id,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        }).catch(() => {});
        // #endregion
        
        // AuthContext에 사용자 정보 저장
        login(data.user, data.idToken);
        
        // 실명과 전화번호가 없으면 추가 정보 입력 페이지로 리디렉션
        if (!data.user.realName || !data.user.phone) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AuthCallback.tsx:redirectToCompleteRegistration',
              message: 'Redirecting to complete registration',
              data: {
                hasRealName: !!data.user.realName,
                hasPhone: !!data.user.phone,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'B',
            }),
          }).catch(() => {});
          // #endregion
          navigate('/complete-registration');
          return;
        }
        
        toast.success(`환영합니다, ${data.user.name}님!`);
        
        // 원래 페이지로 리디렉션
        navigate(returnUrl);
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-600">로그인 처리 중...</div>
    </div>
  );
}

