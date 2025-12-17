
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ChevronLeft, MessageCircle, Share2, Calendar, Ruler, 
  Briefcase, MapPin, Heart, User, Users, DollarSign, 
  Info, Phone, Globe, GraduationCap 
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProfileImageSlider } from '../components/ProfileImageSlider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { BrideProfile, GroomProfile } from '../types';
import { fetchClient, fetchFavorites, addFavorite, removeFavorite } from '../utils/api';
import { mapClientToBrideProfile, mapClientToGroomProfile } from '../utils/dashboard/profileUtils';
import { getProfileDisplayName } from '../utils/profileUtils';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';
import { ProfileSelectDialog } from '../components/ProfileSelectDialog';

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);
  const [profile, setProfile] = useState<BrideProfile | GroomProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] = useState(false);
  const [pendingFavoriteClientId, setPendingFavoriteClientId] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setError('프로필 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const clientId = parseInt(id);
        if (isNaN(clientId)) {
          throw new Error('유효하지 않은 프로필 ID입니다.');
        }

        const client = await fetchClient(clientId);
        const mappedProfile = client.type === 'bride' 
          ? mapClientToBrideProfile(client)
          : mapClientToGroomProfile(client);
        
        setProfile(mappedProfile);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '프로필을 불러오는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  // 찜 목록 로드 및 상태 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !user || !id || !user.agencyId) {
        return;
      }

      try {
        const favorites = await fetchFavorites();
        const clientId = parseInt(id);
        const isFav = favorites.some(fav => fav.clientId === clientId);
        setIsFavorite(isFav);
      } catch (err) {
        // 찜 목록 로드 실패는 치명적이지 않으므로 에러 토스트만 표시하지 않음
        console.error('Failed to load favorites:', err);
      }
    };

    checkFavoriteStatus();
  }, [id, isAuthenticated, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // 소속사 회원인지 확인
    if (!user.agencyId || !user.agency) {
      toast.error('소속사 회원만 찜하기 기능을 사용할 수 있습니다.');
      return;
    }

    if (!id) {
      return;
    }

    const clientId = parseInt(id);
    if (isNaN(clientId)) {
      console.error('Invalid profile ID:', id);
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        // 이미 찜한 경우 바로 제거
        await removeFavorite(clientId);
        setIsFavorite(false);
        toast.success('찜 목록에서 제거되었습니다.');
        setFavoriteLoading(false);
      } else {
        // 찜하기 전에 프로필 선택 다이얼로그 표시
        setFavoriteLoading(false);
        setPendingFavoriteClientId(clientId);
        setIsProfileSelectDialogOpen(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜하기 작업에 실패했습니다.';
      toast.error(errorMessage);
      console.error('Failed to toggle favorite:', err);
      setFavoriteLoading(false);
    }
  };

  const handleProfileSelect = async (fromClientId: number) => {
    if (pendingFavoriteClientId === null) return;

    setFavoriteLoading(true);
    try {
      await addFavorite(pendingFavoriteClientId, fromClientId);
      setIsFavorite(true);
      toast.success('찜 목록에 추가되었습니다.');
      setPendingFavoriteClientId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜하기 작업에 실패했습니다.';
      toast.error(errorMessage);
      console.error('Failed to add favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="p-8 text-center">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">프로필을 찾을 수 없습니다</h2>
          <p className="text-slate-500 mb-4">{error || '요청하신 프로필이 존재하지 않습니다.'}</p>
          <Button onClick={() => navigate(-1)}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const isBride = profile.type === 'bride';
  const age = isBride 
    ? new Date().getFullYear() - parseInt((profile as BrideProfile).birthDate.split('-')[0])
    : new Date().getFullYear() - (profile as GroomProfile).birthYear;

  const DetailRow = ({ icon: Icon, label, value, fullWidth = false }: any) => {
    // 값이 없으면 렌더링하지 않음
    if (!value || value === '-' || value === '' || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }
    
    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-2' : ''}`}>
        <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-semibold tracking-wider">
          {Icon && <Icon className="w-3 h-3" />}
          <span>{label}</span>
        </div>
        <div className="font-medium text-slate-900 text-sm md:text-base whitespace-pre-wrap">
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{getProfileDisplayName(profile)}</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>{age} years old</span>
            <span>•</span>
            <span>{isBride ? (profile as BrideProfile).currentAddress : (profile as GroomProfile).residence}</span>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Media & Quick Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
            <div className="aspect-[3/4] relative">
              {profile.images.length > 1 || profile.videoUrl ? (
                <ProfileImageSlider 
                  images={profile.images} 
                  name={getProfileDisplayName(profile)}
                  videoUrl={profile.videoUrl}
                />
              ) : (
                profile.videoUrl ? (
                  <video
                    src={profile.videoUrl}
                    controls
                    className="object-contain object-center w-full h-full bg-slate-900"
                  />
                ) : (
                  <ImageWithFallback 
                    src={profile.images[0]} 
                    alt={getProfileDisplayName(profile)} 
                    className="object-cover w-full h-full"
                  />
                )
              )}
            </div>
            {/* 찜하기 버튼 - 프로필 사진 위에 오버레이 */}
            {/* #region agent log */}
            {(() => {
              const shouldShow = (profile.type === 'bride' && user?.agency?.role === 'groom') || (profile.type === 'groom' && user?.agency?.role === 'bride');
              fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileDetail.tsx:favoriteButton',message:'Favorite button visibility check',data:{profileType:profile.type,userAgencyRole:user?.agency?.role,shouldShow,profileId:profile.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              return shouldShow;
            })() && (
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="absolute bottom-3 right-3 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                aria-label={isFavorite ? "찜 해제" : "찜하기"}
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    isFavorite 
                      ? 'fill-rose-500 text-rose-500' 
                      : 'text-slate-700'
                  }`}
                />
              </button>
            )}
            {/* #endregion */}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="details">Detailed Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardContent className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                  <DetailRow icon={Calendar} label={t('label.dob')} value={isBride ? (profile as BrideProfile).birthDate : (profile as GroomProfile).birthYear} />
                  <DetailRow icon={User} label={t('label.maritalStatus')} value={profile.maritalStatus} />
                  
                  <DetailRow icon={Ruler} label={t('label.height')} value={`${profile.height} cm`} />
                  <DetailRow icon={Ruler} label={t('label.weight')} value={`${profile.weight} kg`} />
                  
                  <DetailRow icon={GraduationCap} label={t('label.education')} value={profile.education} fullWidth />
                  <DetailRow icon={Briefcase} label={t('label.job')} value={profile.job} fullWidth />
                  
                  {!isBride && <DetailRow icon={DollarSign} label={t('label.income')} value={(profile as GroomProfile).income} />}
                  <DetailRow icon={Globe} label={t('label.religion')} value={isBride ? 'Unknown' : (profile as GroomProfile).religion} />
                  
                  <DetailRow icon={MapPin} label={t('label.address')} value={isBride ? (profile as BrideProfile).currentAddress : (profile as GroomProfile).residence} fullWidth />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                   <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-500" />
                    Other Information
                   </h3>
                   <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <DetailRow label={t('label.tattoo')} value={profile.tattoo} />
                      {isBride ? (
                         <>
                            <DetailRow label="Health" value={(profile as BrideProfile).healthIssues} />
                         </>
                      ) : (
                         <>
                            <DetailRow label="Drinking" value={(profile as GroomProfile).drinking} />
                            <DetailRow label="Smoking" value={(profile as GroomProfile).smoking} />
                         </>
                      )}
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {isBride ? (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="font-bold text-lg">Family Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailRow icon={Users} label="Family Structure" value={(profile as BrideProfile).family} fullWidth />
                      <DetailRow icon={Users} label="Father Age" value={(profile as BrideProfile).fatherAge ? `${(profile as BrideProfile).fatherAge}세` : ''} />
                      <DetailRow icon={Users} label="Mother Age" value={(profile as BrideProfile).motherAge ? `${(profile as BrideProfile).motherAge}세` : ''} />
                      <DetailRow icon={Phone} label="Parents Contact" value={(profile as BrideProfile).parentsPhone} />
                      <DetailRow icon={Globe} label="Relatives Overseas" value={(profile as BrideProfile).relativesOverseas} />
                    </div>
                    
                    <div className="h-px bg-slate-100 my-4" />
                    
                    <h3 className="font-bold text-lg">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailRow icon={Globe} label="Desired Country" value={(profile as BrideProfile).desiredDestination} />
                      <DetailRow icon={Heart} label="Previous Marriage" value={(profile as BrideProfile).hasMarriedBefore ? `Yes (${(profile as BrideProfile).exHusbandNationality})` : 'No'} />
                      <DetailRow icon={Users} label="Children" value={(profile as BrideProfile).children} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="font-bold text-lg">Lifestyle & Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailRow icon={Users} label="Family Structure" value={(profile as GroomProfile).family} />
                      <DetailRow icon={Users} label="Parental Support" value={(profile as GroomProfile).parentalSupport} />
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    <h3 className="font-bold text-lg">Ideal Match</h3>
                    <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                       <ul className="space-y-2">
                          {(profile as GroomProfile).idealType.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                              <Heart className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request Meeting</DialogTitle>
                <DialogDescription>
                    Would you like to request a meeting with {getProfileDisplayName(profile)}? We will notify them of your interest.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="text-sm text-slate-500 mb-2">Please confirm your contact details:</p>
                <div className="p-3 bg-slate-50 rounded-md text-sm border">
                    User: Guest User<br/>
                    Email: guest@example.com
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
                <Button onClick={() => setContactOpen(false)}>Send Request</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 프로필 선택 다이얼로그 */}
      {profile && (
        <ProfileSelectDialog
          open={isProfileSelectDialogOpen}
          onOpenChange={setIsProfileSelectDialogOpen}
          onSelect={handleProfileSelect}
          profileType={profile.type}
        />
      )}
    </div>
  );
}
