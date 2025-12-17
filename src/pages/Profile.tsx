import React from 'react';
import { useAuth } from '../components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">로그인이 필요합니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">내 프로필</h1>
        <p className="text-slate-600">계정 정보를 확인하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <img 
              src={user.picture} 
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-100"
            />
            <div>
              <h3 className="font-medium text-slate-900">{user.name}</h3>
              <p className="text-sm text-slate-500">
                {user.role === "super_admin" ? "슈퍼관리자" : 
                 user.role === "platform_admin" ? "플랫폼 관리자" : 
                 user.role === "agency_member" ? "소속사 회원" : 
                 "사용자"}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <User className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">이름</p>
                <p className="font-medium text-slate-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">이메일</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">사용자 ID</p>
                <p className="font-medium text-slate-900">{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">가입일</p>
                <p className="font-medium text-slate-900">
                  {user.joinDate 
                    ? new Date(user.joinDate).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
