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
import { useLanguage } from "./LanguageContext";

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
  const { t } = useLanguage();
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
              {isEditMode ? t('dashboard.user.titles.edit') : t('dashboard.user.titles.add')}
            </SheetTitle>
            <SheetDescription>
              {isEditMode 
                ? t('dashboard.user.descriptions.edit')
                : t('dashboard.user.descriptions.add')}
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
              <CardTitle>{t('dashboard.user.sections.basicInfo')}</CardTitle>
            </div>
            <CardDescription>{t('dashboard.user.sectionDescriptions.basicInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('dashboard.user.fields.username')}</Label>
                <Input
                  id="username"
                  placeholder={t('dashboard.user.placeholders.username')}
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={isEditMode}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('dashboard.user.fields.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('dashboard.user.placeholders.name')}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {t('dashboard.user.fields.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('dashboard.user.placeholders.email')}
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
              <CardTitle>{t('dashboard.user.sections.roleAndAgency')}</CardTitle>
            </div>
            <CardDescription>{t('dashboard.user.sectionDescriptions.roleAndAgency')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t('dashboard.user.fields.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleChange("role", value)}
                disabled={isEditingSuperAdmin && !isSuperAdmin}
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue placeholder={t('dashboard.user.placeholders.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin" disabled={isEditingSuperAdmin && !isSuperAdmin}>
                    <span className="font-medium">{t('dashboard.user.roles.superAdmin')}</span>
                    <span className="ml-2 text-xs text-slate-400">{t('dashboard.user.roles.superAdminDesc')}</span>
                  </SelectItem>
                  <SelectItem value="platform_admin">
                    <span className="font-medium">{t('dashboard.user.roles.platformAdmin')}</span>
                    <span className="ml-2 text-xs text-slate-400">{t('dashboard.user.roles.platformAdminDesc')}</span>
                  </SelectItem>
                  <SelectItem value="agency_member">
                    <span className="font-medium">{t('dashboard.user.roles.agencyMember')}</span>
                    <span className="ml-2 text-xs text-slate-400">{t('dashboard.user.roles.agencyMemberDesc')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isEditingSuperAdmin && !isSuperAdmin && (
                <p className="text-sm text-amber-600 mt-1">
                  {t('dashboard.user.warnings.superAdminRoleChange')}
                </p>
              )}
              
              <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-600">
                {formData.role === "super_admin" && (
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p>{t('dashboard.user.roleDescriptions.superAdmin')}</p>
                  </div>
                )}
                {formData.role === "platform_admin" && (
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <p>{t('dashboard.user.roleDescriptions.platformAdmin')}</p>
                  </div>
                )}
                {formData.role === "agency_member" && (
                  <div className="flex gap-2">
                    <UserIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <p>{t('dashboard.user.roleDescriptions.agencyMember')}</p>
                  </div>
                )}
              </div>
            </div>

            {formData.role === "agency_member" && (
              <div className="space-y-2">
                <AgencySelector
                  id="agency-select"
                  label={t('dashboard.user.fields.agency')}
                  agencies={agencies}
                  value={formData.agencyId?.toString() || ""}
                  onChange={(id) => handleChange("agencyId", id ? parseInt(id) : undefined)}
                />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t mt-2">
              <Label htmlFor="status" className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('dashboard.user.fields.status')}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: UserStatus) => handleChange("status", value)}
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue placeholder={t('dashboard.user.placeholders.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2 text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {t('dashboard.user.status.pending')}
                    </span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> {t('dashboard.user.status.active')}
                    </span>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <span className="flex items-center gap-2 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {t('dashboard.user.status.suspended')}
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
          {t('dashboard.user.buttons.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit}
          className="flex-1 bg-slate-900 hover:bg-slate-800"
        >
          {isEditMode ? t('dashboard.user.buttons.save') : t('dashboard.user.buttons.add')}
        </Button>
      </SheetFooter>
    </>
  );
}
