import React, { useState, useEffect } from "react";
import { Users, UserCircle } from "lucide-react";
import ProfileList from "./ProfileList";
import { useAuth } from "../components/AuthContext";

export default function Profiles() {
  const { user, isLoading: authLoading } = useAuth();
  
  // 사용자 권한에 따라 조회 가능한 프로필 타입 결정
  const canViewBrides = user?.role === 'super_admin' || user?.role === 'platform_admin' || user?.agency?.role === 'groom';
  const canViewGrooms = user?.role === 'super_admin' || user?.role === 'platform_admin' || user?.agency?.role === 'bride';
  
  // 초기 탭 설정: 권한이 하나만 있으면 해당 탭으로, 둘 다 있으면 신부 탭으로
  const getInitialTab = (): "bride" | "groom" => {
    if (canViewBrides && !canViewGrooms) return "bride";
    if (canViewGrooms && !canViewBrides) return "groom";
    return "bride"; // 둘 다 있거나 둘 다 없으면 기본값은 신부
  };
  
  const [activeTab, setActiveTab] = useState<"bride" | "groom">("bride"); // 초기값을 고정값으로 설정
  
  // 사용자 정보가 로드된 후 권한에 따라 탭 설정
  useEffect(() => {
    // 인증 로딩 중이면 탭 설정하지 않음
    if (authLoading) return;
    
    // 사용자가 없으면 기본값 유지
    if (!user) return;
    
    // 권한에 따라 탭 설정
    if (canViewBrides && !canViewGrooms) {
      setActiveTab("bride");
    } else if (canViewGrooms && !canViewBrides) {
      setActiveTab("groom");
    } else {
      // 둘 다 있거나 둘 다 없으면 기본값은 신부
      setActiveTab("bride");
    }
  }, [user, authLoading, canViewBrides, canViewGrooms]);
  
  // 권한이 변경되면 탭도 재설정 (추가 안전장치)
  useEffect(() => {
    if (!user || authLoading) return;
    
    // 현재 탭이 권한이 없는 탭이면 자동으로 변경
    if (activeTab === "bride" && !canViewBrides) {
      setActiveTab("groom");
      return;
    }
    if (activeTab === "groom" && !canViewGrooms) {
      setActiveTab("bride");
      return;
    }
  }, [user?.agency?.role, user?.role, canViewBrides, canViewGrooms, activeTab, user, authLoading]);
  
  // 탭 표시 여부: 둘 다 조회 가능할 때만 탭 표시
  const showTabs = canViewBrides && canViewGrooms;
  
  // 탭 클릭 핸들러: 권한 체크
  const handleTabClick = (tab: "bride" | "groom") => {
    if (tab === "bride" && !canViewBrides) {
      return; // 신부 탭 클릭 시 권한 없으면 무시
    }
    if (tab === "groom" && !canViewGrooms) {
      return; // 신랑 탭 클릭 시 권한 없으면 무시
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      {showTabs && (
        <div className="flex gap-3 bg-white rounded-xl p-2 shadow-sm border border-slate-200 max-w-md mx-auto md:mx-0">
          <button
            onClick={() => handleTabClick("bride")}
            disabled={!canViewBrides}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === "bride"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50"
            } ${!canViewBrides ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">신부</span>
          </button>
          <button
            onClick={() => handleTabClick("groom")}
            disabled={!canViewGrooms}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === "groom"
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50"
            } ${!canViewGrooms ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="font-medium">신랑</span>
          </button>
        </div>
      )}

      {/* Profile List */}
      <ProfileList type={activeTab} />
    </div>
  );
}