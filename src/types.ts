
export type Language = 'ko' | 'vn' | 'en';

export type ProfileStatus = 'active' | 'matched' | 'consulting' | 'inactive';

export interface BrideProfile {
  id: string;
  type: 'bride';
  status: ProfileStatus;
  name: string;
  birthDate: string;
  height: number; // cm
  weight: number; // kg
  education: string;
  maritalStatus: string;
  hasMarriedBefore: boolean;
  exHusbandNationality?: string;
  children: string;
  job: string;
  addressRegistration: string;
  currentAddress: string;
  monthlyIncome: string;
  family: string;
  tattoo: string;
  siblings: string;
  relativesOverseas: string;
  fatherAge?: string;
  motherAge?: string;
  parentsPhone: string;
  phone: string;
  healthIssues: string;
  desiredDestination: string; // Korea/Taiwan
  guarantee: boolean;
  images: string[];
  videoUrl?: string;
  avatarUrl?: string;
}

export interface GroomProfile {
  id: string;
  type: 'groom';
  status: ProfileStatus;
  name: string;
  residence: string;
  birthYear: number;
  education: string;
  height: number; // cm
  weight: number; // kg
  maritalStatus: string;
  job: string;
  income: string;
  family: string;
  hobbies: string;
  parentalSupport: string;
  drinking: string;
  smoking: string;
  tattoo: string;
  features: string;
  religion: string;
  idealType: string[];
  images: string[];
  videoUrl?: string;
  avatarUrl?: string;
}

export type Profile = BrideProfile | GroomProfile;
