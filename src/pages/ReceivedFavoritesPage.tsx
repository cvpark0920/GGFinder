import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchReceivedFavoritesByAgency, updateFavoriteStatus } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { 
  Heart, 
  Check, 
  X, 
  Eye, 
  Loader2,
  MapPin, 
  Ruler, 
  Briefcase, 
  User, 
  DollarSign, 
  GraduationCap, 
  Cigarette, 
  Wine, 
  Church,
  FileEdit,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { GroomProfile, BrideProfile } from '../types';
import { mapClientToGroomProfile, mapClientToBrideProfile } from '../utils/dashboard/profileUtils';
import { fetchClients } from '../utils/api';
import { Client } from '../types/dashboard';
import { ProfileImageSlider } from '../components/ProfileImageSlider';
import { getProfileDisplayName } from '../utils/profileUtils';
import { useLanguage } from '../components/LanguageContext';

interface ReceivedFavorite {
  id: number;
  clientId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    agency: {
      id: number;
      name: string;
      role: string;
    };
  };
  oppositeProfile?: Client | null; // 신부소속사일 때는 groomProfile, 신랑소속사일 때는 brideProfile
}

interface ProfileWithFavorites {
  profile: {
    id: number;
    name: string;
    loc: string;
    status: string;
    images: any[];
    video: any;
    avatarUrl?: string;
  };
  favorites: ReceivedFavorite[];
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  accepted: '승인됨',
  rejected: '거절됨',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function ReceivedFavoritesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const STATUS_LABELS: Record<string, string> = {
    pending: t('favorite.received.pending'),
    accepted: t('favorite.received.approved'),
    rejected: t('favorite.received.rejected'),
  };
  const [profilesWithFavorites, setProfilesWithFavorites] = useState<ProfileWithFavorites[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<GroomProfile | BrideProfile | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [agencyRole, setAgencyRole] = useState<'bride' | 'groom' | null>(null);

  const isBrideAgency = agencyRole === 'bride';
  const profileLabel = isBrideAgency ? t('dashboard.tabs.brides') : t('dashboard.tabs.grooms');
  const oppositeLabel = isBrideAgency ? t('dashboard.tabs.grooms') : t('dashboard.tabs.brides');

  useEffect(() => {
    if (!user?.agency?.role || (user.agency.role !== 'bride' && user.agency.role !== 'groom')) {
      toast.error('소속사 회원만 접근할 수 있습니다.');
      return;
    }

    loadReceivedFavorites();
  }, [user]);

  const loadReceivedFavorites = async () => {
    try {
      setLoading(true);
      const data = await fetchReceivedFavoritesByAgency();
      // 실제 찜을 받은 프로필만 필터링 (favorites가 있는 프로필만)
      const profilesWithFavoritesData = (data.profiles || []).filter(
        (profile: ProfileWithFavorites) => profile.favorites && profile.favorites.length > 0
      );
      setProfilesWithFavorites(profilesWithFavoritesData);
      setAgencyRole(data.agencyRole || null);
    } catch (error) {
      console.error('Failed to load received favorites:', error);
      toast.error(t('error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (favoriteId: number, status: 'accepted' | 'rejected') => {
    try {
      setUpdatingStatus(favoriteId);
      await updateFavoriteStatus(favoriteId, status);
      toast.success(status === 'accepted' ? t('success.updated') : t('success.updated'));
      await loadReceivedFavorites();
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      toast.error('상태 업데이트에 실패했습니다.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewProfile = async (favorite: ReceivedFavorite) => {
    try {
      // 상대방 프로필 정보가 있으면 사용, 없으면 해당 소속사의 상대방 프로필 목록에서 첫 번째 가져오기
      let oppositeClient: Client | null = null;
      
      if (favorite.oppositeProfile) {
        oppositeClient = favorite.oppositeProfile as any;
      } else if (favorite.user.agency?.id) {
        // 해당 소속사의 상대방 프로필 목록 조회
        const oppositeType = isBrideAgency ? 'groom' : 'bride';
        const oppositeClients = await fetchClients(oppositeType);
        oppositeClient = oppositeClients.find(c => c.agencyId === favorite.user.agency.id) || null;
      }

      if (oppositeClient) {
        const oppositeProfile = isBrideAgency 
          ? mapClientToGroomProfile(oppositeClient)
          : mapClientToBrideProfile(oppositeClient);
        setSelectedProfile(oppositeProfile);
        setIsDetailSheetOpen(true);
      } else {
        toast.error(`${oppositeLabel} 프로필을 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('프로필을 불러오는데 실패했습니다.');
    }
  };

  const handleViewOwnProfile = async (profileData: ProfileWithFavorites) => {
    try {
      // 자신의 프로필 타입 결정
      const profileType = isBrideAgency ? 'bride' : 'groom';
      const clients = await fetchClients(profileType, true);
      const client = clients.find(c => c.id === profileData.profile.id);
      
      if (client) {
        const profile = isBrideAgency 
          ? mapClientToBrideProfile(client)
          : mapClientToGroomProfile(client);
        setSelectedProfile(profile);
        setIsDetailSheetOpen(true);
      } else {
        toast.error(`${profileLabel} 프로필을 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('프로필을 불러오는데 실패했습니다.');
    }
  };

  if (!user || !user.agency?.role || (user.agency.role !== 'bride' && user.agency.role !== 'groom')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">소속사 회원만 접근할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {profilesWithFavorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">{t('favorite.received.noFavorites')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {profilesWithFavorites.map((profileData) => (
              <Card key={profileData.profile.id} className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar 
                        className="w-20 h-20 border-4 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-rose-300 transition-all hover:scale-105"
                        onClick={() => handleViewOwnProfile(profileData)}
                      >
                        <AvatarImage src={profileData.profile.avatarUrl || profileData.profile.images[0]} />
                        <AvatarFallback className={`bg-gradient-to-br ${isBrideAgency ? 'from-rose-400 to-pink-500' : 'from-indigo-400 to-indigo-600'} text-white font-bold text-xl`}>
                          {profileData.profile.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-1">
                          {isBrideAgency ? 'BR' : 'GR'}-{String(profileData.profile.id).padStart(3, '0')}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <p className="text-sm">{profileData.profile.loc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm font-semibold">
                        전체 {profileData.totalCount}건
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 text-sm font-semibold">
                        대기 {profileData.pendingCount}건
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm font-semibold">
                        {t('favorite.received.approved')} {profileData.acceptedCount}{t('common.count')}
                      </Badge>
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm font-semibold">
                        {t('favorite.received.rejected')} {profileData.rejectedCount}{t('common.count')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {profileData.favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">이 {profileLabel}를 찜한 {oppositeLabel}이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {profileData.favorites.map((favorite) => (
                        <Card key={favorite.id} className="hover:shadow-xl transition-all duration-200 border border-slate-200 overflow-hidden group bg-gradient-to-br from-white to-slate-50/30">
                          <CardContent className="p-5">
                            {/* Header with Avatar and Status */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative">
                                  <Avatar 
                                    className="w-16 h-16 border-4 border-white shadow-lg ring-2 ring-slate-100 flex-shrink-0 cursor-pointer hover:ring-rose-300 transition-all hover:scale-105"
                                    onClick={() => handleViewProfile(favorite)}
                                  >
                                    {favorite.oppositeProfile?.avatarUrl ? (
                                      <AvatarImage src={favorite.oppositeProfile.avatarUrl} alt={favorite.user.name} />
                                    ) : favorite.oppositeProfile?.images && Array.isArray(favorite.oppositeProfile.images) && favorite.oppositeProfile.images.length > 0 ? (
                                      <AvatarImage src={favorite.oppositeProfile.images[0]} alt={favorite.user.name} />
                                    ) : null}
                                    <AvatarFallback className={`bg-gradient-to-br ${isBrideAgency ? 'from-indigo-400 to-indigo-600' : 'from-rose-400 to-pink-500'} text-white font-bold text-lg`}>
                                      {favorite.user.name.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {favorite.status === 'pending' && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-lg text-slate-900 truncate mb-0.5">
                                    {favorite.oppositeProfile?.id 
                                      ? `${isBrideAgency ? 'GR' : 'BR'}-${String(favorite.oppositeProfile.id).padStart(3, '0')}`
                                      : favorite.user.name}
                                  </p>
                                  {favorite.oppositeProfile?.name && (
                                    <p className="text-xs text-slate-500 truncate">{favorite.oppositeProfile.name}</p>
                                  )}
                                </div>
                              </div>
                              <Badge 
                                className={`${STATUS_COLORS[favorite.status]} text-white border-0 shadow-md text-xs font-semibold px-2.5 py-1`}
                                variant="default"
                              >
                                {STATUS_LABELS[favorite.status]}
                              </Badge>
                            </div>

                            {/* Date Information */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100 shadow-sm">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-slate-500 mb-0.5 font-medium">{t('favorite.received.favoritedDate')}</div>
                                  <div className="text-sm font-semibold text-slate-700">
                                    {new Date(favorite.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              {favorite.updatedAt !== favorite.createdAt && (
                                <div className="flex items-center gap-4 text-sm mt-3 pt-3 border-t border-blue-200">
                                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500 mb-0.5 font-medium">{t('favorite.received.statusChangedDate')}</div>
                                    <div className="text-sm font-semibold text-slate-700">
                                      {new Date(favorite.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              {favorite.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 !bg-green-600 hover:!bg-green-700 !text-white shadow-sm border-0"
                                    onClick={() => handleStatusUpdate(favorite.id, 'accepted')}
                                    disabled={updatingStatus === favorite.id}
                                  >
                                    {updatingStatus === favorite.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-1" />
                                        {t('favorite.received.approve')}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1 shadow-sm"
                                    onClick={() => handleStatusUpdate(favorite.id, 'rejected')}
                                    disabled={updatingStatus === favorite.id}
                                  >
                                    {updatingStatus === favorite.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <X className="w-4 h-4 mr-1" />
                                        {t('favorite.received.reject')}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile Detail Sheet */}
      {selectedProfile && (
        <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-hidden flex flex-col p-0 rounded-t-2xl">
            <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10 shadow-sm rounded-t-2xl">
              <SheetTitle className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-slate-200 shadow-md">
                  {selectedProfile.avatarUrl ? (
                    <AvatarImage src={selectedProfile.avatarUrl} alt={getProfileDisplayName(selectedProfile)} />
                  ) : selectedProfile.images && selectedProfile.images.length > 0 ? (
                    <AvatarImage src={selectedProfile.images[0]} alt={getProfileDisplayName(selectedProfile)} />
                  ) : (
                    <AvatarFallback className={`bg-gradient-to-br ${isBrideAgency ? 'from-indigo-400 to-indigo-600' : 'from-rose-400 to-pink-500'} text-white font-bold`}>
                      {isBrideAgency ? '남' : '여'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{getProfileDisplayName(selectedProfile)}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedProfile.birthYear ? new Date().getFullYear() - selectedProfile.birthYear : ''}세 · {selectedProfile.job}
                  </p>
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
                  images={selectedProfile.images || []} 
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
                      <User className="w-5 h-5 text-rose-600" />
                      <CardTitle>기본 정보</CardTitle>
                    </div>
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

                    {selectedProfile.residence && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">거주지</span>
                          </div>
                          <p className="font-medium">{selectedProfile.residence}</p>
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedProfile.education && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">학력</span>
                          </div>
                          <p className="font-medium">{selectedProfile.education}</p>
                        </div>
                      </div>
                    )}

                    {selectedProfile.income && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">연 수입</span>
                          </div>
                          <p className="font-medium">{selectedProfile.income}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t grid grid-cols-2 gap-4">
                      {selectedProfile.drinking && (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Wine className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">음주</span>
                          </div>
                          <p className="font-medium">{selectedProfile.drinking}</p>
                        </div>
                      )}
                      {selectedProfile.smoking && (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Cigarette className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">흡연</span>
                          </div>
                          <p className="font-medium">{selectedProfile.smoking}</p>
                        </div>
                      )}
                    </div>

                    {selectedProfile.religion && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Church className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">종교</span>
                          </div>
                          <p className="font-medium">{selectedProfile.religion}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Memo Card if exists */}
                {selectedProfile.memo && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-rose-600" />
                        <CardTitle>메모</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedProfile.memo}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

