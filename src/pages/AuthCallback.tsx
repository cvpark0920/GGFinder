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
      navigate('/login');
      return;
    }

    if (!token) {
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
        
        // AuthContext에 사용자 정보 저장
        login(data.user, data.idToken);
        
        toast.success(`환영합니다, ${data.user.name}님!`);
        
        // 원래 페이지로 리디렉션
        navigate(returnUrl);
      } catch (error) {
        console.error('Auth callback error:', error);
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

