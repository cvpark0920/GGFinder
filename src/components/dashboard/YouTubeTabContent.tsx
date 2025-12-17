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
  Youtube,
  Trash2,
  Pencil,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { YouTubeVideo } from "../../types/dashboard";

interface YouTubeTabContentProps {
  videos: YouTubeVideo[];
  onEdit: (video: YouTubeVideo) => void;
  onDelete: (id: number) => void;
}

export function YouTubeTabContent({
  videos,
  onEdit,
  onDelete,
}: YouTubeTabContentProps) {
  return (
    <>
      {/* Mobile View */}
      <div className="space-y-3 md:hidden">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
                <div className="absolute top-2 right-2 pointer-events-none">
                   <Badge
                    variant="secondary"
                    className={
                      video.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {video.status === "active" ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {video.createdAt}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => onEdit(video)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => onDelete(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
             <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">
               등록된 동영상이 없습니다.
             </div>
          )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:bg-gradient-to-r hover:from-slate-50 hover:via-white hover:to-slate-50 border-b-2 border-slate-200">
              <TableHead className="font-semibold text-slate-700 py-4 h-auto w-16 text-center">번호</TableHead>
              <TableHead className="w-[160px] font-semibold text-slate-700 py-4 h-auto">영상</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">제목/설명</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">상태</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 h-auto">등록일</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 h-auto">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow 
                key={video.id}
                className="hover:bg-gradient-to-r hover:from-rose-50/30 hover:via-white hover:to-rose-50/30 transition-all duration-150 border-b border-slate-100 group"
              >
                <TableCell className="py-4 text-center">
                  <span className="text-slate-500 font-medium">{index + 1}</span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="w-[160px] aspect-video rounded-md overflow-hidden bg-slate-100 relative shadow-sm">
                     <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-900 line-clamp-1">{video.title}</div>
                    <div className="text-sm text-slate-600 line-clamp-1">{video.description}</div>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium">
                      <Youtube className="w-3.5 h-3.5" /> YouTube에서 보기
                    </a>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className={
                      video.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }
                  >
                    {video.status === "active" ? "활성" : "비활성"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-slate-600 text-sm">{video.createdAt}</span>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex justify-end gap-1.5">
                     <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                      onClick={() => onEdit(video)}
                      title="수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                      onClick={() => onDelete(video.id)}
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {videos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-slate-500 bg-slate-50/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">등록된 동영상이 없습니다.</span>
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
