import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Heart,
  Check,
  X,
  Eye,
  Calendar,
  Users,
  MapPin,
  Loader2,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { Client } from "../../types/dashboard";
import { toast } from "sonner";

interface FavoriteMatchOverview {
  profiles: Array<{
    profile: {
      id: number;
      name: string;
      type: string;
      agency: {
        id: number;
        name: string;
      };
      avatarUrl?: string;
    };
    favorites: Array<{
      id: number;
      clientId: number;
      userId: number;
      status: 'pending' | 'accepted' | 'rejected';
      createdAt: string;
      updatedAt: string;
      user: any;
      oppositeProfile?: Client | null;
    }>;
    hasMatch: boolean;
    matchId?: number;
  }>;
  summary: {
    totalAccepted: number;
    matched: number;
    unmatched: number;
  };
}

interface FavoriteMatchContentProps {
  overview: FavoriteMatchOverview | null;
  loading?: boolean;
  onViewProfile?: (profile: Client) => void;
  onCreateMatch?: (groomId: number, brideId: number) => void;
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

export function FavoriteMatchContent({
  overview,
  loading,
  onViewProfile,
  onCreateMatch,
}: FavoriteMatchContentProps) {
  const [expandedProfileId, setExpandedProfileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('bride');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  if (overview.profiles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">찜 현황이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">승인된 찜</p>
                <p className="text-2xl font-bold text-slate-900">{overview.summary.totalAccepted}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">매칭 완료</p>
                <p className="text-2xl font-bold text-blue-600">{overview.summary.matched}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">매칭 대기</p>
                <p className="text-2xl font-bold text-orange-600">{overview.summary.unmatched}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 프로필별 찜 현황 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'groom' | 'bride')} className="w-full">
        <div className="flex gap-3 bg-white rounded-xl p-2 shadow-sm border border-slate-200 max-w-md mb-6">
          <button
            onClick={() => setActiveTab('bride')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'bride'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">신부</span>
          </button>
          <button
            onClick={() => setActiveTab('groom')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'groom'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">신랑</span>
          </button>
        </div>

        <TabsContent value="bride" className="space-y-4">
          {overview.profiles.filter(p => p.profile.type === 'bride').map((profileData) => {
          const isExpanded = expandedProfileId === profileData.profile.id;
          const acceptedFavorites = profileData.favorites.filter(f => f.status === 'accepted');
          const pendingFavorites = profileData.favorites.filter(f => f.status === 'pending');
          const rejectedFavorites = profileData.favorites.filter(f => f.status === 'rejected');

          return (
            <Card key={profileData.profile.id} className="overflow-hidden border-0 shadow-lg">
              <CardHeader 
                className="border-b border-slate-200 cursor-pointer"
                onClick={() => setExpandedProfileId(isExpanded ? null : profileData.profile.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                      <AvatarImage src={profileData.profile.avatarUrl} />
                      <AvatarFallback className={`bg-gradient-to-br ${profileData.profile.type === 'bride' ? 'from-rose-400 to-pink-500' : 'from-indigo-400 to-indigo-600'} text-white font-bold text-xl`}>
                        {profileData.profile.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                        {profileData.profile.type === 'bride' ? 'BR' : 'GR'}-{String(profileData.profile.id).padStart(3, '0')}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-sm">{profileData.profile.name}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{profileData.profile.agency.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm font-semibold">
                      전체 {profileData.favorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 text-sm font-semibold">
                      대기 {pendingFavorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm font-semibold">
                      승인 {acceptedFavorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm font-semibold">
                      거절 {rejectedFavorites.length}건
                    </Badge>
                    {profileData.hasMatch && (
                      <Badge variant="default" className="bg-blue-600 text-white border-0 px-3 py-1.5 text-sm font-semibold">
                        매칭 완료
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-6">
                  {profileData.favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">찜받은 목록이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 승인된 찜 중 매칭이 없는 것 */}
                      {acceptedFavorites.length > 0 && !profileData.hasMatch && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-orange-900">매칭 대기 중인 승인된 찜</h4>
                            {acceptedFavorites.length > 0 && acceptedFavorites[0].oppositeProfile && onCreateMatch && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  const oppositeProfile = acceptedFavorites[0].oppositeProfile;
                                  if (oppositeProfile) {
                                    if (profileData.profile.type === 'bride') {
                                      onCreateMatch(oppositeProfile.id, profileData.profile.id);
                                    } else {
                                      onCreateMatch(profileData.profile.id, oppositeProfile.id);
                                    }
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                매칭 생성
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {acceptedFavorites.map((favorite) => (
                              <Card key={favorite.id} className="border border-orange-200">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2">
                                    {onViewProfile && favorite.oppositeProfile ? (
                                      <Avatar 
                                        className="w-10 h-10 border border-orange-300 cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
                                        onClick={() => onViewProfile(favorite.oppositeProfile!)}
                                      >
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-sm">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <Avatar className="w-10 h-10 border border-orange-300">
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-sm">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold truncate">
                                        {favorite.oppositeProfile?.id 
                                          ? `${profileData.profile.type === 'bride' ? 'GR' : 'BR'}-${String(favorite.oppositeProfile.id).padStart(3, '0')}`
                                          : favorite.user.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">{favorite.user.agency?.name}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 전체 찜 목록 */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">전체 찜 목록</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {profileData.favorites.map((favorite) => (
                            <Card key={favorite.id} className="hover:shadow-md transition-shadow border border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {onViewProfile && favorite.oppositeProfile ? (
                                      <Avatar 
                                        className="w-12 h-12 border-2 border-slate-200 cursor-pointer hover:ring-2 hover:ring-slate-400 transition-all"
                                        onClick={() => onViewProfile(favorite.oppositeProfile!)}
                                      >
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <Avatar className="w-12 h-12 border-2 border-slate-200">
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">
                                        {favorite.oppositeProfile?.id 
                                          ? `${profileData.profile.type === 'bride' ? 'GR' : 'BR'}-${String(favorite.oppositeProfile.id).padStart(3, '0')}`
                                          : favorite.user.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">{favorite.user.agency?.name}</p>
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`${STATUS_COLORS[favorite.status]} text-white border-0 text-xs`}
                                    variant="default"
                                  >
                                    {STATUS_LABELS[favorite.status]}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(favorite.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
          })}
          {overview.profiles.filter(p => p.profile.type === 'bride').length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">신부 프로필의 찜 현황이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groom" className="space-y-4">
          {overview.profiles.filter(p => p.profile.type === 'groom').map((profileData) => {
          const isExpanded = expandedProfileId === profileData.profile.id;
          const acceptedFavorites = profileData.favorites.filter(f => f.status === 'accepted');
          const pendingFavorites = profileData.favorites.filter(f => f.status === 'pending');
          const rejectedFavorites = profileData.favorites.filter(f => f.status === 'rejected');

          return (
            <Card key={profileData.profile.id} className="overflow-hidden border-0 shadow-lg">
              <CardHeader 
                className="border-b border-slate-200 cursor-pointer"
                onClick={() => setExpandedProfileId(isExpanded ? null : profileData.profile.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                      <AvatarImage src={profileData.profile.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-xl">
                        {profileData.profile.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                        GR-{String(profileData.profile.id).padStart(3, '0')}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-sm">{profileData.profile.name}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{profileData.profile.agency.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm font-semibold">
                      전체 {profileData.favorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 text-sm font-semibold">
                      대기 {pendingFavorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm font-semibold">
                      승인 {acceptedFavorites.length}건
                    </Badge>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-sm font-semibold">
                      거절 {rejectedFavorites.length}건
                    </Badge>
                    {profileData.hasMatch && (
                      <Badge variant="default" className="bg-blue-600 text-white border-0 px-3 py-1.5 text-sm font-semibold">
                        매칭 완료
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-6">
                  {profileData.favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">찜받은 목록이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 승인된 찜 중 매칭이 없는 것 */}
                      {acceptedFavorites.length > 0 && !profileData.hasMatch && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-orange-900">매칭 대기 중인 승인된 찜</h4>
                            {acceptedFavorites.length > 0 && acceptedFavorites[0].oppositeProfile && onCreateMatch && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  const oppositeProfile = acceptedFavorites[0].oppositeProfile;
                                  if (oppositeProfile) {
                                    onCreateMatch(profileData.profile.id, oppositeProfile.id);
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                매칭 생성
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {acceptedFavorites.map((favorite) => (
                              <Card key={favorite.id} className="border border-orange-200">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2">
                                    {onViewProfile && favorite.oppositeProfile ? (
                                      <Avatar 
                                        className="w-10 h-10 border border-orange-300 cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
                                        onClick={() => onViewProfile(favorite.oppositeProfile!)}
                                      >
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-sm">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <Avatar className="w-10 h-10 border border-orange-300">
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-sm">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold truncate">
                                        {favorite.oppositeProfile?.id 
                                          ? `BR-${String(favorite.oppositeProfile.id).padStart(3, '0')}`
                                          : favorite.user.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">{favorite.user.agency?.name}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 전체 찜 목록 */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">전체 찜 목록</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {profileData.favorites.map((favorite) => (
                            <Card key={favorite.id} className="hover:shadow-md transition-shadow border border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {onViewProfile && favorite.oppositeProfile ? (
                                      <Avatar 
                                        className="w-12 h-12 border-2 border-slate-200 cursor-pointer hover:ring-2 hover:ring-slate-400 transition-all"
                                        onClick={() => onViewProfile(favorite.oppositeProfile!)}
                                      >
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <Avatar className="w-12 h-12 border-2 border-slate-200">
                                        {favorite.oppositeProfile?.avatarUrl ? (
                                          <AvatarImage src={favorite.oppositeProfile.avatarUrl} />
                                        ) : favorite.oppositeProfile?.images?.[0] ? (
                                          <AvatarImage src={favorite.oppositeProfile.images[0]} />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                                          {favorite.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">
                                        {favorite.oppositeProfile?.id 
                                          ? `BR-${String(favorite.oppositeProfile.id).padStart(3, '0')}`
                                          : favorite.user.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">{favorite.user.agency?.name}</p>
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`${STATUS_COLORS[favorite.status]} text-white border-0 text-xs`}
                                    variant="default"
                                  >
                                    {STATUS_LABELS[favorite.status]}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(favorite.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
          })}
          {overview.profiles.filter(p => p.profile.type === 'groom').length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">신랑 프로필의 찜 현황이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

