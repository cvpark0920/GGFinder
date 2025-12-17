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
  Trash2,
  Pencil,
  Heart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Client, Agency, SortConfig } from "../../types/dashboard";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface ClientTabContentProps {
  clients: Client[];
  agencies: Agency[];
  type: "groom" | "bride";
  onStatusUpdate: (id: number, status: string, type: "groom" | "bride") => void;
  onEdit: (client: Client) => void;
  onMatch: (client: Client) => void;
  onDelete: (id: number, type: "groom" | "bride", name: string) => void;
  onSort: (key: keyof Client) => void;
  sortConfig: SortConfig | null;
  onAvatarClick?: (client: Client) => void;
}

export function ClientTabContent({
  clients,
  agencies,
  type,
  onStatusUpdate,
  onEdit,
  onMatch,
  onDelete,
  onSort,
  sortConfig,
  onAvatarClick,
}: ClientTabContentProps) {
  const SortIcon = ({ column }: { column: keyof Client }) => {
    if (sortConfig?.key !== column)
      return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 text-rose-500" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-rose-500" />
    );
  };

  return (
    <>
      {/* Mobile View: Cards */}
      <div className="space-y-3 md:hidden">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <Avatar
                    className={`w-10 h-10 cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all ${
                      type === "groom"
                        ? "bg-slate-100"
                        : "bg-rose-50"
                    }`}
                    onClick={() => onAvatarClick?.(client)}
                  >
                    <AvatarImage
                      src={client.avatarUrl || client.images?.[0]}
                      alt={client.name}
                    />
                    <AvatarFallback
                      className={`font-semibold text-sm ${
                        type === "groom"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {client.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {client.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="font-normal text-xs bg-slate-50"
                      >
                        {client.age}세 / {client.loc}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-400">
                        등록일: {client.date}
                      </p>
                      {client.agencyId && (
                        <>
                          <span className="text-xs text-slate-300">•</span>
                          <p className="text-xs text-indigo-600 font-medium">
                            {agencies.find((a) => a.id === client.agencyId)
                              ?.name || "-"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                    onClick={() => onDelete(client.id, type, client.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                <div className="flex-1">
                  <Select
                    defaultValue={client.status}
                    onValueChange={(val) =>
                      onStatusUpdate(client.id, val, type)
                    }
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="등록 완료">등록 완료</SelectItem>
                      <SelectItem value="매칭 중">매칭 중</SelectItem>
                      <SelectItem value="만남 예정">만남 예정</SelectItem>
                      <SelectItem value="서류 준비">서류 준비</SelectItem>
                      <SelectItem value="대기 중">대기 중</SelectItem>
                      <SelectItem value="진행 중">진행 중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 px-3 h-9"
                  onClick={() => onEdit(client)}
                >
                  <Pencil className="w-3.5 h-3.5" /> 수정
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 px-3 h-9 bg-rose-600 hover:bg-rose-700"
                  onClick={() => onMatch(client)}
                >
                  <Heart className="w-3.5 h-3.5" /> 매칭
                </Button>
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:bg-gradient-to-r hover:from-slate-50 hover:via-white hover:to-slate-50 border-b-2 border-slate-200">
                <TableHead className="font-semibold text-slate-700 py-4 h-auto w-16 text-center">번호</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700 py-4 h-auto"
                  onClick={() => onSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    이름 <SortIcon column="name" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700 py-4 h-auto"
                  onClick={() => onSort("age")}
                >
                  <div className="flex items-center gap-1.5">
                    나이 <SortIcon column="age" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700 py-4 h-auto"
                  onClick={() => onSort("loc")}
                >
                  <div className="flex items-center gap-1.5">
                    지역 <SortIcon column="loc" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700 py-4 h-auto"
                  onClick={() => onSort("status")}
                >
                  <div className="flex items-center gap-1.5">
                    상태 <SortIcon column="status" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4 h-auto">소속사</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-slate-700 py-4 h-auto"
                  onClick={() => onSort("date")}
                >
                  <div className="flex items-center gap-1.5">
                    등록일 <SortIcon column="date" />
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700 py-4 h-auto">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow 
                  key={client.id}
                  className="hover:bg-gradient-to-r hover:from-rose-50/30 hover:via-white hover:to-rose-50/30 transition-all duration-150 border-b border-slate-100 group"
                >
                  <TableCell className="py-4 text-center">
                    <span className="text-slate-500 font-medium">{index + 1}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className={`w-11 h-11 cursor-pointer hover:ring-2 hover:ring-rose-400 transition-all shadow-sm ${
                          type === "groom"
                            ? "bg-gradient-to-br from-indigo-100 to-indigo-200 ring-1 ring-indigo-200"
                            : "bg-gradient-to-br from-rose-100 to-rose-200 ring-1 ring-rose-200"
                        }`}
                        onClick={() => onAvatarClick?.(client)}
                      >
                        <AvatarImage
                          src={client.avatarUrl || client.images?.[0]}
                          alt={client.name}
                        />
                        <AvatarFallback
                          className={`font-bold text-sm ${
                            type === "groom"
                              ? "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white"
                              : "bg-gradient-to-br from-rose-400 to-rose-600 text-white"
                          }`}
                        >
                          {client.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-900">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-slate-700 font-medium">{client.age}세</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">{client.loc}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Select
                      defaultValue={client.status}
                      onValueChange={(val) =>
                        onStatusUpdate(client.id, val, type)
                      }
                    >
                      <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 hover:border-rose-300 transition-colors">
                        <SelectValue placeholder="상태" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="등록 완료">등록 완료</SelectItem>
                        <SelectItem value="매칭 중">매칭 중</SelectItem>
                        <SelectItem value="만남 예정">만남 예정</SelectItem>
                        <SelectItem value="서류 준비">서류 준비</SelectItem>
                        <SelectItem value="대기 중">대기 중</SelectItem>
                        <SelectItem value="진행 중">진행 중</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-4">
                    {client.agencyId ? (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      >
                        {agencies.find((a) => a.id === client.agencyId)?.name || "-"}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-slate-600">{client.date}</span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg"
                        title="매칭하기"
                        onClick={() => onMatch(client)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                        title="상세/수정"
                        onClick={() => onEdit(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                        onClick={() => onDelete(client.id, type, client.name)}
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-slate-500 bg-slate-50/50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm">검색 결과가 없습니다.</span>
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
