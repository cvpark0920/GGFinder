import React from "react";
import { TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  Heart,
  Pencil,
  Users,
  Building2,
  User as UserIcon,
  Youtube,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface DashboardHeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterUserRole: string;
  setFilterUserRole: (role: string) => void;
  filterAgencyRole: string;
  setFilterAgencyRole: (role: string) => void;
  handleSortChange: (value: string) => void;
  isAgencyMember?: boolean;
}

export function DashboardHeader({
  activeTab,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterUserRole,
  setFilterUserRole,
  filterAgencyRole,
  setFilterAgencyRole,
  handleSortChange,
  isAgencyMember = false,
}: DashboardHeaderProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3 mb-6 sticky top-0 z-10 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 py-3 -mx-4 px-4 md:static md:bg-transparent md:p-0 md:mx-0">
      {/* 첫 번째 줄: 탭 버튼 (데스크탑에서 전체 너비) */}
      <TabsList className={`w-full grid ${isAgencyMember ? 'grid-cols-3' : 'grid-cols-6'} h-11 bg-slate-200/50 p-1`}>
        <TabsTrigger value="grooms" className="text-xs md:text-sm gap-2">
          <UserIcon className="w-4 h-4" />
          <span className="hidden md:inline">{t('dashboard.tabs.grooms')}</span>
        </TabsTrigger>
        <TabsTrigger value="brides" className="text-xs md:text-sm gap-2">
          <Heart className="w-4 h-4" />
          <span className="hidden md:inline">{t('dashboard.tabs.brides')}</span>
        </TabsTrigger>
        {!isAgencyMember && (
          <TabsTrigger value="agencies" className="text-xs md:text-sm gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden md:inline">{t('dashboard.tabs.agencies')}</span>
          </TabsTrigger>
        )}
        {!isAgencyMember && (
          <TabsTrigger value="users" className="text-xs md:text-sm gap-2">
            <Pencil className="w-4 h-4" />
            <span className="hidden md:inline">{t('dashboard.tabs.users')}</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="matches" className="text-xs md:text-sm gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden md:inline">{t('dashboard.tabs.matches')}</span>
        </TabsTrigger>
        {!isAgencyMember && (
          <TabsTrigger value="youtube" className="text-xs md:text-sm gap-2">
            <Youtube className="w-4 h-4" />
            <span className="hidden md:inline">{t('dashboard.tabs.youtube')}</span>
          </TabsTrigger>
        )}
      </TabsList>

      {/* 두 번째 줄: 검색과 정렬 버튼 (데스크탑에서도 아래 줄) */}
      <div className="flex flex-col md:flex-row items-center gap-2 w-full">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t('dashboard.search.placeholder')}
            className="pl-9 h-11 md:h-10 bg-white border-slate-200 focus-visible:ring-rose-500 shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {activeTab === "users" && (
            <Select value={filterUserRole} onValueChange={setFilterUserRole}>
              <SelectTrigger className="w-full md:w-[130px] h-11 md:h-10 bg-white">
                <SelectValue placeholder={t('dashboard.roles.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.roles.all')}</SelectItem>
                <SelectItem value="super_admin">{t('dashboard.roles.superAdmin')}</SelectItem>
                <SelectItem value="platform_admin">{t('dashboard.roles.platformAdmin')}</SelectItem>
                <SelectItem value="agency_member">{t('dashboard.roles.agencyMember')}</SelectItem>
              </SelectContent>
            </Select>
          )}
          {activeTab === "agencies" && (
            <Select value={filterAgencyRole} onValueChange={setFilterAgencyRole}>
              <SelectTrigger className="w-full md:w-[130px] h-11 md:h-10 bg-white">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="groom">신랑</SelectItem>
                <SelectItem value="bride">신부</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[110px] h-11 md:h-10 bg-white">
              <SelectValue placeholder={t('dashboard.status.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.status.all')}</SelectItem>
              {activeTab === "agencies" ? (
                <>
                  <SelectItem value="활성">{t('dashboard.status.active')}</SelectItem>
                  <SelectItem value="중지">{t('dashboard.status.suspended')}</SelectItem>
                </>
              ) : activeTab === "users" ? (
                <>
                  <SelectItem value="active">{t('dashboard.status.activeStatus')}</SelectItem>
                  <SelectItem value="pending">{t('dashboard.status.pending')}</SelectItem>
                  <SelectItem value="suspended">{t('dashboard.status.suspendedStatus')}</SelectItem>
                </>
              ) : activeTab === "youtube" ? (
                <>
                  <SelectItem value="active">{t('dashboard.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('dashboard.status.inactive')}</SelectItem>
                </>
              ) : activeTab === "matches" ? (
                <>
                  <SelectItem value="진행 중">{t('dashboard.status.inProgress')}</SelectItem>
                  <SelectItem value="대기 중">{t('dashboard.status.waiting')}</SelectItem>
                  <SelectItem value="완료">{t('dashboard.status.completed')}</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="등록 완료">{t('dashboard.status.registered')}</SelectItem>
                  <SelectItem value="매칭 중">{t('dashboard.status.matching')}</SelectItem>
                  <SelectItem value="만남 예정">{t('dashboard.status.meetingScheduled')}</SelectItem>
                  <SelectItem value="서류 준비">{t('dashboard.status.documents')}</SelectItem>
                  <SelectItem value="대기 중">{t('dashboard.status.waiting')}</SelectItem>
                  <SelectItem value="진행 중">{t('dashboard.status.inProgress')}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {(activeTab === "grooms" || activeTab === "brides") && (
            <Select onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:hidden h-11 bg-white">
                <SelectValue placeholder={t('dashboard.sort.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t('dashboard.sort.dateDesc')}</SelectItem>
                <SelectItem value="date-asc">{t('dashboard.sort.dateAsc')}</SelectItem>
                <SelectItem value="name-asc">{t('dashboard.sort.nameAsc')}</SelectItem>
                <SelectItem value="name-desc">{t('dashboard.sort.nameDesc')}</SelectItem>
                <SelectItem value="age-asc">{t('dashboard.sort.ageAsc')}</SelectItem>
                <SelectItem value="age-desc">{t('dashboard.sort.ageDesc')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

