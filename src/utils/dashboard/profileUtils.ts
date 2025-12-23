import { Client } from '../../types/dashboard';
import { BrideProfile, GroomProfile, ProfileStatus } from '../../types';

/**
 * DB ClientStatus를 ProfileStatus로 변환
 */
function mapClientStatusToProfileStatus(status: string): ProfileStatus {
  const statusMap: Record<string, ProfileStatus> = {
    '등록 완료': 'active',
    '매칭 중': 'consulting',
    '만남 예정': 'active',
    '서류 준비': 'active',
    '대기 중': 'inactive',
    '진행 중': 'matched',
  };
  return statusMap[status] || 'active';
}

/**
 * 출생년월로부터 나이 계산
 */
function calculateAge(birthYear: number, birthMonth?: number | null): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  let age = currentYear - birthYear;
  
  // 생일이 아직 지나지 않았으면 1살 빼기
  if (birthMonth !== null && birthMonth !== undefined) {
    if (currentMonth < birthMonth || (currentMonth === birthMonth && now.getDate() < 1)) {
      age--;
    }
  }
  
  return age;
}

/**
 * idealType 문자열을 배열로 변환
 */
function parseIdealType(idealType: string | undefined): string[] {
  if (!idealType) return [];
  // 줄바꿈 또는 쉼표로 분리
  return idealType
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}


/**
 * Client 타입을 BrideProfile 타입으로 변환
 */
export function mapClientToBrideProfile(client: Client & any): BrideProfile {
  // birthDate는 호환성을 위해 유지하되, birthYear로부터 생성
  const birthYear = client.birthYear || 0;
  const birthDate = client.birthDate || (birthYear ? `${birthYear}-01-01` : '');
  
  const result = {
    id: client.id.toString(),
    type: 'bride',
    status: mapClientStatusToProfileStatus(client.status),
    name: client.name,
    birthDate: birthDate,
    height: typeof client.height === 'number' ? client.height : (client.height ? parseInt(String(client.height).replace(/[^0-9]/g, '')) : 0),
    weight: typeof client.weight === 'number' ? client.weight : (client.weight ? parseInt(String(client.weight).replace(/[^0-9]/g, '')) : 0),
    education: client.education || '',
    maritalStatus: client.marriage || '미혼',
    hasMarriedBefore: client.hasMarriedBefore || false,
    exHusbandNationality: client.exHusbandNationality,
    children: client.children || '',
    job: client.job || '',
    addressRegistration: client.addressRegistration || '',
    currentAddress: client.currentAddress || client.loc || '',
    monthlyIncome: client.monthlyIncome || client.income || '',
    family: client.family || '',
    tattoo: client.tattoo || '없음',
    siblings: client.siblings || '',
    relativesOverseas: client.relativesOverseas || '',
    fatherAge: client.fatherAge !== null && client.fatherAge !== undefined ? String(client.fatherAge) : '',
    motherAge: client.motherAge !== null && client.motherAge !== undefined ? String(client.motherAge) : '',
    parentsPhone: client.parentsPhone || '',
    phone: client.phone || '',
    healthIssues: client.healthIssues || '',
    desiredDestination: client.desiredDestination || '',
    guarantee: client.guarantee || false,
    images: Array.isArray(client.images) 
      ? client.images.map((img: any) => typeof img === 'string' ? img : img.url || img)
      : [],
    videoUrl: client.video,
    avatarUrl: client.avatarUrl,
  };
  
  return result;
}

/**
 * Client 타입을 GroomProfile 타입으로 변환
 */
export function mapClientToGroomProfile(client: Client & any): GroomProfile {
  const result = {
    id: client.id.toString(),
    type: 'groom',
    status: mapClientStatusToProfileStatus(client.status),
    name: client.name,
    residence: client.residence || client.loc || '',
    birthYear: client.birthYear || (client.age ? new Date().getFullYear() - client.age : 0),
    education: client.education || '',
    height: typeof client.height === 'number' ? client.height : (client.height ? parseInt(String(client.height).replace(/[^0-9]/g, '')) : 0),
    weight: typeof client.weight === 'number' ? client.weight : (client.weight ? parseInt(String(client.weight).replace(/[^0-9]/g, '')) : 0),
    maritalStatus: client.marriage || '미혼',
    job: client.job || '',
    income: client.income || '',
    family: client.family || '',
    hobbies: client.hobbies || '',
    parentalSupport: client.parentalSupport || '',
    drinking: client.drinking || '',
    smoking: client.smoking || '',
    tattoo: client.tattoo || '없음',
    features: client.features || '',
    religion: client.religion || '',
    idealType: parseIdealType(client.idealType),
    images: Array.isArray(client.images) 
      ? client.images.map((img: any) => typeof img === 'string' ? img : img.url || img)
      : [],
    videoUrl: client.video,
    avatarUrl: client.avatarUrl,
  };
  
  return result;
}

