import { User, Agency, Client, YouTubeVideo } from '../types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * JWT 토큰의 payload 파싱
 */
function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
}

/**
 * ID Token의 만료 시간 확인 (초 단위 Unix timestamp)
 */
export function getTokenExpiry(token: string): number | null {
  const payload = parseJwtPayload(token);
  return payload?.exp || null;
}

/**
 * 토큰이 만료되었는지 확인
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

/**
 * 토큰이 만료 임박인지 확인 (10분 전)
 */
export function isTokenExpiringSoon(token: string, bufferMinutes: number = 10): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;
  return exp <= now + bufferSeconds;
}

/**
 * Refresh Token으로 새 ID Token 발급
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newIdToken = data.idToken;

    if (newIdToken) {
      // 새 토큰을 localStorage에 저장
      localStorage.setItem('idToken', newIdToken);
      return newIdToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * API 호출 헬퍼 함수
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem('idToken');
  
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }

  // 토큰이 만료 임박(10분 전)이면 자동 갱신
  if (isTokenExpiringSoon(token, 10)) {
    const newToken = await refreshToken();
    if (newToken) {
      token = newToken;
    } else {
      // 갱신 실패 시 401 에러 처리
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // 401 Unauthorized 에러 처리 (토큰 만료)
    if (response.status === 401) {
      // localStorage에서 토큰 제거
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      
      // 전역 이벤트 발생하여 Layout에서 처리하도록 함
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Invalid token' }));
      throw new Error(errorData.error || '인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // 204 No Content 응답은 본문이 없으므로 JSON 파싱을 건너뜀
  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json();
  
  return result;
}

/**
 * 공개 API 호출 헬퍼 함수 (인증 불필요)
 */
async function publicApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  
  return result;
}

/**
 * 사용자 목록 조회
 */
export async function fetchUsers(): Promise<User[]> {
  const data = await apiCall<{ users: User[] }>('/api/users');
  return data.users;
}

/**
 * 특정 사용자 조회
 */
export async function fetchUser(id: number): Promise<User> {
  const data = await apiCall<{ user: User }>(`/api/users/${id}`);
  return data.user;
}

/**
 * 사용자 생성
 */
export async function createUser(userData: Partial<User>): Promise<User> {
  const data = await apiCall<{ user: User }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data.user;
}

/**
 * 사용자 수정
 */
export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  const data = await apiCall<{ user: User }>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
  return data.user;
}

/**
 * 사용자 삭제
 */
export async function deleteUser(id: number): Promise<void> {
  await apiCall(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 소속사 목록 조회
 */
export async function fetchAgencies(): Promise<Agency[]> {
  const data = await apiCall<{ agencies: Agency[] }>('/api/agencies');
  return data.agencies;
}

/**
 * 특정 소속사 조회
 */
export async function fetchAgency(id: number): Promise<Agency> {
  const data = await apiCall<{ agency: Agency }>(`/api/agencies/${id}`);
  return data.agency;
}

/**
 * 소속사 생성
 */
export async function createAgency(agencyData: Partial<Agency>): Promise<Agency> {
  const data = await apiCall<{ agency: Agency }>('/api/agencies', {
    method: 'POST',
    body: JSON.stringify(agencyData),
  });
  return data.agency;
}

/**
 * 소속사 수정
 */
export async function updateAgency(id: number, agencyData: Partial<Agency>): Promise<Agency> {
  const data = await apiCall<{ agency: Agency }>(`/api/agencies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(agencyData),
  });
  return data.agency;
}

/**
 * 소속사 삭제
 */
export async function deleteAgency(id: number): Promise<void> {
  await apiCall(`/api/agencies/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 파일 업로드를 포함한 API 호출 헬퍼 함수
 */
async function apiCallWithFiles<T>(
  endpoint: string,
  formData: FormData,
  method: string = 'POST'
): Promise<T> {
  const token = localStorage.getItem('idToken');
  
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      // FormData를 사용할 때는 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
    },
    body: formData,
  });

  if (!response.ok) {
    // 401 Unauthorized 에러 처리 (토큰 만료)
    if (response.status === 401) {
      // localStorage에서 토큰 제거
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      
      // 전역 이벤트 발생하여 Layout에서 처리하도록 함
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Invalid token' }));
      throw new Error(errorData.error || '인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 클라이언트 목록 조회
 */
export async function fetchClients(type?: 'groom' | 'bride', ownAgency?: boolean): Promise<Client[]> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (ownAgency) params.append('ownAgency', 'true');
  const queryParam = params.toString() ? `?${params.toString()}` : '';
  const data = await apiCall<{ clients: Client[] }>(`/api/clients${queryParam}`);
  return data.clients;
}

/**
 * 특정 클라이언트 조회
 */
export async function fetchClient(id: number): Promise<Client> {
  const data = await apiCall<{ client: Client }>(`/api/clients/${id}`);
  return data.client;
}

/**
 * 클라이언트 생성
 */
export async function createClient(
  clientData: Partial<Client>,
  images: File[] = [],
  video: File | null = null,
  avatar: File | null = null
): Promise<Client> {
  const formData = new FormData();

  // 클라이언트 데이터를 FormData에 추가
  Object.keys(clientData).forEach((key) => {
    const value = clientData[key as keyof Client];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // 이미지 파일 추가
  images.forEach((image) => {
    formData.append('images', image);
  });

  // 비디오 파일 추가
  if (video) {
    formData.append('video', video);
  }

  // 아바타 파일 추가
  if (avatar) {
    formData.append('avatar', avatar);
  }

  const data = await apiCallWithFiles<{ client: Client }>('/api/clients', formData, 'POST');
  return data.client;
}

/**
 * 클라이언트 수정
 */
export async function updateClient(
  id: number,
  clientData: Partial<Client>,
  images: File[] = [],
  video: File | null = null,
  avatar: File | null = null
): Promise<Client> {
  const formData = new FormData();

  // 클라이언트 데이터를 JSON 문자열로 추가
  Object.keys(clientData).forEach((key) => {
    const value = clientData[key as keyof Client];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // 이미지 파일 추가
  images.forEach((image) => {
    formData.append('images', image);
  });

  // 비디오 파일 추가
  if (video) {
    formData.append('video', video);
  }

  // 아바타 파일 추가
  if (avatar) {
    formData.append('avatar', avatar);
  }

  const data = await apiCallWithFiles<{ client: Client }>(`/api/clients/${id}`, formData, 'PATCH');
  return data.client;
}

/**
 * 클라이언트 삭제
 */
export async function deleteClient(id: number): Promise<void> {
  await apiCall(`/api/clients/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 클라이언트 상태 업데이트
 */
export async function updateClientStatus(id: number, status: string): Promise<Client> {
  const data = await apiCall<{ client: Client }>(`/api/clients/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.client;
}

/**
 * 클라이언트 이미지 순서 변경 (대표 이미지 설정)
 */
export async function updateClientImageOrder(clientId: number, imageId: number): Promise<Client> {
  const data = await apiCall<{ client: Client }>(`/api/clients/${clientId}/image-order`, {
    method: 'PATCH',
    body: JSON.stringify({ imageId }),
  });
  return data.client;
}

/**
 * 찜 목록 조회
 */
export async function fetchFavorites(): Promise<{ id: number; clientId: number; createdAt: string; client: Client }[]> {
  const data = await apiCall<{ favorites: { id: number; clientId: number; createdAt: string; client: Client }[] }>('/api/favorites');
  return data.favorites;
}

/**
 * 찜하기 추가
 */
export async function addFavorite(clientId: number, fromClientId: number): Promise<{ id: number; clientId: number; createdAt: string; client: Client }> {
  const data = await apiCall<{ favorite: { id: number; clientId: number; createdAt: string; client: Client } }>('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ clientId, fromClientId }),
  });
  return data.favorite;
}

/**
 * 찜하기 제거
 */
export async function removeFavorite(clientId: number): Promise<void> {
  await apiCall(`/api/favorites/${clientId}`, {
    method: 'DELETE',
  });
}

/**
 * 찜 여부 확인
 */
export async function checkFavorite(clientId: number): Promise<{ isFavorite: boolean; favoriteId: number | null }> {
  const data = await apiCall<{ isFavorite: boolean; favoriteId: number | null }>(`/api/favorites/check/${clientId}`);
  return data;
}

/**
 * 특정 신부를 찜한 신랑 목록 조회
 */
export async function fetchReceivedFavorites(brideClientId: number): Promise<{
  favorites: Array<{
    id: number;
    clientId: number;
    userId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
    user: any;
    client: Client;
  }>;
}> {
  const data = await apiCall<{
    favorites: Array<{
      id: number;
      clientId: number;
      userId: number;
      status: 'pending' | 'accepted' | 'rejected';
      createdAt: string;
      updatedAt: string;
      user: any;
      client: Client;
    }>;
  }>(`/api/favorites/received/${brideClientId}`);
  return data;
}

/**
 * 소속사별 찜받은 목록 조회
 */
export async function fetchReceivedFavoritesByAgency(): Promise<{
  profiles: Array<{
    profile: {
      id: number;
      name: string;
      loc: string;
      status: string;
      images: any[];
      video: any;
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
      oppositeProfile?: any;
    }>;
    totalCount: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
  }>;
  agencyRole: 'bride' | 'groom';
}> {
  const data = await apiCall<{
    profiles: Array<{
      profile: {
        id: number;
        name: string;
        loc: string;
        status: string;
        images: any[];
        video: any;
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
        oppositeProfile?: any;
      }>;
      totalCount: number;
      pendingCount: number;
      acceptedCount: number;
      rejectedCount: number;
    }>;
    agencyRole: 'bride' | 'groom';
  }>('/api/favorites/received-by-agency');
  return data;
}

/**
 * 찜 상태 업데이트 (승인/거절)
 */
export async function updateFavoriteStatus(
  favoriteId: number,
  status: 'accepted' | 'rejected'
): Promise<{
  favorite: {
    id: number;
    clientId: number;
    userId: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
    user: any;
    client: Client;
  };
}> {
  const data = await apiCall<{
    favorite: {
      id: number;
      clientId: number;
      userId: number;
      status: 'pending' | 'accepted' | 'rejected';
      createdAt: string;
      updatedAt: string;
      user: any;
      client: Client;
    };
  }>(`/api/favorites/${favoriteId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data;
}

/**
 * 찜 통계 조회
 */
export async function fetchFavoriteStatistics(): Promise<{
  total: {
    all: number;
    groom_to_bride: number;
    bride_to_groom: number;
  };
  byStatus: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  recent: {
    last7Days: number;
    last30Days: number;
  };
  byAgency?: Record<number, {
    name: string;
    count: number;
  }>;
}> {
  const data = await apiCall<{
    total: {
      all: number;
      groom_to_bride: number;
      bride_to_groom: number;
    };
    byStatus: {
      pending: number;
      accepted: number;
      rejected: number;
    };
    recent: {
      last7Days: number;
      last30Days: number;
    };
    byAgency?: Record<number, {
      name: string;
      count: number;
    }>;
  }>('/api/favorites/statistics');
  return data;
}

/**
 * 찜을 통한 매칭 현황 조회
 */
export async function fetchFavoriteMatchesOverview(): Promise<{
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
}> {
  const data = await apiCall<{
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
  }>('/api/favorites/matches-overview');
  return data;
}

/**
 * 매칭 목록 조회
 */
export async function fetchMatches(): Promise<{
  matches: Array<{
    id: number;
    groom: string;
    bride: string;
    groomId: number;
    brideId: number;
    status: string;
    stage: string;
    progress: number;
    nextStep: string;
    date: string;
    startDate?: string;
    memo?: string;
  }>;
}> {
  const data = await apiCall<{
    matches: Array<{
      id: number;
      groom: string;
      bride: string;
      groomId: number;
      brideId: number;
      status: string;
      stage: string;
      progress: number;
      nextStep: string;
      date: string;
      startDate?: string;
      memo?: string;
    }>;
  }>('/api/matches');
  return data;
}

/**
 * 매칭 생성
 */
export async function createMatch(matchData: {
  groomId: number;
  brideId: number;
  stage?: string;
  nextStep?: string;
  startDate?: string;
  memo?: string;
  progress?: number;
}): Promise<{
  match: {
    id: number;
    groom: string;
    bride: string;
    groomId: number;
    brideId: number;
    status: string;
    stage: string;
    progress: number;
    nextStep: string;
    date: string;
    startDate?: string;
    memo?: string;
  };
}> {
  const data = await apiCall<{
    match: {
      id: number;
      groom: string;
      bride: string;
      groomId: number;
      brideId: number;
      status: string;
      stage: string;
      progress: number;
      nextStep: string;
      date: string;
      startDate?: string;
      memo?: string;
    };
  }>('/api/matches', {
    method: 'POST',
    body: JSON.stringify(matchData),
  });
  return data;
}

/**
 * 매칭 수정
 */
export async function updateMatch(
  matchId: number,
  updates: {
    status?: string;
    stage?: string;
    progress?: number;
    nextStep?: string;
    memo?: string;
  }
): Promise<{
  match: {
    id: number;
    groom: string;
    bride: string;
    groomId: number;
    brideId: number;
    status: string;
    stage: string;
    progress: number;
    nextStep: string;
    date: string;
    startDate?: string;
    memo?: string;
  };
}> {
  const data = await apiCall<{
    match: {
      id: number;
      groom: string;
      bride: string;
      groomId: number;
      brideId: number;
      status: string;
      stage: string;
      progress: number;
      nextStep: string;
      date: string;
      startDate?: string;
      memo?: string;
    };
  }>(`/api/matches/${matchId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return data;
}

/**
 * 매칭 삭제
 */
export async function deleteMatch(matchId: number): Promise<{ message: string }> {
  const data = await apiCall<{ message: string }>(`/api/matches/${matchId}`, {
    method: 'DELETE',
  });
  return data;
}

/**
 * 유튜브 동영상 목록 조회 (인증 필요)
 */
export async function fetchYouTubeVideos(status?: 'active' | 'inactive'): Promise<YouTubeVideo[]> {
  const queryParams = status ? `?status=${status}` : '';
  const data = await apiCall<{ videos: YouTubeVideo[] }>(`/api/youtube${queryParams}`);
  return data.videos;
}

/**
 * 공개 유튜브 동영상 목록 조회 (인증 불필요)
 */
export async function fetchPublicYouTubeVideos(): Promise<YouTubeVideo[]> {
  const data = await publicApiCall<{ videos: YouTubeVideo[] }>('/api/youtube/public');
  return data.videos;
}

/**
 * 유튜브 동영상 등록
 */
export async function createYouTubeVideo(
  videoData: Omit<YouTubeVideo, 'id' | 'createdAt'>
): Promise<YouTubeVideo> {
  const data = await apiCall<{ video: YouTubeVideo }>('/api/youtube', {
    method: 'POST',
    body: JSON.stringify(videoData),
  });
  return data.video;
}

/**
 * 유튜브 동영상 수정
 */
export async function updateYouTubeVideo(
  id: number,
  videoData: Partial<Omit<YouTubeVideo, 'id' | 'createdAt'>>
): Promise<YouTubeVideo> {
  const data = await apiCall<{ video: YouTubeVideo }>(`/api/youtube/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(videoData),
  });
  return data.video;
}

/**
 * 유튜브 동영상 삭제
 */
export async function deleteYouTubeVideo(id: number): Promise<void> {
  await apiCall(`/api/youtube/${id}`, {
    method: 'DELETE',
  });
}

