import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Ruler, 
  Briefcase, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Heart, 
  DollarSign, 
  GraduationCap, 
  Users, 
  Cigarette, 
  Wine, 
  Church,
  FileEdit,
  Calendar,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { ProfileFilters, FilterState, INITIAL_FILTERS } from '../components/ProfileFilters';
import { ProfileImageSlider } from '../components/ProfileImageSlider';
import { BrideProfile, GroomProfile, Profile, ProfileStatus } from '../types';
import { fetchClients, fetchFavorites, addFavorite, removeFavorite } from '../utils/api';
import { mapClientToBrideProfile, mapClientToGroomProfile } from '../utils/dashboard/profileUtils';
import { getProfileDisplayName } from '../utils/profileUtils';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ProfileSelectDialog } from '../components/ProfileSelectDialog';

interface ProfileListProps {
  type: 'bride' | 'groom';
}

const STATUS_COLORS: Record<ProfileStatus, string> = {
  active: "bg-green-500 hover:bg-green-600",
  consulting: "bg-yellow-500 hover:bg-yellow-600",
  matched: "bg-blue-500 hover:bg-blue-600",
  inactive: "bg-slate-500 hover:bg-slate-600",
};

const STATUS_LABELS: Record<ProfileStatus, string> = {
  active: "활동중",
  consulting: "상담중",
  matched: "매칭완료",
  inactive: "비활성",
};

export default function ProfileList({ type }: ProfileListProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] = useState(false);
  const [pendingFavoriteClientId, setPendingFavoriteClientId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true, state: { fromProtectedRoute: true } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // 프로필 목록 로드
  useEffect(() => {
    // 인증되지 않은 상태면 API 호출하지 않음
    if (!isAuthenticated || authLoading) {
      return;
    }

    // 권한 체크: 사용자가 해당 타입의 프로필을 조회할 수 있는지 확인
    if (user) {
      const canViewBrides = user.role === 'super_admin' || user.role === 'platform_admin' || user.agency?.role === 'groom';
      const canViewGrooms = user.role === 'super_admin' || user.role === 'platform_admin' || user.agency?.role === 'bride';
      
      if (type === 'bride' && !canViewBrides) {
        setError('신부소속사 회원은 신랑 프로필만 조회할 수 있습니다.');
        setIsLoading(false);
        return;
      }
      
      if (type === 'groom' && !canViewGrooms) {
        setError('신랑소속사 회원은 신부 프로필만 조회할 수 있습니다.');
        setIsLoading(false);
        return;
      }
    }

    const loadProfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const clients = await fetchClients(type);
        
        const mappedProfiles = clients.map((client) => {
          if (type === 'bride') {
            return mapClientToBrideProfile(client);
          } else {
            return mapClientToGroomProfile(client);
          }
        });
        
        
        setProfiles(mappedProfiles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '프로필 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error('Failed to load profiles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [type, isAuthenticated, authLoading, user]);

  // 찜 목록 로드 (인증된 사용자만)
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const favoritesData = await fetchFavorites();
        const favoriteIds = new Set(favoritesData.map((fav) => fav.clientId.toString()));
        setFavorites(favoriteIds);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        // 찜 목록 로드 실패는 치명적이지 않으므로 에러 토스트만 표시하지 않음
      }
    };

    loadFavorites();
  }, [user]);

  const toggleProfile = (id: string) => {
    setExpandedProfileId(current => current === id ? null : id);
  };

  const toggleFavorite = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      return;
    }

    // 소속사 회원인지 확인 (권한 검증은 백엔드에서 처리)
    if (!user.agencyId || !user.agency) {
      return;
    }

    const clientId = parseInt(profileId);
    if (isNaN(clientId)) {
      console.error('Invalid profile ID:', profileId);
      return;
    }

    const isFavorite = favorites.has(profileId);

    try {
      if (isFavorite) {
        // 이미 찜한 경우 바로 제거
        await removeFavorite(clientId);
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(profileId);
          return newFavorites;
        });
        toast.success(t('profile.favoriteRemoved'));
      } else {
        // 찜하기 전에 프로필 선택 다이얼로그 표시
        setPendingFavoriteClientId(clientId);
        setIsProfileSelectDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleProfileSelect = async (fromClientId: number) => {
    if (pendingFavoriteClientId === null) return;

    try {
      await addFavorite(pendingFavoriteClientId, fromClientId);
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.add(pendingFavoriteClientId.toString());
        return newFavorites;
      });
      toast.success(t('profile.favoriteAdded'));
      setPendingFavoriteClientId(null);
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };

  /**
   * 출생년도로부터 나이 계산
   */
  const calculateAge = (birthYear: number): number => {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const getAge = (profile: Profile) => {
    if (profile.type === 'bride') {
      const brideProfile = profile as BrideProfile;
      // birthDate에서 birthYear 추출 (호환성)
      const birthYear = brideProfile.birthDate 
        ? parseInt(brideProfile.birthDate.split('-')[0])
        : (profile as any).birthYear || 0;
      return calculateAge(birthYear);
    } else {
      const groomProfile = profile as GroomProfile;
      const birthYear = groomProfile.birthYear || 0;
      return calculateAge(birthYear);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const isBride = profile.type === 'bride';
      const age = getAge(profile);

      // 0. Status Filter (Common)
      if (filters.status !== 'all' && profile.status !== filters.status) {
        return false;
      }

      // 1. Name Search (Common) - Search by profile code (BR-001, GR-001)
      if (filters.search) {
        const displayName = getProfileDisplayName(profile);
        if (!displayName.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      // 2. Age Range (Common)
      if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
        return false;
      }

      // 3. Height Range (Common) - null/undefined/0 체크 추가 (값이 없거나 0이면 필터링하지 않음)
      if (profile.height != null && profile.height > 0 && (profile.height < filters.heightRange[0] || profile.height > filters.heightRange[1])) {
        return false;
      }

      // 4. Weight Range (Common) - null/undefined/0 체크 추가 (값이 없거나 0이면 필터링하지 않음)
      if (profile.weight != null && profile.weight > 0 && (profile.weight < filters.weightRange[0] || profile.weight > filters.weightRange[1])) {
        return false;
      }

      // 5. Marital Status (Common)
      if (filters.maritalStatus !== 'all') {
        const status = profile.maritalStatus.toLowerCase();
        const filter = filters.maritalStatus;
        
        if (filter === 'single') {
           if (!status.includes('미혼') && !status.includes('single') && !status.includes('độc thân')) return false;
        } else if (filter === 'divorced') {
           if (!status.includes('이혼') && !status.includes('divorced') && !status.includes('ly hôn')) return false;
        } else if (filter === 'widowed') {
           if (!status.includes('사별') && !status.includes('widowed') && !status.includes('góa')) return false;
        }
      }

      // 6. Education (Common)
      if (filters.education) {
        const edu = (isBride ? (profile as BrideProfile).education : (profile as GroomProfile).education).toLowerCase();
        if (!edu.includes(filters.education.toLowerCase())) return false;
      }

      // 7. Job (Common)
      if (filters.job) {
        const job = profile.job.toLowerCase();
        if (!job.includes(filters.job.toLowerCase())) return false;
      }
      
      // 8. Tattoo (Common)
      if (filters.tattoo !== 'all') {
        const tattoo = profile.tattoo.toLowerCase();
        if (filters.tattoo === 'no') {
           if (!tattoo.includes('없음') && !tattoo.includes('không') && !tattoo.includes('no')) return false;
        } else if (filters.tattoo === 'yes') {
           if (tattoo.includes('없음') || tattoo.includes('không') || tattoo.includes('no')) return false;
        }
      }

      // Type Specific Filters
      if (isBride) {
        const p = profile as BrideProfile;
        
        // Destination
        if (filters.destination && filters.destination !== 'all') {
           const dest = p.desiredDestination.toLowerCase();
           if (filters.destination === 'korea' && !dest.includes('한국') && !dest.includes('korea')) return false;
           if (filters.destination === 'taiwan' && !dest.includes('대만') && !dest.includes('taiwan')) return false;
        }
        
        // Location (Current Address)
        if (filters.location) {
           const loc = p.currentAddress.toLowerCase();
           if (!loc.includes(filters.location.toLowerCase())) return false;
        }
        
        // Monthly Income
        if (filters.monthlyIncome) {
           const inc = p.monthlyIncome.toLowerCase();
           if (!inc.includes(filters.monthlyIncome.toLowerCase())) return false;
        }
        
        // Children
        if (filters.children) {
           const children = p.children.toLowerCase();
           if (!children.includes(filters.children.toLowerCase())) return false;
        }

        // Guarantee
        if (filters.guarantee !== 'all') {
           if (filters.guarantee === 'yes' && !p.guarantee) return false;
           if (filters.guarantee === 'no' && p.guarantee) return false;
        }

      } else {
        const p = profile as GroomProfile;
        
        // Residence
        if (filters.residence && !p.residence.toLowerCase().includes(filters.residence.toLowerCase())) {
          return false;
        }
        
        // Annual Income
        if (filters.annualIncome) {
           const inc = p.income.toLowerCase();
           if (!inc.includes(filters.annualIncome.toLowerCase())) return false;
        }
        
        
        // Smoking
        if (filters.smoking !== 'all') {
           const smoking = p.smoking.toLowerCase();
           if (filters.smoking === 'no') {
              if (!smoking.includes('안 함') && !smoking.includes('없음') && !smoking.includes('không') && !smoking.includes('no')) return false;
           } else {
              if (smoking.includes('안 함') || smoking.includes('없음') || smoking.includes('không') || smoking.includes('no')) return false;
           }
        }
        
        // Drinking
        if (filters.drinking !== 'all') {
           const drinking = p.drinking.toLowerCase();
           if (filters.drinking === 'no') {
              if (!drinking.includes('안 함') && !drinking.includes('없음') && !drinking.includes('không') && !drinking.includes('no') && !drinking.includes('hiếm')) return false;
           } else {
              if (drinking.includes('안 함') || drinking.includes('없음') || drinking.includes('không') || drinking.includes('no')) return false;
           }
        }
        
        // Religion
        if (filters.religion) {
           const rel = p.religion.toLowerCase();
           if (!rel.includes(filters.religion.toLowerCase())) return false;
        }
      }

      return true;
    });
  }, [profiles, filters, type]);

  const sortedProfiles = useMemo(() => {
    let profilesToSort = filteredProfiles;
    
    // Apply favorites filter if enabled
    if (showFavoritesOnly) {
      profilesToSort = filteredProfiles.filter(profile => favorites.has(profile.id));
    }
    
    return [...profilesToSort].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      
      if (sortBy === 'age') {
        return getAge(a) - getAge(b);
      }
      
      if (sortBy === 'status') {
        const order: Record<ProfileStatus, number> = { active: 1, consulting: 2, matched: 3, inactive: 4 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      
      return 0; // recent (keep original order)
    });
  }, [filteredProfiles, sortBy, showFavoritesOnly, favorites]);

  const renderDetailRow = (icon: React.ReactNode, label: string, value: string | number) => (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
      <div>
        <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-600 leading-relaxed">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 제목 제거됨 */}
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder={t('profile.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('profile.recent')}</SelectItem>
              <SelectItem value="name">{t('profile.name')}</SelectItem>
              <SelectItem value="age">{t('profile.age')}</SelectItem>
              <SelectItem value="status">{t('profile.status')}</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Favorites Toggle Button */}
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`gap-2 ${
              showFavoritesOnly 
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white border-0 shadow-md' 
                : ''
            }`}
          >
            <Heart 
              className={`w-4 h-4 ${
                showFavoritesOnly ? 'fill-white' : ''
              }`}
            />
            <span className="hidden sm:inline">{t('profile.favorites')}</span>
            {favorites.size > 0 && (
              <Badge 
                variant="secondary" 
                className={`ml-1 ${
                  showFavoritesOnly 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {favorites.size}
              </Badge>
            )}
          </Button>
          
          {/* Filter Button - Mobile & Desktop */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline"
                className="gap-2 lg:hidden"
              >
                <Filter className="w-4 h-4" />
                {t('common.filter')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>{t('profile.filters')}</SheetTitle>
                <SheetDescription>
                    {t('profile.filters')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 h-[calc(85vh-8rem)] overflow-y-auto pr-4 pb-20">
                <ProfileFilters 
                  type={type} 
                  filters={filters} 
                  setFilters={setFilters} 
                  className="border-0 p-0 shadow-none"
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <span className="text-sm text-slate-500 hidden sm:inline-block">
            {sortedProfiles.length}{t('profile.found')}
          </span>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <ProfileFilters type={type} filters={filters} setFilters={setFilters} />
        </aside>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-slate-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Filter className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900">프로필을 불러올 수 없습니다</h3>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
          ) : sortedProfiles.length > 0 ? (
            sortedProfiles.map((profile) => (
              <div key={profile.id} className="group h-full">
                <Sheet>
                  <SheetTrigger asChild>
                    <div className="h-full cursor-pointer">
                      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-gradient-to-br from-white to-slate-50/30">
                        {/* Accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                          {/* Main Image Only */}
                          <img 
                            src={profile.images[0]} 
                            alt={getProfileDisplayName(profile)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className={`${STATUS_COLORS[profile.status]} text-white border-0 shadow-md`}>
                              {STATUS_LABELS[profile.status]}
                            </Badge>
                          </div>

                          {/* Age Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-800 border-0 shadow-md">
                              {getAge(profile)}세
                            </Badge>
                          </div>

                          {/* 찜하기 버튼 - 프로필 목록 카드 사진 위 */}
                          {((type === 'bride' && user?.agency?.role === 'groom') || (type === 'groom' && user?.agency?.role === 'bride')) && (
                            <motion.button
                              onClick={(e) => toggleFavorite(e, profile.id)}
                              className="absolute bottom-3 right-3 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                              whileTap={{ scale: 0.9 }}
                              aria-label={favorites.has(profile.id) ? "찜 해제" : "찜하기"}
                            >
                              <Heart 
                                className={`w-6 h-6 transition-colors ${
                                  favorites.has(profile.id) 
                                    ? 'fill-rose-500 text-rose-500' 
                                    : 'text-slate-400'
                                }`}
                              />
                            </motion.button>
                          )}

                        </div>
                        
                        <CardContent className="p-4 flex-1">
                          <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">{getProfileDisplayName(profile)}</h3>
                          <div className="space-y-2 text-sm text-slate-600 mt-3">
                            {((profile.height && profile.height > 0) || (profile.weight && profile.weight > 0)) && (
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-slate-400" />
                                <span>
                                  {profile.height && profile.height > 0 ? `${profile.height}cm` : ''}
                                  {(profile.height && profile.height > 0) && (profile.weight && profile.weight > 0) ? ' / ' : ''}
                                  {profile.weight && profile.weight > 0 ? `${profile.weight}kg` : ''}
                                </span>
                              </div>
                            )}
                            {profile.job && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{profile.job}</span>
                              </div>
                            )}
                            {(type === 'bride' ? (profile as any).currentAddress : (profile as any).residence) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="truncate">
                                  {type === 'bride' ? (profile as any).currentAddress : (profile as any).residence}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </SheetTrigger>

                  <SheetContent side="bottom" className="h-[90vh] overflow-hidden flex flex-col p-0 rounded-t-2xl">
                    <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10 shadow-sm rounded-t-2xl">
                      <div className="flex items-start justify-between gap-4">
                        <SheetTitle className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10 border-2 border-slate-200 shadow-md">
                            {profile.avatarUrl ? (
                              <AvatarImage src={profile.avatarUrl} alt={getProfileDisplayName(profile)} />
                            ) : profile.images && profile.images.length > 0 ? (
                              <AvatarImage src={profile.images[0]} alt={getProfileDisplayName(profile)} />
                            ) : (
                              <AvatarFallback className={`${profile.type === 'bride' ? 'bg-gradient-to-br from-rose-400 to-pink-500' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'} text-white font-bold`}>
                                {profile.type === 'bride' ? '여' : '남'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{getProfileDisplayName(profile)}</span>
                              <Badge className={`${STATUS_COLORS[profile.status]} text-white border-0`}>
                                {STATUS_LABELS[profile.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">{getAge(profile)}세 · {profile.job}</p>
                          </div>
                        </SheetTitle>
                        {/* 찜하기 버튼 - 헤더에 표시 */}
                        {((type === 'bride' && user?.agency?.role === 'groom') || (type === 'groom' && user?.agency?.role === 'bride')) && (
                          <button
                            onClick={(e) => toggleFavorite(e, profile.id)}
                            className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
                            aria-label={favorites.has(profile.id) ? "찜 해제" : "찜하기"}
                          >
                            <Heart 
                              className={`w-5 h-5 transition-colors ${
                                favorites.has(profile.id) 
                                  ? 'fill-rose-500 text-rose-500' 
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      <SheetDescription className="sr-only">
                        {getProfileDisplayName(profile)} 프로필 상세 정보 및 사진
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                      {/* Image Slider - Full Width */}
                      <div className="relative bg-slate-100 h-[60vh]">
                        <ProfileImageSlider 
                          images={profile.images} 
                          name={getProfileDisplayName(profile)}
                          videoUrl={profile.videoUrl}
                        />
                      </div>

                      {/* Profile Details - Settings Style */}
                      <div className="max-w-2xl mx-auto space-y-4 p-6 pb-20">
                        {/* Basic Info Card */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-rose-600" />
                              <CardTitle>{t('profile.basicInfo')}</CardTitle>
                            </div>
                            <CardDescription>{t('profile.basicInfo')}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {((profile.height && profile.height > 0) || (profile.weight && profile.weight > 0)) && (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">{t('profile.heightWeight')}</span>
                                  </div>
                                  <p className="font-medium">
                                    {profile.height && profile.height > 0 ? `${profile.height}cm` : ''}
                                    {(profile.height && profile.height > 0) && (profile.weight && profile.weight > 0) ? ' / ' : ''}
                                    {profile.weight && profile.weight > 0 ? `${profile.weight}kg` : ''}
                                  </p>
                                </div>
                              </div>
                            )}

                            {(type === 'bride' ? (profile as any).currentAddress : (profile as any).residence) && (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">{t('profile.residence')}</span>
                                  </div>
                                  <p className="font-medium">{type === 'bride' ? (profile as any).currentAddress : (profile as any).residence}</p>
                                </div>
                              </div>
                            )}

                            {profile.job && (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">{t('profile.job')}</span>
                                  </div>
                                  <p className="font-medium">{profile.job}</p>
                                </div>
                              </div>
                            )}

                            {profile.maritalStatus && (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-500">{t('profile.maritalStatus')}</span>
                                  </div>
                                  <p className="font-medium">{profile.maritalStatus}</p>
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
                              <CardTitle>{t('profile.detailedInfo')}</CardTitle>
                            </div>
                            <CardDescription>{t('profile.detailedInfo')}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {profile.type === 'bride' ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-500">학력</span>
                                    </div>
                                    <p className="font-medium">{(profile as BrideProfile).education}</p>
                                  </div>
                                </div>

                                {(profile as BrideProfile).family && (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">{t('profile.family')}</span>
                                      </div>
                                      <p className="font-medium">{(profile as BrideProfile).family}</p>
                                    </div>
                                  </div>
                                )}

                                {((profile as BrideProfile).fatherAge || (profile as BrideProfile).motherAge) && (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">{t('profile.parentsAge')}</span>
                                      </div>
                                      <p className="font-medium">
                                        {[(profile as BrideProfile).fatherAge && `아빠 ${(profile as BrideProfile).fatherAge}세`, 
                                          (profile as BrideProfile).motherAge && `엄마 ${(profile as BrideProfile).motherAge}세`]
                                          .filter(Boolean).join(', ')}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {(profile as BrideProfile).parentsPhone && (
                                  <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-slate-400" />
                                          <span className="text-sm text-slate-500">{t('profile.parentsPhone')}</span>
                                        </div>
                                        <p className="font-medium">{(profile as BrideProfile).parentsPhone}</p>
                                      </div>
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
                                    <p className="font-medium">{(profile as GroomProfile).education}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-500">{t('profile.income')}</span>
                                    </div>
                                    <p className="font-medium">{(profile as GroomProfile).income}</p>
                                  </div>
                                </div>


                                <div className="pt-3 border-t grid grid-cols-2 gap-4">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <Wine className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-500">{t('profile.drinking')}</span>
                                    </div>
                                    <p className="font-medium">{(profile as GroomProfile).drinking}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <Cigarette className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm text-slate-500">{t('profile.smoking')}</span>
                                    </div>
                                    <p className="font-medium">{(profile as GroomProfile).smoking}</p>
                                  </div>
                                </div>

                                {(profile as GroomProfile).religion && (
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <Church className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">{t('profile.religion')}</span>
                                      </div>
                                      <p className="font-medium">{(profile as GroomProfile).religion}</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Memo Card if exists */}
                        {profile.memo && (
                          <Card>
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <FileEdit className="w-5 h-5 text-rose-600" />
                                <CardTitle>{t('profile.memo')}</CardTitle>
                              </div>
                              <CardDescription>{t('profile.additionalNotes')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{profile.memo}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Filter className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900">{t('profile.noProfiles')}</h3>
              <p className="text-sm text-slate-500 mt-1">{t('profile.noProfilesDesc')}</p>
              <Button variant="link" onClick={() => setFilters(INITIAL_FILTERS)} className="mt-2">
                {t('profile.resetFilters')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 프로필 선택 다이얼로그 */}
      <ProfileSelectDialog
        open={isProfileSelectDialogOpen}
        onOpenChange={setIsProfileSelectDialogOpen}
        onSelect={handleProfileSelect}
        profileType={type}
      />
    </div>
  );
}