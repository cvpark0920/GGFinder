import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { User, Phone } from 'lucide-react';

export default function CompleteRegistration() {
  const { user, login, idToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // #region agent log
  const logEvent = (message: string, data: any) => {
    fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CompleteRegistration.tsx',
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
  };

  React.useEffect(() => {
    logEvent('Component mounted', {
      hasUser: !!user,
      userId: user?.id,
      hasRealName: !!user?.realName,
      hasPhone: !!user?.phone,
    });
  }, [user]);
  // #endregion

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // #region agent log
    logEvent('Form submit attempt', {
      realName,
      phone,
      realNameLength: realName.length,
      phoneLength: phone.length,
    });
    // #endregion

    if (!realName.trim()) {
      toast.error('실명을 입력해주세요.');
      return;
    }

    if (!phone.trim()) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }

    // 전화번호 형식 간단 검증 (숫자, 하이픈, 공백만 허용)
    const phoneRegex = /^[0-9\s\-]+$/;
    if (!phoneRegex.test(phone)) {
      toast.error('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // #region agent log
      logEvent('API call start', {
        userId: user?.id,
        realName,
        phone,
      });
      // #endregion

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBaseUrl}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          realName: realName.trim(),
          phone: phone.trim(),
        }),
      });

      // #region agent log
      logEvent('API call response', {
        status: response.status,
        ok: response.ok,
      });
      // #endregion

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '정보 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      
      // AuthContext 업데이트
      if (user && idToken) {
        login({ ...user, realName: data.user.realName, phone: data.user.phone }, idToken);
      }

      // #region agent log
      logEvent('Registration completed', {
        userId: user?.id,
        success: true,
      });
      // #endregion

      toast.success('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('Registration completion error:', error);
      // #region agent log
      logEvent('Registration error', {
        error: error instanceof Error ? error.message : String(error),
      });
      // #endregion
      toast.error(error instanceof Error ? error.message : '정보 업데이트에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-rose-600" />
          </div>
          <CardTitle className="text-2xl">추가 정보 입력</CardTitle>
          <CardDescription>
            서비스 이용을 위해 실명과 전화번호를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                실명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="realName"
                type="text"
                placeholder="홍길동"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                예: 010-1234-5678 또는 01012345678
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : '완료'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

