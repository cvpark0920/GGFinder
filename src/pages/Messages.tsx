import React, { useState } from "react";
import {
  Search,
  MessageCircle,
  Clock,
  Languages,
  Send,
  ArrowLeft,
  ChevronLeft,
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
  Film,
  Globe,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";

// Interfaces
interface AttachedFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video" | "document";
}

interface ChatMessage {
  id: number;
  roomId: number;
  sender: "groom" | "bride";
  senderName: string;
  message: string;
  originalLang: "ko" | "vi";
  timestamp: string;
  isTranslated?: boolean;
  translatedText?: string;
  attachments?: AttachedFile[];
}

interface ChatRoom {
  id: number;
  groom: string;
  bride: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  groomLang: "ko";
  brideLang: "vi";
}

// Mock Data
const CHAT_ROOMS: ChatRoom[] = [
  {
    id: 1,
    groom: "박지성",
    bride: "Nguyen Thi A",
    lastMessage:
      "Tôi có thể nấu pho cho anh. Tôi thích nấu ăn lắm.",
    lastMessageTime: "2024-01-10 14:37",
    unreadCount: 2,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 2,
    groom: "김민수",
    bride: "Tran Thi B",
    lastMessage: "Chào anh! Em rất vui được làm quen.",
    lastMessageTime: "2024-01-11 10:20",
    unreadCount: 1,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 3,
    groom: "이동욱",
    bride: "Le Thi C",
    lastMessage: "주말에 화상 통화 어떠세요?",
    lastMessageTime: "2024-01-09 16:45",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 4,
    groom: "박민준",
    bride: "Pham Thi D",
    lastMessage:
      "Em đang học tiếng Hàn. Anh có thể giúp em không?",
    lastMessageTime: "2024-01-12 09:15",
    unreadCount: 3,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 5,
    groom: "정우성",
    bride: "Hoang Thi E",
    lastMessage: "내일 저녁 6시에 통화할까요?",
    lastMessageTime: "2024-01-12 08:30",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 6,
    groom: "최민호",
    bride: "Vu Thi F",
    lastMessage: "Cảm ơn anh đã gửi quà cho em!",
    lastMessageTime: "2024-01-11 22:10",
    unreadCount: 1,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 7,
    groom: "강동원",
    bride: "Dang Thi G",
    lastMessage: "베트남 방문 일정을 잡았어요.",
    lastMessageTime: "2024-01-11 19:45",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 8,
    groom: "송중기",
    bride: "Bui Thi H",
    lastMessage: "Em nhớ anh quá!",
    lastMessageTime: "2024-01-11 17:20",
    unreadCount: 5,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 9,
    groom: "현빈",
    bride: "Do Thi I",
    lastMessage: "가족들께 인사드리고 싶어요.",
    lastMessageTime: "2024-01-11 15:00",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 10,
    groom: "이민호",
    bride: "Ngo Thi J",
    lastMessage: "Anh thích ăn gì? Em sẽ nấu cho anh.",
    lastMessageTime: "2024-01-11 13:30",
    unreadCount: 2,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 11,
    groom: "유재석",
    bride: "Trinh Thi K",
    lastMessage: "다음 주 결혼 준비 회의 일정이에요.",
    lastMessageTime: "2024-01-11 11:00",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 12,
    groom: "김수현",
    bride: "Cao Thi L",
    lastMessage: "Em đang làm việc. Tối 호출 lại nhé!",
    lastMessageTime: "2024-01-11 09:45",
    unreadCount: 1,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 13,
    groom: "이종석",
    bride: "Ly Thi M",
    lastMessage: "사진 정말 예쁘네요!",
    lastMessageTime: "2024-01-10 21:15",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 14,
    groom: "박서준",
    bride: "Mai Thi N",
    lastMessage: "Anh có thích đi du lịch không?",
    lastMessageTime: "2024-01-10 18:30",
    unreadCount: 4,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 15,
    groom: "조인성",
    bride: "Dinh Thi O",
    lastMessage: "이번 주말 날씨가 좋대요.",
    lastMessageTime: "2024-01-10 16:00",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 16,
    groom: "공유",
    bride: "Vo Thi P",
    lastMessage: "Em rất thích K-pop!",
    lastMessageTime: "2024-01-10 14:20",
    unreadCount: 2,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 17,
    groom: "하정우",
    bride: "Tang Thi Q",
    lastMessage: "비자 서류 준비 중이에요.",
    lastMessageTime: "2024-01-10 12:10",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 18,
    groom: "설경구",
    bride: "Quach Thi R",
    lastMessage: "Cảm ơn anh đã 항상 quan tâm em.",
    lastMessageTime: "2024-01-10 10:00",
    unreadCount: 1,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 19,
    groom: "황정민",
    bride: "Duong Thi S",
    lastMessage: "부모님 댁에 함께 가요.",
    lastMessageTime: "2024-01-09 20:30",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 20,
    groom: "마동석",
    bride: "Truong Thi T",
    lastMessage: "Em thích xem phim Hàn Quốc lắm!",
    lastMessageTime: "2024-01-09 18:00",
    unreadCount: 3,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 21,
    groom: "이병헌",
    bride: "Ha Thi U",
    lastMessage: "한국 생활에 대해 궁금한 게 많아요.",
    lastMessageTime: "2024-01-09 15:45",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 22,
    groom: "정우",
    bride: "Bach Thi V",
    lastMessage: "Anh có thể dạy em tiếng Hàn không?",
    lastMessageTime: "2024-01-09 13:20",
    unreadCount: 1,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 23,
    groom: "주지훈",
    bride: "Lam Thi W",
    lastMessage: "결혼식 날짜를 확정했어요!",
    lastMessageTime: "2024-01-09 11:00",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 24,
    groom: "손예진",
    bride: "Diep Thi X",
    lastMessage: "Em đang chuẩn bị đồ sang Hàn Quốc.",
    lastMessageTime: "2024-01-08 22:15",
    unreadCount: 2,
    groomLang: "ko",
    brideLang: "vi",
  },
  {
    id: 25,
    groom: "이서",
    bride: "Khong Thi Y",
    lastMessage: "주말에 뭐 하고 싶어요?",
    lastMessageTime: "2024-01-08 19:30",
    unreadCount: 0,
    groomLang: "ko",
    brideLang: "vi",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    roomId: 1,
    sender: "groom",
    senderName: "박지성",
    message: "안녕하세요! 반갑습니다.",
    originalLang: "ko",
    timestamp: "2024-01-10 14:30",
  },
  {
    id: 2,
    roomId: 1,
    sender: "bride",
    senderName: "Nguyen Thi A",
    message: "Xin chào! Rất vui được gặp anh.",
    originalLang: "vi",
    timestamp: "2024-01-10 14:32",
  },
  {
    id: 3,
    roomId: 1,
    sender: "groom",
    senderName: "박지성",
    message: "베트남 음식을 정말 좋아해요. 특히 쌀국수!",
    originalLang: "ko",
    timestamp: "2024-01-10 14:35",
  },
  {
    id: 4,
    roomId: 1,
    sender: "bride",
    senderName: "Nguyen Thi A",
    message:
      "Tôi có thể nấu phở cho anh. Tôi thích nấu ăn lắm.",
    originalLang: "vi",
    timestamp: "2024-01-10 14:37",
  },
  {
    id: 5,
    roomId: 2,
    sender: "groom",
    senderName: "김민수",
    message: "처음 뵙겠습니다. 잘 부탁드립니다.",
    originalLang: "ko",
    timestamp: "2024-01-11 10:15",
  },
  {
    id: 6,
    roomId: 2,
    sender: "bride",
    senderName: "Tran Thi B",
    message: "Chào anh! Em rất vui được làm quen.",
    originalLang: "vi",
    timestamp: "2024-01-11 10:20",
  },
  {
    id: 7,
    roomId: 3,
    sender: "groom",
    senderName: "이동욱",
    message: "주말에 화상 통화 어떠세요?",
    originalLang: "ko",
    timestamp: "2024-01-09 16:45",
  },
  {
    id: 8,
    roomId: 3,
    sender: "bride",
    senderName: "Le Thi C",
    message: "Vâng, em đồng ý. Thứ 7 được không ạ?",
    originalLang: "vi",
    timestamp: "2024-01-09 16:50",
  },
];

export default function Messages() {
  const [chatRooms] = useState<ChatRoom[]>(CHAT_ROOMS);
  const [messages, setMessages] =
    useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [selectedRoom, setSelectedRoom] =
    useState<ChatRoom | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [userLanguage, setUserLanguage] = useState<"ko" | "vi" | "en">(
    "ko",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<
    AttachedFile[]
  >([]);

  // Handlers
  const handleOpenChat = (room: ChatRoom) => {
    setSelectedRoom(room);
    setIsChatOpen(true);
    setAttachedFiles([]); // 채팅방 열 때 첨부파일 초화
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedRoom(null);
    setAttachedFiles([]); // 채팅방 닫을 때 첨부파일 초기화
  };

  const getCurrentChatMessages = () => {
    if (!selectedRoom) return [];
    return messages.filter(
      (msg) => msg.roomId === selectedRoom.id,
    );
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = [];

    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "document";

      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: reader.result as string,
          type: fileType,
        });

        if (newFiles.length === files.length) {
          setAttachedFiles([...attachedFiles, ...newFiles]);
        }
      };

      if (fileType === "image" || fileType === "video") {
        reader.readAsDataURL(file);
      } else {
        // 문서 파일은 미리보기 없음
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: "",
          type: fileType,
        });

        if (newFiles.length === files.length) {
          setAttachedFiles([...attachedFiles, ...newFiles]);
        }
      }
    });

    // input 초기화
    e.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(
      attachedFiles.filter((f) => f.id !== fileId),
    );
  };

  const handleSendMessage = () => {
    if (
      (!newMessage.trim() && attachedFiles.length === 0) ||
      !selectedRoom
    )
      return;

    const newMsg: ChatMessage = {
      id: Math.floor(Math.random() * 10000) + 100,
      roomId: selectedRoom.id,
      sender: "groom", // 실제로는 현재 로그인한 사용자에 따라 결정
      senderName: selectedRoom.groom,
      message:
        newMessage ||
        (attachedFiles.length > 0 ? "파일을 보냈습니다." : ""),
      originalLang: userLanguage,
      timestamp: new Date()
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(".", ""),
      attachments:
        attachedFiles.length > 0
          ? [...attachedFiles]
          : undefined,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setAttachedFiles([]);
  };

  const handleTranslateMessage = (messageId: number) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          if (msg.isTranslated) {
            // Toggle off translation
            return { ...msg, isTranslated: false };
          } else {
            // Mock translation
            const translated =
              msg.originalLang === "ko"
                ? translateKoreanToVietnamese(msg.message)
                : translateVietnameseToKorean(msg.message);

            return {
              ...msg,
              isTranslated: true,
              translatedText: translated,
            };
          }
        }
        return msg;
      }),
    );
  };

  // Mock translation functions
  const translateKoreanToVietnamese = (
    text: string,
  ): string => {
    const translations: { [key: string]: string } = {
      "안녕하세요! 반갑습니다.":
        "Xin chào! Rất vui được gặp bạn.",
      "베트남 음식을 정말 좋아해요. 특히 쌀국수!":
        "Tôi rất thích đồ ăn Việt Nam. Đặc biệt là phở!",
      "처음 뵙겠습니다. 잘 부탁드립니다.":
        "Rất vui được gặp bạn. Rất mong được làm việc cùng.",
      "주말에 화상 통화 어떠세요?": "Cuối tuần gọi video nhé?",
    };
    return translations[text] || `[VN] ${text}`;
  };

  const translateVietnameseToKorean = (
    text: string,
  ): string => {
    const translations: { [key: string]: string } = {
      "Xin chào! Rất vui được gặp anh.":
        "안녕하세요! 만나서 반가워요.",
      "Tôi có thể nấu phở cho anh. Tôi thích nấu ăn lắm.":
        "제가 쌀국수를 만들어드릴 수 있어요. 요리하는 걸 정말 좋아해요.",
      "Chào anh! Em rất vui được làm quen.":
        "안녕하세요! 알게 되어 정말 기뻐요.",
      "Vâng, em đồng ý. Thứ 7 được không ạ?":
        "네, 동의해요. 토요일은 어때요?",
    };
    return translations[text] || `[KR] ${text}`;
  };

  // Filter chat rooms
  const filteredRooms = chatRooms.filter((room) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      room.groom.toLowerCase().includes(term) ||
      room.bride.toLowerCase().includes(term) ||
      room.lastMessage.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 pb-20">
      {/* Header with Search Bar */}
      <div className="sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="이름 또는 메시지 검색..."
              className="pl-12 pr-4 py-6 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Chat Room List */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => handleOpenChat(room)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex -space-x-2 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-sm font-bold text-indigo-600">
                      {room.groom.slice(0, 1)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-sm font-bold text-rose-600">
                      {room.bride.slice(0, 1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {room.groom} & {room.bride}
                      </h4>
                      {room.unreadCount > 0 && (
                        <Badge className="bg-rose-600 text-white ml-2 shrink-0">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {room.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">
                        {room.lastMessageTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-slate-300 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">
                검색 결과가 없습니다
              </p>
              <p className="text-sm mt-1">
                다른 검색어로 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Room Bottom Sheet */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side="bottom"
          className="h-[80vh] max-h-[80vh] flex flex-col p-0 rounded-t-[32px] overflow-hidden"
          style={{ height: '80vh', maxHeight: '80vh' }}
        >
          {selectedRoom && (
            <>
              {/* Header */}
              <SheetHeader className="px-4 py-3 border-b shrink-0 flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 md:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden -ml-2 text-slate-500 hover:text-slate-900"
                      onClick={handleCloseChat}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm z-10">
                          {selectedRoom.groom.slice(0, 1)}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-sm font-bold text-rose-600 shadow-sm">
                          {selectedRoom.bride.slice(0, 1)}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <SheetTitle className="text-base font-bold text-slate-900 leading-tight flex flex-col md:flex-row md:items-center md:gap-1.5">
                          <span>{selectedRoom.groom}</span>
                          <span className="hidden md:inline text-slate-300 font-normal">
                            &
                          </span>
                          <span className="text-sm font-medium text-slate-500 md:text-base md:font-bold md:text-slate-900">
                            {selectedRoom.bride}
                          </span>
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                          {selectedRoom.groom}와{" "}
                          {selectedRoom.bride}의 실시간 번역
                          채팅방
                        </SheetDescription>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="uppercase font-medium text-xs">
                          {userLanguage}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setUserLanguage("ko")}
                        className={userLanguage === "ko" ? "bg-slate-100" : ""}
                      >
                        🇰🇷 한국어
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setUserLanguage("vi")}
                        className={userLanguage === "vi" ? "bg-slate-100" : ""}
                      >
                        🇻🇳 Tiếng Việt
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setUserLanguage("en")}
                        className={userLanguage === "en" ? "bg-slate-100" : ""}
                      >
                        🇺🇸 English
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SheetHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-4 bg-slate-50">
                <div className="space-y-4 pb-4">
                  {getCurrentChatMessages().map((msg) => {
                    const isMyMessage = msg.sender === "groom"; // 실제로는 현재 사용자 확인

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex flex-col gap-1 max-w-[75%] ${isMyMessage ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">
                              {msg.senderName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {msg.timestamp}
                            </span>
                          </div>

                          <div
                            className={`relative ${isMyMessage ? "bg-rose-600 text-white" : "bg-white text-slate-900"} rounded-2xl px-4 py-2.5 shadow-sm`}
                          >
                            {/* Attachments */}
                            {msg.attachments &&
                              msg.attachments.length > 0 && (
                                <div className="mb-2 space-y-2">
                                  {msg.attachments.map(
                                    (attachment) => (
                                      <div key={attachment.id}>
                                        {attachment.type ===
                                          "image" && (
                                          <img
                                            src={
                                              attachment.preview
                                            }
                                            alt="첨부 이미지"
                                            className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
                                            onClick={() =>
                                              window.open(
                                                attachment.preview,
                                                "_blank",
                                              )
                                            }
                                          />
                                        )}
                                        {attachment.type ===
                                          "video" && (
                                          <video
                                            src={
                                              attachment.preview
                                            }
                                            controls
                                            className="max-w-full rounded-lg max-h-60"
                                          />
                                        )}
                                        {attachment.type ===
                                          "document" && (
                                          <div
                                            className={`flex items-center gap-2 p-2 rounded-lg ${isMyMessage ? "bg-rose-700/50" : "bg-slate-100"}`}
                                          >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs truncate">
                                                {
                                                  attachment
                                                    .file.name
                                                }
                                              </p>
                                              <p className="text-xs opacity-70">
                                                {(
                                                  attachment
                                                    .file.size /
                                                  1024
                                                ).toFixed(
                                                  1,
                                                )}{" "}
                                                KB
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>

                            {/* Translated Text Below Original - Only for other person's messages */}
                            {!isMyMessage &&
                              msg.isTranslated && (
                                <div
                                  className={`mt-2 pt-2 border-t border-slate-200`}
                                >
                                  <p
                                    className={`text-xs text-slate-500 flex items-start gap-1.5`}
                                  >
                                    <Languages className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span className="flex-1">
                                      {msg.translatedText}
                                    </span>
                                  </p>
                                </div>
                              )}

                            {/* Translation Button - Only for other person's messages */}
                            {!isMyMessage && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md ${
                                  msg.isTranslated
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                                onClick={() =>
                                  handleTranslateMessage(msg.id)
                                }
                                title={
                                  msg.isTranslated
                                    ? "번역 숨기기"
                                    : "번역하기"
                                }
                              >
                                <Languages className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>

                          {!isMyMessage && msg.isTranslated && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>
                                번역됨 (
                                {msg.originalLang === "ko"
                                  ? "한국어→베트남어"
                                  : "베트남어→한국어"}
                                )
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {getCurrentChatMessages().length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-slate-400 py-20">
                      <div>
                        <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                        <p>아직 대화가 없습니다</p>
                        <p className="text-sm mt-1">
                          첫 메시지를 보내보세요!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white shrink-0">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="mb-3 flex gap-2 flex-wrap">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="relative group"
                      >
                        {file.type === "image" && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200">
                            <img
                              src={file.preview}
                              alt="미리보기"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleRemoveFile(file.id)
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {file.type === "video" && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                            <Film className="w-8 h-8 text-slate-400" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleRemoveFile(file.id)
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {file.type === "document" && (
                          <div className="relative w-32 p-2 rounded-lg border-2 border-slate-200 bg-slate-50 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate">
                                {file.file.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {(
                                  file.file.size / 1024
                                ).toFixed(1)}{" "}
                                KB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              onClick={() =>
                                handleRemoveFile(file.id)
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {/* File Attach Button */}
                  <label
                    htmlFor="file-upload"
                    className="shrink-0"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                      asChild
                    >
                      <div>
                        <Paperclip className="w-4 h-4" />
                      </div>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>

                  <Input
                    placeholder={`${userLanguage === "ko" ? "한국어로" : "Tiếng Việt로"} 메시지를 입력하세요...`}
                    value={newMessage}
                    onChange={(e) =>
                      setNewMessage(e.target.value)
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() &&
                      attachedFiles.length === 0
                    }
                    className="bg-rose-600 hover:bg-rose-700 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}