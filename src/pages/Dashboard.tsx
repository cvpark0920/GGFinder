import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Sheet, SheetTrigger, SheetContent } from "../components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";
import { GroomRegistrationForm } from "../components/GroomRegistrationForm";
import { BrideRegistrationForm } from "../components/BrideRegistrationForm";
import { AgencyRegistrationForm } from "../components/AgencyRegistrationForm";
import { YouTubeRegistrationForm } from "../components/YouTubeRegistrationForm";
import { UserForm } from "../components/UserForm";
import MatchStageManager from "../components/MatchStageManager";

// Dashboard Components
import { StatsOverview } from "../components/dashboard/StatsOverview";
import { ClientTabContent } from "../components/dashboard/ClientTabContent";
import { AgencyTabContent } from "../components/dashboard/AgencyTabContent";
import { MatchTabContent } from "../components/dashboard/MatchTabContent";
import { UserTabContent } from "../components/dashboard/UserTabContent";
import { YouTubeTabContent } from "../components/dashboard/YouTubeTabContent";
import { FavoriteStatsOverview } from "../components/dashboard/FavoriteStatsOverview";
import { FavoriteMatchContent } from "../components/dashboard/FavoriteMatchContent";
import { DeleteDialog } from "../components/dashboard/DeleteDialog";
import { CreateMatchSheet } from "../components/dashboard/CreateMatchSheet";
import { EditGroomSheet } from "../components/dashboard/EditGroomSheet";
import { EditBrideSheet } from "../components/dashboard/EditBrideSheet";
import { EditAgencySheet } from "../components/dashboard/EditAgencySheet";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";

// Hooks
import { useClients } from "../hooks/dashboard/useClients";
import { useAgencies } from "../hooks/dashboard/useAgencies";
import { useMatches } from "../hooks/dashboard/useMatches";
import { useUsers } from "../hooks/dashboard/useUsers";
import { useVideos } from "../hooks/dashboard/useVideos";
import { useFilters } from "../hooks/dashboard/useFilters";
import { useFileUpload } from "../hooks/dashboard/useFileUpload";
import { useDialogState } from "../hooks/dashboard/useDialogState";
import { useMatchDialog } from "../hooks/dashboard/useMatchDialog";

// Utils
import { getFilteredAndSortedClients } from "../utils/dashboard/filterUtils";
import { getFilteredAgencies } from "../utils/dashboard/filterUtils";
import { getFilteredUsers } from "../utils/dashboard/filterUtils";
import { getFilteredVideos } from "../utils/dashboard/filterUtils";

import { Client } from "../types/dashboard";
import { Profile, BrideProfile, GroomProfile } from "../types";
import { mapClientToBrideProfile, mapClientToGroomProfile } from "../utils/dashboard/profileUtils";
import { getProfileDisplayName } from "../utils/profileUtils";
import { ProfileImageSlider } from "../components/ProfileImageSlider";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { 
  MapPin, 
  Ruler, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Users, 
  Cigarette, 
  Wine, 
  Church,
  FileEdit,
  Phone,
  DollarSign,
  User as UserIcon
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  
  // user가 로드될 때까지 대기
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">{t('common.loading')}</div>
      </div>
    );
  }
  
  const isAgencyMember = user.role === "agency_member";
  
  // 소속사 회원은 관리 탭에 접근할 수 없으므로 초기 탭을 grooms로 설정
  const getInitialTab = () => {
    if (isAgencyMember) {
      return "grooms";
    }
    return "grooms";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: "groom" | "bride" | "agency" | "user" | "video";
    name: string;
  } | null>(null);

  // 소속사 회원이 관리 탭에 접근하려고 하면 기본 탭으로 리디렉션
  useEffect(() => {
    if (isAgencyMember && (activeTab === "users" || activeTab === "agencies" || activeTab === "youtube")) {
      setActiveTab("grooms");
    }
  }, [isAgencyMember, activeTab]);
  
  // 사용자 역할이 변경되면 탭도 재설정
  useEffect(() => {
    if (isAgencyMember && (activeTab === "users" || activeTab === "agencies" || activeTab === "youtube")) {
      setActiveTab("grooms");
    }
  }, [isAgencyMember]);

  // Custom Hooks
  const clientsHook = useClients([], []);
  // 소속사 회원은 관리 탭에 접근할 수 없으므로 관련 훅 호출 안 함
  const agenciesHook = useAgencies();
  const matchesHook = useMatches();
  const usersHook = useUsers();
  const videosHook = useVideos();
  const filtersHook = useFilters();
  const fileUploadHook = useFileUpload();
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedAvatarForEdit, setSelectedAvatarForEdit] = useState<File | null>(null);
  const [profileDetailOpen, setProfileDetailOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [favoriteStatistics, setFavoriteStatistics] = useState<any>(null);
  const [favoriteMatchesOverview, setFavoriteMatchesOverview] = useState<any>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const dialogStateHook = useDialogState();
  const matchDialogHook = useMatchDialog(
    clientsHook.grooms,
    clientsHook.brides,
    matchesHook.matches
  );

  const handleTabChange = (value: string) => {
    // 소속사 회원은 관리 탭에 접근할 수 없음
    if (isAgencyMember && (value === "users" || value === "agencies" || value === "youtube")) {
      return;
    }
    setActiveTab(value);
    filtersHook.resetFilters();
  };

  // Filtered Data
  const filteredGrooms = useMemo(
    () =>
      getFilteredAndSortedClients(
        clientsHook.grooms,
        filtersHook.searchTerm,
        filtersHook.filterStatus,
        filtersHook.sortConfig
      ),
    [
      clientsHook.grooms,
      filtersHook.searchTerm,
      filtersHook.filterStatus,
      filtersHook.sortConfig,
    ]
  );

  const filteredBrides = useMemo(
    () =>
      getFilteredAndSortedClients(
        clientsHook.brides,
        filtersHook.searchTerm,
        filtersHook.filterStatus,
        filtersHook.sortConfig
      ),
    [
      clientsHook.brides,
      filtersHook.searchTerm,
      filtersHook.filterStatus,
      filtersHook.sortConfig,
    ]
  );

  const filteredAgenciesList = useMemo(
    () =>
      getFilteredAgencies(
        agenciesHook.agencies,
        filtersHook.searchTerm,
        filtersHook.filterAgencyRole,
        filtersHook.filterStatus
      ),
    [
      agenciesHook.agencies,
      filtersHook.searchTerm,
      filtersHook.filterAgencyRole,
      filtersHook.filterStatus,
    ]
  );

  const filteredUsersList = useMemo(
    () =>
      getFilteredUsers(
        usersHook.users,
        filtersHook.searchTerm,
        filtersHook.filterUserRole,
        filtersHook.filterStatus
      ),
    [
      usersHook.users,
      filtersHook.searchTerm,
      filtersHook.filterUserRole,
      filtersHook.filterStatus,
    ]
  );

  const filteredVideosList = useMemo(
    () =>
      getFilteredVideos(
        videosHook.videos,
        filtersHook.searchTerm,
        filtersHook.filterStatus
      ),
    [videosHook.videos, filtersHook.searchTerm, filtersHook.filterStatus]
  );

  // Handlers
  const handleOpenDeleteDialog = (
    id: number,
    type: "groom" | "bride" | "agency" | "user" | "video",
    name: string
  ) => {
    setDeleteTarget({ id, type, name });
    dialogStateHook.setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "groom" || deleteTarget.type === "bride") {
      clientsHook.handleDeleteClient(deleteTarget.id, deleteTarget.type);
    } else if (deleteTarget.type === "agency") {
      agenciesHook.handleDeleteAgency(deleteTarget.id);
    } else if (deleteTarget.type === "user") {
      usersHook.handleDeleteUser(deleteTarget.id);
    } else if (deleteTarget.type === "video") {
      videosHook.handleDeleteVideo(deleteTarget.id);
    }

    dialogStateHook.setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleAddClient = async (type: "groom" | "bride") => {
    const success = await clientsHook.handleAddClient(
      type,
      fileUploadHook.selectedPhotos,
      fileUploadHook.selectedVideo,
      selectedAvatar
    );
    
    // 등록 성공 시에만 sheet 닫기 및 초기화
    if (success) {
      if (type === "groom") {
        dialogStateHook.setIsAddGroomOpen(false);
      } else {
        dialogStateHook.setIsAddBrideOpen(false);
      }
      // 아바타 초기화
      setSelectedAvatar(null);
      fileUploadHook.resetFileUploads();
      clientsHook.resetNewClient();
    }
  };

  const handleUpdateClient = (type: "groom" | "bride") => {
    clientsHook.handleUpdateClient(
      type,
      fileUploadHook.selectedPhotos,
      fileUploadHook.selectedVideo,
      selectedAvatarForEdit
    );
    // 아바타 초기화
    setSelectedAvatarForEdit(null);
    fileUploadHook.resetFileUploads();
  };

  const handleCreateMatch = async () => {
    if (!matchDialogHook.matchingClient || !matchDialogHook.selectedPartner) {
      return;
    }

    try {
      const newMatch = await matchesHook.handleCreateMatch(
        matchDialogHook.matchingClient,
        matchDialogHook.selectedPartner,
        matchDialogHook.matchInfo,
        clientsHook.handleUpdateStatus
      );

      toast.success(
        `${newMatch.groom}님과 ${newMatch.bride}님의 매칭이 생성되었습니다.`
      );
      matchDialogHook.resetMatchDialog();
      
      // 찜 현황 새로고침
      if (activeTab === 'matches') {
        const loadFavoriteData = async () => {
          try {
            const { fetchFavoriteStatistics, fetchFavoriteMatchesOverview } = await import('../utils/api');
            const [stats, overview] = await Promise.all([
              fetchFavoriteStatistics(),
              fetchFavoriteMatchesOverview(),
            ]);
            setFavoriteStatistics(stats);
            setFavoriteMatchesOverview(overview);
          } catch (error) {
            console.error('Failed to reload favorite data:', error);
          }
        };
        loadFavoriteData();
      }
    } catch (error) {
      // 에러는 handleCreateMatch에서 이미 처리됨
    }
  };

  const handleOpenEdit = (client: Client) => {
    clientsHook.handleOpenEdit(client);
    if (client.type === "groom") {
      dialogStateHook.setIsEditGroomOpen(true);
    } else {
      dialogStateHook.setIsEditBrideOpen(true);
    }
  };

  const handleEditVideo = (video: typeof videosHook.videos[0]) => {
    videosHook.handleEditVideo(video);
    dialogStateHook.setIsAddVideoOpen(true);
  };

  const handleAvatarClick = (client: Client) => {
    const profile = client.type === "bride" 
      ? mapClientToBrideProfile(client as any)
      : mapClientToGroomProfile(client as any);
    setSelectedProfile(profile);
    setProfileDetailOpen(true);
  };

  // 찜 통계 및 매칭 현황 로드
  useEffect(() => {
    const loadFavoriteData = async () => {
      if (activeTab === 'matches') {
        setFavoritesLoading(true);
        try {
          const { fetchFavoriteStatistics, fetchFavoriteMatchesOverview } = await import('../utils/api');
          const [stats, overview] = await Promise.all([
            fetchFavoriteStatistics(),
            fetchFavoriteMatchesOverview(),
          ]);
          setFavoriteStatistics(stats);
          setFavoriteMatchesOverview(overview);
        } catch (error) {
          console.error('Failed to load favorite data:', error);
        } finally {
          setFavoritesLoading(false);
        }
      }
    };

    loadFavoriteData();
  }, [activeTab]);

  const handleCreateMatchFromFavorite = (groomId: number, brideId: number) => {
    const groom = clientsHook.grooms.find(c => c.id === groomId);
    const bride = clientsHook.brides.find(c => c.id === brideId);
    
    if (!groom || !bride) {
      return;
    }

    matchDialogHook.handleOpenMatchDialog(groom);
    matchDialogHook.setSelectedPartner(bride);
    dialogStateHook.setIsCreateMatchOpen(true);
  };

  const handleViewProfileFromFavorite = (profile: Client) => {
    const mappedProfile = profile.type === 'bride' 
      ? mapClientToBrideProfile(profile as any)
      : mapClientToGroomProfile(profile as any);
    setSelectedProfile(mappedProfile);
    setProfileDetailOpen(true);
  };

  const getAge = (profile: Profile): number => {
    if (profile.type === "bride") {
      const birthDate = (profile as BrideProfile).birthDate;
      if (birthDate) {
        const birthYear = new Date(birthDate).getFullYear();
        return new Date().getFullYear() - birthYear;
      }
      return 0;
    } else {
      const birthYear = (profile as GroomProfile).birthYear;
      return new Date().getFullYear() - birthYear;
    }
  };

  const handleDeleteVideo = (id: number) => {
    const video = videosHook.videos.find((v) => v.id === id);
    if (video) {
      handleOpenDeleteDialog(id, "video", video.title);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-4">
        <div className="flex gap-2">
          {activeTab === "grooms" && (
            <Sheet
              open={dialogStateHook.isAddGroomOpen}
              onOpenChange={dialogStateHook.setIsAddGroomOpen}
            >
              <SheetTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.buttons.registerGroom')}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
              >
                <GroomRegistrationForm
                  newClient={clientsHook.newClient}
                  setNewClient={clientsHook.setNewClient}
                  selectedPhotos={fileUploadHook.selectedPhotos}
                  photoPreviewUrls={fileUploadHook.photoPreviewUrls}
                  handlePhotoChange={fileUploadHook.handlePhotoChange}
                  handleRemovePhoto={fileUploadHook.handleRemovePhoto}
                  selectedVideo={fileUploadHook.selectedVideo}
                  videoPreviewUrl={fileUploadHook.videoPreviewUrl}
                  handleVideoChange={fileUploadHook.handleVideoChange}
                  handleRemoveVideo={fileUploadHook.handleRemoveVideo}
                  agencies={agenciesHook.agencies as any}
                  onClose={() => {
                    dialogStateHook.setIsAddGroomOpen(false);
                    setSelectedAvatar(null);
                  }}
                  onSubmit={() => handleAddClient("groom")}
                  selectedAvatar={selectedAvatar}
                  onAvatarChange={setSelectedAvatar}
                />
              </SheetContent>
            </Sheet>
          )}

          {activeTab === "brides" && (
            <Sheet
              open={dialogStateHook.isAddBrideOpen}
              onOpenChange={dialogStateHook.setIsAddBrideOpen}
            >
              <SheetTrigger asChild>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.buttons.registerBride')}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
              >
                <BrideRegistrationForm
                  newClient={clientsHook.newClient as any}
                  setNewClient={clientsHook.setNewClient}
                  selectedPhotos={fileUploadHook.selectedPhotos}
                  photoPreviewUrls={fileUploadHook.photoPreviewUrls}
                  handlePhotoChange={fileUploadHook.handlePhotoChange}
                  handleRemovePhoto={fileUploadHook.handleRemovePhoto}
                  selectedVideo={fileUploadHook.selectedVideo}
                  videoPreviewUrl={fileUploadHook.videoPreviewUrl}
                  handleVideoChange={fileUploadHook.handleVideoChange}
                  handleRemoveVideo={fileUploadHook.handleRemoveVideo}
                  agencies={agenciesHook.agencies as any}
                  onClose={() => {
                    dialogStateHook.setIsAddBrideOpen(false);
                    setSelectedAvatar(null);
                  }}
                  onSubmit={() => handleAddClient("bride")}
                  selectedAvatar={selectedAvatar}
                  onAvatarChange={setSelectedAvatar}
                />
              </SheetContent>
            </Sheet>
          )}

          {activeTab === "users" && (
            <Sheet
              open={dialogStateHook.isAddUserOpen}
              onOpenChange={dialogStateHook.setIsAddUserOpen}
            >
              <SheetTrigger asChild>
                <Button className="bg-slate-800 hover:bg-slate-900 text-white gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  사용자 추가
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
              >
                <UserForm
                  agencies={agenciesHook.agencies}
                  onSubmit={async (data) => {
                    await usersHook.handleAddUser(data);
                    dialogStateHook.setIsAddUserOpen(false);
                  }}
                  onCancel={() => dialogStateHook.setIsAddUserOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}

          {activeTab === "agencies" && (
            <Sheet
              open={dialogStateHook.isAddAgencyOpen}
              onOpenChange={dialogStateHook.setIsAddAgencyOpen}
            >
              <SheetTrigger asChild>
                <Button className="bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 border-0 shadow-md gap-2">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.buttons.registerAgency')}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
              >
                <AgencyRegistrationForm
                  newAgency={agenciesHook.newAgency}
                  setNewAgency={agenciesHook.setNewAgency}
                  onClose={() => dialogStateHook.setIsAddAgencyOpen(false)}
                  onAdd={async () => {
                    try {
                      await agenciesHook.handleAddAgency();
                      dialogStateHook.setIsAddAgencyOpen(false);
                    } catch (error) {
                      // 에러는 handleAddAgency에서 처리됨
                    }
                  }}
                />
              </SheetContent>
            </Sheet>
          )}

          {activeTab === "youtube" && (
            <Sheet
              open={dialogStateHook.isAddVideoOpen}
              onOpenChange={(open) => {
                dialogStateHook.setIsAddVideoOpen(open);
                if (!open) videosHook.resetEditingVideo();
              }}
            >
              <SheetTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.buttons.registerVideo')}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
              >
                <YouTubeRegistrationForm
                  initialData={videosHook.editingVideo || undefined}
                  onSubmit={async (data) => {
                    const success = await videosHook.handleAddVideo(data);
                    if (success) {
                      dialogStateHook.setIsAddVideoOpen(false);
                      videosHook.resetEditingVideo();
                    }
                  }}
                  onCancel={() => {
                    dialogStateHook.setIsAddVideoOpen(false);
                    videosHook.resetEditingVideo();
                  }}
                />
              </SheetContent>
            </Sheet>
          )}

          <Sheet
            open={dialogStateHook.isEditUserOpen}
            onOpenChange={dialogStateHook.setIsEditUserOpen}
          >
            <SheetContent
              side="bottom"
              className="h-[90vh] overflow-y-auto p-0 rounded-t-2xl"
            >
              {usersHook.editingUser && (
                <UserForm
                  initialData={usersHook.editingUser}
                  agencies={agenciesHook.agencies}
                  onSubmit={async (data) => {
                    await usersHook.handleUpdateUserSubmit(data);
                    dialogStateHook.setIsEditUserOpen(false);
                  }}
                  onCancel={() => dialogStateHook.setIsEditUserOpen(false)}
                />
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        grooms={clientsHook.grooms}
        brides={clientsHook.brides}
        matches={matchesHook.matches}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <DashboardHeader
          activeTab={activeTab}
          searchTerm={filtersHook.searchTerm}
          setSearchTerm={filtersHook.setSearchTerm}
          filterStatus={filtersHook.filterStatus}
          setFilterStatus={filtersHook.setFilterStatus}
          filterUserRole={filtersHook.filterUserRole}
          setFilterUserRole={filtersHook.setFilterUserRole}
          handleSortChange={filtersHook.handleSortChange}
          isAgencyMember={isAgencyMember}
        />

        <TabsContent value="grooms">
          <ClientTabContent
            clients={filteredGrooms}
            agencies={agenciesHook.agencies}
            type="groom"
            onStatusUpdate={clientsHook.handleUpdateStatus}
            onEdit={handleOpenEdit}
            onMatch={matchDialogHook.handleOpenMatchDialog}
            onDelete={(id, type, name) =>
              handleOpenDeleteDialog(id, type, name)
            }
            onSort={filtersHook.handleSort}
            sortConfig={filtersHook.sortConfig}
            onAvatarClick={handleAvatarClick}
          />
        </TabsContent>

        <TabsContent value="brides">
          <ClientTabContent
            clients={filteredBrides}
            agencies={agenciesHook.agencies}
            type="bride"
            onStatusUpdate={clientsHook.handleUpdateStatus}
            onEdit={handleOpenEdit}
            onMatch={matchDialogHook.handleOpenMatchDialog}
            onDelete={(id, type, name) =>
              handleOpenDeleteDialog(id, type, name)
            }
            onSort={filtersHook.handleSort}
            sortConfig={filtersHook.sortConfig}
            onAvatarClick={handleAvatarClick}
          />
        </TabsContent>

        {!isAgencyMember && (
          <TabsContent value="agencies">
            <AgencyTabContent
              agencies={filteredAgenciesList}
              filterRole={filtersHook.filterAgencyRole}
              onFilterRoleChange={filtersHook.setFilterAgencyRole}
              onEdit={(agency) => {
                agenciesHook.handleEditAgency(agency);
                dialogStateHook.setIsEditAgencyOpen(true);
              }}
              onDelete={(id) => {
                const agency = agenciesHook.agencies.find((a) => a.id === id);
                if (agency) {
                  handleOpenDeleteDialog(id, "agency", agency.name);
                }
              }}
            />
          </TabsContent>
        )}

        {!isAgencyMember && (
          <TabsContent value="users">
            <UserTabContent
              users={filteredUsersList}
              agencies={agenciesHook.agencies}
              onUpdateStatus={usersHook.handleUpdateUserStatus}
              onEdit={(user) => {
                usersHook.handleOpenEditUser(user);
                dialogStateHook.setIsEditUserOpen(true);
              }}
              onDelete={usersHook.handleDeleteUser}
            />
          </TabsContent>
        )}

        <TabsContent value="matches">
          <div className="space-y-6">
            {/* 찜 통계 */}
            <FavoriteStatsOverview 
              statistics={favoriteStatistics}
              loading={favoritesLoading}
            />
            
            {/* 찜/매칭 현황 */}
            <FavoriteMatchContent
              overview={favoriteMatchesOverview}
              loading={favoritesLoading}
              onViewProfile={handleViewProfileFromFavorite}
              onCreateMatch={handleCreateMatchFromFavorite}
            />
            
            {/* 기존 매칭 목록 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">전체 매칭 목록</h3>
              <MatchTabContent
                matches={matchesHook.matches}
                onOpenStageManager={(match) => {
                  matchesHook.handleOpenStageManager(match);
                  dialogStateHook.setIsStageManagerOpen(true);
                }}
              />
            </div>
          </div>
        </TabsContent>

        {!isAgencyMember && (
          <TabsContent value="youtube">
            <YouTubeTabContent
              videos={filteredVideosList}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={dialogStateHook.isDeleteDialogOpen}
        onOpenChange={dialogStateHook.setIsDeleteDialogOpen}
        deleteTarget={deleteTarget}
        onConfirm={handleDelete}
      />

      {/* Create Match Sheet */}
      <CreateMatchSheet
        open={matchDialogHook.isCreateMatchOpen}
        onOpenChange={matchDialogHook.setIsCreateMatchOpen}
        matchingClient={matchDialogHook.matchingClient}
        selectedPartner={matchDialogHook.selectedPartner}
        setSelectedPartner={matchDialogHook.setSelectedPartner}
        partnerSearchTerm={matchDialogHook.partnerSearchTerm}
        setPartnerSearchTerm={matchDialogHook.setPartnerSearchTerm}
        matchInfo={matchDialogHook.matchInfo}
        setMatchInfo={matchDialogHook.setMatchInfo}
        availablePartners={matchDialogHook.getAvailablePartners()}
        onCreateMatch={handleCreateMatch}
      />

      {/* Edit Groom Sheet */}
      <EditGroomSheet
        open={dialogStateHook.isEditGroomOpen}
        onOpenChange={dialogStateHook.setIsEditGroomOpen}
        editingClient={clientsHook.editingClient}
        setEditingClient={clientsHook.setEditingClient}
        agencies={agenciesHook.agencies}
        selectedPhotos={fileUploadHook.selectedPhotos}
        photoPreviewUrls={fileUploadHook.photoPreviewUrls}
        selectedVideo={fileUploadHook.selectedVideo}
        videoPreviewUrl={fileUploadHook.videoPreviewUrl}
        handlePhotoChange={fileUploadHook.handlePhotoChange}
        handleRemovePhoto={fileUploadHook.handleRemovePhoto}
        handleVideoChange={fileUploadHook.handleVideoChange}
        handleRemoveVideo={fileUploadHook.handleRemoveVideo}
        onSave={() => handleUpdateClient("groom")}
        selectedAvatar={selectedAvatarForEdit}
        onAvatarChange={setSelectedAvatarForEdit}
      />

      {/* Edit Bride Sheet */}
      <EditBrideSheet
        open={dialogStateHook.isEditBrideOpen}
        onOpenChange={dialogStateHook.setIsEditBrideOpen}
        editingClient={clientsHook.editingClient}
        setEditingClient={clientsHook.setEditingClient}
        agencies={agenciesHook.agencies}
        selectedPhotos={fileUploadHook.selectedPhotos}
        photoPreviewUrls={fileUploadHook.photoPreviewUrls}
        selectedVideo={fileUploadHook.selectedVideo}
        videoPreviewUrl={fileUploadHook.videoPreviewUrl}
        handlePhotoChange={fileUploadHook.handlePhotoChange}
        handleRemovePhoto={fileUploadHook.handleRemovePhoto}
        handleVideoChange={fileUploadHook.handleVideoChange}
        handleRemoveVideo={fileUploadHook.handleRemoveVideo}
        onSave={() => handleUpdateClient("bride")}
        selectedAvatar={selectedAvatarForEdit}
        onAvatarChange={setSelectedAvatarForEdit}
      />

      {/* Edit Agency Sheet */}
      <EditAgencySheet
        open={dialogStateHook.isEditAgencyOpen}
        onOpenChange={dialogStateHook.setIsEditAgencyOpen}
        newAgency={agenciesHook.newAgency}
        setNewAgency={agenciesHook.setNewAgency}
        onSave={async () => {
          try {
            await agenciesHook.handleUpdateAgency();
            dialogStateHook.setIsEditAgencyOpen(false);
          } catch (error) {
            // 에러는 handleUpdateAgency에서 처리됨
          }
        }}
      />

      {/* Match Stage Manager */}
      <MatchStageManager
        match={matchesHook.selectedMatch}
        open={dialogStateHook.isStageManagerOpen}
        onOpenChange={dialogStateHook.setIsStageManagerOpen}
        onUpdateMatch={matchesHook.handleUpdateMatch}
      />

      {/* Profile Detail Sheet */}
      <Sheet open={profileDetailOpen} onOpenChange={setProfileDetailOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-hidden flex flex-col p-0 rounded-t-2xl">
          {selectedProfile && (
            <>
              <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10 shadow-sm rounded-t-2xl">
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-slate-200 shadow-md">
                    {selectedProfile.avatarUrl ? (
                      <AvatarImage src={selectedProfile.avatarUrl} alt={getProfileDisplayName(selectedProfile)} />
                    ) : selectedProfile.images && selectedProfile.images.length > 0 ? (
                      <AvatarImage src={selectedProfile.images[0]} alt={getProfileDisplayName(selectedProfile)} />
                    ) : (
                      <AvatarFallback className={`${selectedProfile.type === 'bride' ? 'bg-gradient-to-br from-rose-400 to-pink-500' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'} text-white font-bold`}>
                        {selectedProfile.type === 'bride' ? '여' : '남'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{getProfileDisplayName(selectedProfile)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{getAge(selectedProfile)}세 · {selectedProfile.job}</p>
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {getProfileDisplayName(selectedProfile)} 프로필 상세 정보 및 사진
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {/* Image Slider - Full Width */}
                <div className="relative bg-slate-100 h-[60vh]">
                  <ProfileImageSlider 
                    images={selectedProfile.images} 
                    name={getProfileDisplayName(selectedProfile)}
                    videoUrl={selectedProfile.videoUrl}
                  />
                </div>

                {/* Profile Details */}
                <div className="max-w-2xl mx-auto space-y-4 p-6 pb-20">
                  {/* Basic Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-rose-600" />
                        <CardTitle>기본 정보</CardTitle>
                      </div>
                      <CardDescription>프로필 기본 정보</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(selectedProfile.height || selectedProfile.weight) && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Ruler className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">신장 / 체중</span>
                            </div>
                            <p className="font-medium">
                              {selectedProfile.height ? `${selectedProfile.height}cm` : ''}
                              {selectedProfile.height && selectedProfile.weight ? ' / ' : ''}
                              {selectedProfile.weight ? `${selectedProfile.weight}kg` : ''}
                            </p>
                          </div>
                        </div>
                      )}

                      {(selectedProfile.type === 'bride' ? (selectedProfile as BrideProfile).currentAddress : (selectedProfile as GroomProfile).residence) && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">거주지</span>
                            </div>
                            <p className="font-medium">{selectedProfile.type === 'bride' ? (selectedProfile as BrideProfile).currentAddress : (selectedProfile as GroomProfile).residence}</p>
                          </div>
                        </div>
                      )}

                      {selectedProfile.job && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">직업</span>
                            </div>
                            <p className="font-medium">{selectedProfile.job}</p>
                          </div>
                        </div>
                      )}

                      {selectedProfile.maritalStatus && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">결혼 상태</span>
                            </div>
                            <p className="font-medium">{selectedProfile.maritalStatus}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-rose-600" />
                        <CardTitle>상세 정보</CardTitle>
                      </div>
                      <CardDescription>{selectedProfile.type === 'bride' ? '학력 및 가족 정보' : '학력, 재산 및 라이프스타일'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedProfile.type === 'bride' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">학력</span>
                              </div>
                              <p className="font-medium">{(selectedProfile as BrideProfile).education}</p>
                            </div>
                          </div>

                          {(selectedProfile as BrideProfile).family && (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-500">가족사항</span>
                                </div>
                                <p className="font-medium">{(selectedProfile as BrideProfile).family}</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">학력</span>
                              </div>
                              <p className="font-medium">{(selectedProfile as GroomProfile).education}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">연 수입</span>
                              </div>
                              <p className="font-medium">{(selectedProfile as GroomProfile).income}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Wine className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">음주</span>
                              </div>
                              <p className="font-medium">{(selectedProfile as GroomProfile).drinking}</p>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Cigarette className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">흡연</span>
                              </div>
                              <p className="font-medium">{(selectedProfile as GroomProfile).smoking}</p>
                            </div>
                          </div>

                          {(selectedProfile as GroomProfile).religion && (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Church className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-500">종교</span>
                                </div>
                                <p className="font-medium">{(selectedProfile as GroomProfile).religion}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
