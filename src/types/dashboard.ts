export interface Client {
  id: number;
  name: string;
  age?: number; // 계산된 값 (출생년월로부터)
  loc: string;
  status: string;
  date: string;
  type: "groom" | "bride";
  education?: string;
  height?: number; // cm 단위 숫자
  weight?: number; // kg 단위 숫자
  family?: string;
  marriage?: string;
  job?: string;
  tattoo?: string;
  income?: string;
  smoking?: string;
  drinking?: string;
  idealType?: string;
  memo?: string;
  agencyId?: number;
  // 출생 정보
  birthYear: number;
  // 신부 전용 필드
  birthDate?: string; // 호환성을 위해 유지 (deprecated)
  hasMarriedBefore?: boolean;
  exHusbandNationality?: string;
  children?: string;
  addressRegistration?: string;
  currentAddress?: string;
  monthlyIncome?: string;
  siblings?: string;
  relativesOverseas?: string;
  fatherAge?: number;   // 아버지 나이 (신부 전용)
  motherAge?: number;   // 어머니 나이 (신부 전용)
  parentsPhone?: string;
  phone?: string;
  healthIssues?: string;
  desiredDestination?: string;
  guarantee?: boolean;
  // 신랑 전용 필드
  residence?: string;
  hobbies?: string;
  parentalSupport?: string;
  features?: string;
  religion?: string;
  // 미디어
  images?: string[];
  video?: string;
  avatarUrl?: string; // 아바타 이미지 URL
}

export interface Match {
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
  memo?: string;
  startDate?: string;
}

export interface Agency {
  id: number;
  name: string;
  role: "groom" | "bride";
  contact: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: string;
  memo?: string;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: keyof Client;
  direction: SortDirection;
}

export type UserRole = "super_admin" | "platform_admin" | "agency_member";
export type UserStatus = "pending" | "active" | "suspended";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  picture?: string | null; // Google OAuth 프로필 사진 URL
  role: UserRole;
  agencyId?: number;
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
}

export interface YouTubeVideo {
  id: number;
  title: string;
  url: string;
  videoId: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}
