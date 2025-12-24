import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Phone,
  Circle,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../components/ui/sheet';
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
import { FullscreenGallery } from '../components/FullscreenGallery';
import { BrideProfile, GroomProfile, Profile, ProfileStatus } from '../types';
import { Client } from '../types/dashboard';
import { fetchClients, fetchFavorites, addFavorite, removeFavorite } from '../utils/api';
import { mapClientToBrideProfile, mapClientToGroomProfile } from '../utils/dashboard/profileUtils';
import { getProfileDisplayName } from '../utils/profileUtils';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';
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
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // 전체 화면 갤러리 상태
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedProfileForGallery, setSelectedProfileForGallery] = useState<Profile | null>(null);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  
  // 스크롤 탑 버튼 상태
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 갤러리 열기 핸들러
  const handleOpenGallery = (profile: Profile, initialIndex: number = 0) => {
    setSelectedProfileForGallery(profile);
    setGalleryInitialIndex(initialIndex);
    setGalleryOpen(true);
  };

  // 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true, state: { fromProtectedRoute: true } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // 화면 크기 감지 (모바일/데스크탑 구분)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const shouldShow = scrollTop > 300; // 300px 이상 스크롤 시 버튼 표시
      setShowScrollTop(shouldShow);
    };

    // 초기 스크롤 위치 확인
    handleScroll();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 스크롤 탑 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 프로필 목록 로드 (필터/정렬 변경 시)
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
      setPage(1);
      setAllProfiles([]);
      setHasMore(true);
      
      try {
        console.log('[ProfileList] Loading profiles with filters:', {
          type,
          filters,
          sortBy,
        });
        
        const result = await fetchClients({
          type,
          page: 1,
          limit: 12,
          filters,
          sortBy,
          sortOrder: 'desc',
        });
        
        console.log('[ProfileList] API Response:', {
          result,
          clientsCount: result?.clients?.length || 0,
          pagination: result?.pagination,
        });
        
        // 응답 형식 확인 및 호환성 처리
        let clients: Client[];
        let pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
        
        if (!result) {
          throw new Error('No response received from server');
        }
        
        // 기존 형식 (pagination 없음) 또는 새 형식 (pagination 있음) 모두 처리
        if (Array.isArray(result)) {
          // 기존 형식: result가 배열인 경우
          clients = result;
          pagination = {
            page: 1,
            limit: result.length,
            total: result.length,
            totalPages: 1,
            hasMore: false,
          };
        } else if (result.clients) {
          // 새 형식: { clients: [...], pagination: {...} }
          clients = result.clients;
          if (result.pagination) {
            pagination = result.pagination;
          } else {
            // pagination이 없는 경우 기본값 설정
            pagination = {
              page: 1,
              limit: clients.length,
              total: clients.length,
              totalPages: 1,
              hasMore: false,
            };
          }
        } else {
          throw new Error('Invalid response format from server');
        }
        
        const mappedProfiles = clients.map((client) => {
          if (type === 'bride') {
            return mapClientToBrideProfile(client);
          } else {
            return mapClientToGroomProfile(client);
          }
        });
        
        setAllProfiles(mappedProfiles);
        setTotal(pagination.total);
        setHasMore(pagination.hasMore);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '프로필 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error('Failed to load profiles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [type, isAuthenticated, authLoading, user, filters, sortBy]);

  // Infinite Scroll: 추가 프로필 로드
  const loadMoreProfiles = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchClients({
        type,
        page: nextPage,
        limit: 12,
        filters,
        sortBy,
        sortOrder: 'desc',
      });
      
      // 응답 형식 확인 및 호환성 처리
      let clients: Client[];
      let pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
      
      if (!result) {
        console.error('No response received');
        setHasMore(false);
        return;
      }
      
      // 기존 형식 (pagination 없음) 또는 새 형식 (pagination 있음) 모두 처리
      if (Array.isArray(result)) {
        // 기존 형식: result가 배열인 경우
        clients = result;
        pagination = {
          page: nextPage,
          limit: clients.length,
          total: clients.length,
          totalPages: 1,
          hasMore: false,
        };
      } else if (result.clients) {
        // 새 형식: { clients: [...], pagination: {...} }
        clients = result.clients;
        if (result.pagination) {
          pagination = result.pagination;
        } else {
          // pagination이 없는 경우 기본값 설정
          pagination = {
            page: nextPage,
            limit: clients.length,
            total: clients.length,
            totalPages: 1,
            hasMore: false,
          };
        }
      } else {
        console.error('Invalid response format:', result);
        setHasMore(false);
        return;
      }
      
      const mappedProfiles = clients.map((client) => {
        if (type === 'bride') {
          return mapClientToBrideProfile(client);
        } else {
          return mapClientToGroomProfile(client);
        }
      });
      
      // 중복 프로필 제거: 기존 프로필 ID와 비교하여 중복되지 않은 프로필만 추가
      setAllProfiles(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProfiles = mappedProfiles.filter(p => !existingIds.has(p.id));
        
        console.log('[Infinite Scroll] 추가 프로필 로드 완료:', {
          page: nextPage,
          loadedProfiles: mappedProfiles.length,
          uniqueProfiles: uniqueNewProfiles.length,
          duplicates: mappedProfiles.length - uniqueNewProfiles.length,
          totalProfiles: prev.length + uniqueNewProfiles.length,
          hasMore: pagination.hasMore,
        });
        
        return [...prev, ...uniqueNewProfiles];
      });
      setPage(nextPage);
      setHasMore(pagination.hasMore);
    } catch (err) {
      console.error('Failed to load more profiles:', err);
      setHasMore(false); // 에러 발생 시 더 이상 로드하지 않음
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer 설정
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('[Infinite Scroll] 감시 요소가 뷰포트에 진입했습니다. 다음 페이지 로드 시작...', {
            currentPage: page,
            nextPage: page + 1,
            hasMore,
            totalProfiles: allProfiles.length,
          });
          loadMoreProfiles();
        }
      },
      { rootMargin: '100px' } // 100px 전에 미리 로드
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, filters, sortBy, allProfiles.length]);

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

  // 찜 필터 적용 (클라이언트 사이드에서만 처리)
  const displayedProfiles = useMemo(() => {
    let profilesToShow = allProfiles;
    
    if (showFavoritesOnly) {
      profilesToShow = allProfiles.filter(profile => favorites.has(profile.id));
    }
    
    return profilesToShow;
  }, [allProfiles, showFavoritesOnly, favorites]);

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
            <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0" style={{ height: '80vh', maxHeight: '80vh' }}>
              <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <SheetTitle>{t('profile.filters.title')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6">
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
            {showFavoritesOnly ? displayedProfiles.length : total}{t('profile.found')}
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
          ) : displayedProfiles.length > 0 ? (
            displayedProfiles.map((profile, index) => {
              const isExpanded = expandedProfileId === profile.id;
              // 고유 키 생성: type과 id를 조합하여 중복 방지
              const uniqueKey = `${type}-${profile.id}-${index}`;
              return (
                <div key={uniqueKey} className="group">
                  <Card className="overflow-visible border-0 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col bg-gradient-to-br from-white to-slate-50/30">
                    {/* Accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    
                    {/* 갤러리 영역 - 항상 표시 */}
                    <div 
                      className="aspect-[3/4] relative overflow-hidden bg-slate-100 cursor-pointer"
                      onClick={() => handleOpenGallery(profile, 0)}
                    >
                      {profile.images.length > 1 || profile.videoUrl ? (
                        <ProfileImageSlider 
                          images={profile.images} 
                          name={getProfileDisplayName(profile)}
                          videoUrl={profile.videoUrl}
                        />
                      ) : (
                        <img 
                          src={profile.images[0]} 
                          alt={getProfileDisplayName(profile)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
                        />
                      )}
                      
                      {/* Age and Status Badges */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-800 border-0 shadow-md">
                          {getAge(profile)}세
                        </Badge>
                        <Badge className={`${STATUS_COLORS[profile.status]} text-white border-0 shadow-md`}>
                          {STATUS_LABELS[profile.status]}
                        </Badge>
                      </div>

                      {/* 찜하기 버튼 - 프로필 목록 카드 사진 위 */}
                      {((type === 'bride' && user?.agency?.role === 'groom') || (type === 'groom' && user?.agency?.role === 'bride')) && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(e, profile.id);
                          }}
                          className="absolute bottom-3 right-3 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
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
                    
                    {/* 기본 정보 - 항상 표시 */}
                    <CardContent className="px-4 pt-4 pb-2 flex-1">
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
                        {profile.tattoo && (
                          <div className="flex items-center gap-2">
                            <Circle className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{t('form.registration.fields.tattoo')}: {profile.tattoo}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    {/* 확장 버튼 */}
                    <CardFooter className="px-4 pb-4 pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => toggleProfile(profile.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            접기
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            상세보기
                          </>
                        )}
                      </Button>
                    </CardFooter>

                    {/* 상세 정보 - 확장 시에만 표시 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4">
                            {/* Basic Info Card */}
                            <Card>
                              <CardHeader>
                                <div className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-rose-600" />
                                  <CardTitle>{t('profile.basicInfo')}</CardTitle>
                                </div>
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
                            {(profile as any).memo && (
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
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{(profile as any).memo}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>
              );
            })
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
          
          {/* Infinite Scroll 감시 요소 */}
          {hasMore && (
            <div 
              ref={sentinelRef} 
              className="col-span-full h-20 flex flex-col items-center justify-center gap-2 py-4"
              style={{ minHeight: '80px' }}
            >
              {isLoadingMore ? (
                <>
                  <div className="text-slate-500 text-sm font-medium">추가 프로필 로딩 중...</div>
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                </>
              ) : (
                <div className="text-slate-400 text-xs">스크롤하여 더 보기</div>
              )}
            </div>
          )}
          
          {/* 더 이상 불러올 데이터가 없을 때 */}
          {!hasMore && allProfiles.length > 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 text-sm">
              모든 프로필을 불러왔습니다. ({allProfiles.length}개)
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

      {/* 전체 화면 갤러리 */}
      {selectedProfileForGallery && (
        <FullscreenGallery
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          images={selectedProfileForGallery.images}
          videoUrl={selectedProfileForGallery.videoUrl}
          initialIndex={galleryInitialIndex}
          name={getProfileDisplayName(selectedProfileForGallery)}
        />
      )}

      {/* 스크롤 탑 버튼 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-20 md:bottom-6 right-4 z-[100] h-12 w-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center hover:scale-110 active:scale-95"
            aria-label="맨 위로 이동"
            style={{ 
              position: 'fixed',
              bottom: isMobile ? '80px' : '24px',
              right: '16px',
              zIndex: 100,
              pointerEvents: 'auto'
            }}
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}