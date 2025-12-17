import { BrideProfile, GroomProfile } from '../types';

/**
 * 프로필을 유니크한 코드 형식으로 표시합니다.
 * 신부: BR-001, 신랑: GR-001 형식
 */
export function getProfileDisplayName(profile: BrideProfile | GroomProfile): string {
  const prefix = profile.type === 'bride' ? 'BR' : 'GR';
  const id = String(profile.id).padStart(3, '0');
  return `${prefix}-${id}`;
}

