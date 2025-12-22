import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Home, UserCircle, Menu, Globe, LogIn, MessageSquare, Video, LayoutDashboard, Youtube, MessageCircle, Users, LogOut, User, Star } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import ApprovalPendingModal from './ApprovalPendingModal';
import ServicePendingModal from './ServicePendingModal';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export default function Layout() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [servicePendingModalOpen, setServicePendingModalOpen] = useState(false);

  // Open login sheet when redirected from ProtectedRoute
  React.useEffect(() => {
    if (!isAuthenticated && location.pathname === '/' && location.state?.fromProtectedRoute) {
      setLoginSheetOpen(true);
    }
  }, [isAuthenticated, location.pathname, location.state]);

  // 로그아웃 상태에서 홈이 아닌 페이지에 접근 시 홈으로 리다이렉트하고 로그인 Sheet 열기
  React.useEffect(() => {
    // 로딩이 완료되고 인증되지 않은 상태이며, 현재 경로가 홈이 아닐 때
    // (ProtectedRoute가 아닌 일반 라우트인 경우)
    if (!isLoading && !isAuthenticated && location.pathname !== '/' && 
        !location.pathname.startsWith('/auth/')) {
      // 홈으로 리다이렉트하고 로그인 Sheet 열기
      navigate('/', { replace: true, state: { fromProtectedRoute: true } });
      setLoginSheetOpen(true);
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  const isActive = (path: string) => location.pathname.startsWith(path);
  // Exact match for home
  const isHomeActive = location.pathname === '/';

  // Handle navigation clicks for unauthenticated users or pending approval users
  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated && path !== '/') {
      e.preventDefault();
      setLoginSheetOpen(true);
      return;
    }

    // 승인 대기 중인 사용자 (슈퍼관리자, 플랫폼관리자 제외)
    if (
      isAuthenticated &&
      user &&
      user.status !== 'active' &&
      user.role !== 'super_admin' &&
      user.role !== 'platform_admin' &&
      path !== '/'
    ) {
      e.preventDefault();
      setApprovalModalOpen(true);
    }
  };

  // Handle messages click - only allow admins
  const handleMessagesClick = (e: React.MouseEvent) => {
    // 관리자가 아닌 경우 모달 표시
    if (
      !isAuthenticated ||
      !user ||
      (user.role !== 'super_admin' && user.role !== 'platform_admin')
    ) {
      e.preventDefault();
      setServicePendingModalOpen(true);
    }
  };

  // 승인 대기 중인 사용자가 다른 페이지 접근 시도 시 모달 표시
  React.useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      user.status !== 'active' &&
      user.role !== 'super_admin' &&
      user.role !== 'platform_admin' &&
      location.pathname !== '/'
    ) {
      setApprovalModalOpen(true);
    }

    // ProtectedRoute에서 리디렉션 시 모달 표시
    if (location.state?.showApprovalModal) {
      setApprovalModalOpen(true);
      // state 초기화
      window.history.replaceState({}, '', location.pathname);
    }
  }, [isAuthenticated, user, location.pathname, location.state]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation (Desktop) */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white px-2.5 py-1.5 rounded-lg shadow-md flex items-center justify-center">
              <span className="font-black text-lg tracking-tighter leading-none">GG</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline">GGFinder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium ${isHomeActive ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}>
              {t('nav.home')}
            </Link>
            {isAuthenticated ? (
              // 승인된 사용자 또는 관리자만 링크 표시 (소속사 회원은 관리 메뉴 제외)
              user.status === 'active' || user.role === 'super_admin' || user.role === 'platform_admin' ? (
                <>
                  <Link to="/profiles" className={`text-sm font-medium ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}>
                    {t('nav.profiles')}
                  </Link>
                  {(user.agency?.role === 'bride' || user.agency?.role === 'groom') && (
                    <Link to="/received-favorites" className={`text-sm font-medium flex items-center gap-1 ${isActive('/received-favorites') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}>
                      <Star className="w-4 h-4" />
                      {t('nav.receivedFavorites')}
                    </Link>
                  )}
                  {user.role !== 'agency_member' && (
                    <Link to="/dashboard" className={`text-sm font-medium flex items-center gap-1 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}>
                      <LayoutDashboard className="w-4 h-4" />
                      {t('nav.dashboard')}
                    </Link>
                  )}
                </>
              ) : (
                // 승인 대기 중인 사용자는 버튼으로 표시 (클릭 시 모달)
                <>
                  <button
                    onClick={(e) => handleNavClick(e, '/profiles')}
                    className={`text-sm font-medium ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}
                  >
                    {t('nav.profiles')}
                  </button>
                  <button
                    onClick={(e) => handleNavClick(e, '/dashboard')}
                    className={`text-sm font-medium flex items-center gap-1 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  onClick={(e) => handleNavClick(e, '/profiles')}
                  className={`text-sm font-medium ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}
                >
                  {t('nav.profiles')}
                </button>
                <button
                  onClick={(e) => handleNavClick(e, '/dashboard')}
                  className={`text-sm font-medium flex items-center gap-1 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('nav.dashboard')}
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && (user.status === 'active' || user.role === 'super_admin' || user.role === 'platform_admin') && (
              <div className="hidden md:flex gap-2 mr-2 border-r border-slate-200 pr-4">
                {user.role === 'super_admin' && (
                  <Button variant="ghost" size="icon" asChild className="text-slate-500">
                    <Link to="/messages">
                      <MessageCircle className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage('ko')}
                  className={language === 'ko' ? 'bg-slate-100' : ''}
                >
                  🇰🇷 한국어
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('vn')}
                  className={language === 'vn' ? 'bg-slate-100' : ''}
                >
                  🇻🇳 Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-slate-100' : ''}
                >
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-100">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.picture || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-semibold text-sm">
                        {user?.name?.slice(0, 1) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-medium text-slate-700">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="font-medium text-sm text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileSheetOpen(true)} className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-rose-600 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Sheet open={loginSheetOpen} onOpenChange={setLoginSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="default" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                    <LogIn className="w-4 h-4" />
                    {t('nav.login')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0" style={{ height: '80vh', maxHeight: '80vh' }}>
                  <SheetHeader className="sr-only flex-shrink-0">
                    <SheetTitle>로그인</SheetTitle>
                    <SheetDescription>GGFinder에 로그인하세요</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    <Login onSuccess={() => setLoginSheetOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 md:mb-0">
        <Outlet />
      </main>

      {/* Profile Sheet */}
      <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0" style={{ height: '80vh', maxHeight: '80vh' }}>
          <SheetHeader className="sr-only flex-shrink-0">
            <SheetTitle>프로필</SheetTitle>
            <SheetDescription>내 프로필 정보를 확인하세요</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <Profile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Approval Pending Modal */}
      <ApprovalPendingModal open={approvalModalOpen} onOpenChange={setApprovalModalOpen} />

      {/* Service Pending Modal */}
      <ServicePendingModal open={servicePendingModalOpen} onOpenChange={setServicePendingModalOpen} />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe">
        <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${isHomeActive ? 'text-rose-600' : 'text-slate-400'}`}>
          <Youtube className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </Link>
        {isAuthenticated ? (
          // 승인된 사용자 또는 관리자만 링크 표시 (소속사 회원은 관리 메뉴 제외)
          user.status === 'active' || user.role === 'super_admin' || user.role === 'platform_admin' ? (
            <>
              <Link to="/profiles" className={`flex flex-col items-center gap-1 p-2 ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-400'}`}>
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t('nav.profiles')}</span>
              </Link>
              {(user.agency?.role === 'bride' || user.agency?.role === 'groom') && (
                <Link to="/received-favorites" className={`flex flex-col items-center gap-1 p-2 ${isActive('/received-favorites') ? 'text-rose-600' : 'text-slate-400'}`}>
                  <Star className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t('nav.receivedFavorites')}</span>
                </Link>
              )}
              {user.role !== 'agency_member' && (
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 p-2 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-400'}`}>
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t('nav.dashboard')}</span>
                </Link>
              )}
              {user.role === 'super_admin' && (
                <Link to="/messages" className={`flex flex-col items-center gap-1 p-2 ${isActive('/messages') ? 'text-rose-600' : 'text-slate-400'}`}>
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t('nav.messages')}</span>
                </Link>
              )}
            </>
          ) : (
            // 승인 대기 중인 사용자는 버튼으로 표시 (클릭 시 모달)
            <>
              <button
                onClick={(e) => handleNavClick(e, '/profiles')}
                className={`flex flex-col items-center gap-1 p-2 ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-400'}`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t('nav.profiles')}</span>
              </button>
              <button
                onClick={(e) => handleNavClick(e, '/dashboard')}
                className={`flex flex-col items-center gap-1 p-2 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-400'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t('nav.dashboard')}</span>
              </button>
            </>
          )
        ) : (
          <>
            <button
              onClick={(e) => handleNavClick(e, '/profiles')}
              className={`flex flex-col items-center gap-1 p-2 ${isActive('/profiles') || isActive('/brides') || isActive('/grooms') ? 'text-rose-600' : 'text-slate-400'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t('nav.profiles')}</span>
            </button>
            <button
              onClick={(e) => handleNavClick(e, '/dashboard')}
              className={`flex flex-col items-center gap-1 p-2 ${isActive('/dashboard') ? 'text-rose-600' : 'text-slate-400'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t('nav.dashboard')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}