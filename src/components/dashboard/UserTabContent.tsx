import React from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  User as UserIcon, 
  Shield, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Pencil
} from "lucide-react";
import { User, Agency, UserRole, UserStatus } from "../../types/dashboard";

interface UserTabContentProps {
  users: User[];
  agencies: Agency[];
  onUpdateStatus: (userId: number, newStatus: UserStatus) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UserTabContent({
  users,
  agencies,
  onUpdateStatus,
  onEdit,
  onDelete,
}: UserTabContentProps) {
  const getAgencyName = (agencyId?: number) => {
    if (!agencyId) return "-";
    const agency = agencies.find((a) => a.id === agencyId);
    return agency ? agency.name : "알 수 없음";
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-600 hover:bg-purple-700">슈퍼관리자</Badge>;
      case "platform_admin":
        return <Badge className="bg-indigo-600 hover:bg-indigo-700">플랫폼 관리자</Badge>;
      case "agency_member":
        return <Badge variant="outline" className="text-slate-600 border-slate-300">소속사 회원</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">활동 중</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">승인 대기</span>
          </div>
        );
      case "suspended":
        return (
          <div className="flex items-center gap-1.5 text-red-600">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">정지됨</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:bg-gradient-to-r hover:from-slate-50 hover:via-white hover:to-slate-50 border-b-2 border-slate-200">
              <TableHead className="font-semibold text-slate-700 py-4 h-auto w-16 text-center">번호</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">사용자명 / 이름</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">역할</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">소속사</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">이메일</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">가입일</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">상태</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 h-auto">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow 
                key={user.id}
                className="hover:bg-gradient-to-r hover:from-rose-50/30 hover:via-white hover:to-rose-50/30 transition-all duration-150 border-b border-slate-100 group"
              >
                <TableCell className="py-4 text-center">
                  <span className="text-slate-500 font-medium">{index + 1}</span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">{getRoleBadge(user.role)}</TableCell>
                <TableCell className="py-4">
                  {user.role === "agency_member" ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-sm font-medium">{getAgencyName(user.agencyId)}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-600">{user.email}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-600 text-sm">{user.joinDate}</span>
                </TableCell>
                <TableCell className="py-4">{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-right py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-all">
                        <span className="sr-only">메뉴 열기</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>상태 관리</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>사용자 정보 수정</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "active")}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        <span>활동 승인 / 활성화</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "suspended")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        <span>계정 정지</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user.id)}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>사용자 삭제</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500 bg-slate-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">등록된 사용자가 없습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Cards */}
      <div className="space-y-3 md:hidden">
          {users.map((user) => (
            <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{user.username}</span>
                      <span>•</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      사용자 정보 수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "active")}>
                      승인 / 활성화
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "suspended")}>
                      계정 정지
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user.id)}>
                      사용자 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-3 border-t border-slate-50 pt-3">
                {user.role === "agency_member" && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">소속사</span>
                    <span className="font-medium">{getAgencyName(user.agencyId)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">가입일</span>
                  <span>{user.joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">상태</span>
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">
              등록된 사용자가 없습니다.
            </div>
          )}
      </div>
    </>
  );
}
