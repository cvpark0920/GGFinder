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
  Building2,
  User,
  Phone,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { Agency } from "../../types/dashboard";

interface AgencyTabContentProps {
  agencies: Agency[];
  filterRole: string;
  onFilterRoleChange: (val: string) => void;
  onEdit: (agency: Agency) => void;
  onDelete: (id: number) => void;
}

export function AgencyTabContent({
  agencies,
  filterRole,
  onFilterRoleChange,
  onEdit,
  onDelete,
}: AgencyTabContentProps) {
  return (
    <>
      {/* Filter by Role */}
      <div className="mb-4 flex gap-2 justify-between items-center">
          <Select value={filterRole} onValueChange={onFilterRoleChange}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="역할 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="groom">신랑</SelectItem>
              <SelectItem value="bride">신부</SelectItem>
            </SelectContent>
          </Select>
      </div>

      {/* Mobile View: Cards */}
      <div className="space-y-3 md:hidden">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {agency.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`font-normal text-xs ${
                          agency.role === "groom"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        {agency.role === "groom" ? "신랑" : "신부"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      {agency.contact}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                    onClick={() => onDelete(agency.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {agency.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{agency.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      agency.status === "활성" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-slate-600">
                    {agency.status}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 px-3 h-8 text-xs"
                  onClick={() => onEdit(agency)}
                >
                  <Pencil className="w-3 h-3" /> 정보 수정
                </Button>
              </div>
            </div>
          ))}
          {agencies.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">
              등록된 소속사가 없습니다.
            </div>
          )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:bg-gradient-to-r hover:from-slate-50 hover:via-white hover:to-slate-50 border-b-2 border-slate-200">
              <TableHead className="font-semibold text-slate-700 py-4 h-auto w-16 text-center">번호</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">소속사명</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">역할</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">담당자</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">연락처</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">주소</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">상태</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 h-auto">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.map((agency, index) => (
              <TableRow 
                key={agency.id}
                className="hover:bg-gradient-to-r hover:from-rose-50/30 hover:via-white hover:to-rose-50/30 transition-all duration-150 border-b border-slate-100 group"
              >
                <TableCell className="py-4 text-center">
                  <span className="text-slate-500 font-medium">{index + 1}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-semibold text-slate-900">{agency.name}</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className={
                      agency.role === "groom"
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                        : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200"
                    }
                  >
                    {agency.role === "groom" ? "신랑 알선" : "신부 알선"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-700 font-medium">{agency.contact}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-600">{agency.phone}</span>
                </TableCell>
                <TableCell className="py-4 max-w-[200px] truncate">
                  <span className="text-slate-600">{agency.address}</span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        agency.status === "활성"
                          ? "bg-green-500 ring-2 ring-green-200"
                          : "bg-gray-400 ring-2 ring-gray-200"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-slate-700">{agency.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                      onClick={() => onEdit(agency)}
                      title="수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                      onClick={() => onDelete(agency.id)}
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {agencies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-slate-500 bg-slate-50/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">등록된 소속사가 없습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
