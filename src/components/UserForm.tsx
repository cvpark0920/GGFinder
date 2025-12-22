import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AgencySelector } from "./AgencySelector";
import { User, UserRole, UserStatus, Agency } from "../types/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  UserPlus,
  User as UserIcon,
  Shield,
  Mail,
  Building2,
  CheckCircle2
} from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "./ui/sheet";

interface UserFormProps {
  initialData?: User | null;
  agencies: Agency[];
  currentUser?: User | null;
  onSubmit: (data: Partial<User>) => Promise<void> | void;
  onCancel: () => void;
}

export function UserForm({
  initialData,
  agencies,
  currentUser,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEditingSuperAdmin = initialData?.role === 'super_admin';
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    name: "",
    email: "",
    role: "agency_member",
    status: "pending",
    agencyId: undefined,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        username: "",
        name: "",
        email: "",
        role: "agency_member",
        status: "pending",
        agencyId: undefined,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ ...formData });
    } catch (error) {
      // 에러는 onSubmit 내부에서 처리됨
      console.error('User form submission error:', error);
    }
  };

  const isEditMode = !!initialData;

  // 공통 Input 스타일
  const inputClassName = "bg-white border-slate-300 focus:border-slate-500 focus:ring-slate-500";

  return (
    <>
      <SheetHeader className="pb-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <SheetTitle className="text-xl">
              {isEditMode ? "사용자 정보 수정" : "새 사용자 추가"}
            </SheetTitle>
            <SheetDescription>
              {isEditMode 
                ? "사용자의 계정 정보를 수정합니다." 
                : "새로운 관리자나 소속사 회원을 시스템에 등록합니다."}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="p-6 space-y-6">
        {/* 계정 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-slate-600" />
              <CardTitle>기본 정보</CardTitle>
            </div>
            <CardDescription>사용자의 기본적인 신상 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  placeholder="user123"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={isEditMode}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> 이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClassName}
              />
            </div>
          </CardContent>
        </Card>

        {/* 권한 및 소속 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600" />
              <CardTitle>권한 및 소속</CardTitle>
            </div>
            <CardDescription>사용자의 역할과 권한을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleChange("role", value)}
                disabled={isEditingSuperAdmin && !isSuperAdmin}
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin" disabled={isEditingSuperAdmin && !isSuperAdmin}>
                    <span className="font-medium">슈퍼관리자</span>
                    <span className="ml-2 text-xs text-slate-400">- 모든 권한</span>
                  </SelectItem>
                  <SelectItem value="platform_admin">
                    <span className="font-medium">플랫폼 관리자</span>
                    <span className="ml-2 text-xs text-slate-400">- 운영 관리</span>
                  </SelectItem>
                  <SelectItem value="agency_member">
                    <span className="font-medium">소속사 회원</span>
                    <span className="ml-2 text-xs text-slate-400">- 소속사 전용</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isEditingSuperAdmin && !isSuperAdmin && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ 슈퍼 관리자 계정의 역할은 슈퍼 관리자만 변경할 수 있습니다.
                </p>
              )}
              
              <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-600">
                {formData.role === "super_admin" && (
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p>모든 데이터에 접근하고 시스템 설정을 변경할 수 있는 최고 관리자 권한입니다.</p>
                  </div>
                )}
                {formData.role === "platform_admin" && (
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <p>회원 및 매칭 관리 등 플랫폼 운영에 필요한 대부분의 권한을 가집니다.</p>
                  </div>
                )}
                {formData.role === "agency_member" && (
                  <div className="flex gap-2">
                    <UserIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <p>자신이 속한 소속사의 데이터만 조회하고 관리할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {formData.role === "agency_member" && (
              <div className="space-y-2">
                <AgencySelector
                  id="agency-select"
                  label="소속사 선택"
                  agencies={agencies}
                  value={formData.agencyId?.toString() || ""}
                  onChange={(id) => handleChange("agencyId", id ? parseInt(id) : undefined)}
                />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t mt-2">
              <Label htmlFor="status" className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 계정 상태
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: UserStatus) => handleChange("status", value)}
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2 text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> 승인 대기
                    </span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> 활동 중
                    </span>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <span className="flex items-center gap-2 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> 정지됨
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <SheetFooter className="sticky bottom-0 bg-white border-t pt-4 pb-4 px-6 gap-3">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
          className="flex-1"
        >
          취소
        </Button>
        <Button 
          onClick={handleSubmit}
          className="flex-1 bg-slate-900 hover:bg-slate-800"
        >
          {isEditMode ? "수정 완료" : "사용자 추가"}
        </Button>
      </SheetFooter>
    </>
  );
}
