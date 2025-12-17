import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActive?: boolean;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requireActive = false,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중이면 대기
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">로딩 중...</div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 홈으로 리다이렉트 (로그인 sheet는 Layout에서 처리)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ fromProtectedRoute: true }} />;
  }

  // 슈퍼관리자와 플랫폼관리자가 아닌 경우, 승인되지 않은 사용자는 홈으로 리디렉션
  // (모달은 Layout에서 표시)
  if (
    user.role !== 'super_admin' &&
    user.role !== 'platform_admin' &&
    user.status !== 'active' &&
    location.pathname !== '/'
  ) {
    return <Navigate to="/" replace state={{ showApprovalModal: true }} />;
  }

  // 활성 상태가 필요한 경우 확인 (관리자는 제외)
  if (
    requireActive &&
    user.status !== 'active' &&
    user.role !== 'super_admin' &&
    user.role !== 'platform_admin'
  ) {
    return <Navigate to="/" replace state={{ showApprovalModal: true }} />;
  }

  // 역할 기반 접근 제어
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">접근 권한이 없습니다</h2>
          <p className="text-slate-600">
            이 페이지에 접근할 권한이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

