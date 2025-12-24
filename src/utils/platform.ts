import { Capacitor } from '@capacitor/core';

/**
 * Capacitor 환경인지 확인
 */
export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && window.Capacitor !== undefined;
};

/**
 * 네이티브 플랫폼(Android/iOS)인지 확인
 */
export const isNativePlatform = (): boolean => {
  try {
    return isCapacitor() && Capacitor.isNativePlatform();
  } catch (error) {
    // 웹 환경에서 Capacitor가 초기화되지 않은 경우 false 반환
    return false;
  }
};

/**
 * 현재 플랫폼 타입 반환
 */
export const getPlatform = (): 'web' | 'android' | 'ios' => {
  if (!isCapacitor()) return 'web';
  return Capacitor.getPlatform() as 'android' | 'ios';
};

/**
 * 웹 환경인지 확인
 */
export const isWeb = (): boolean => {
  return !isCapacitor();
};

/**
 * 안드로이드 환경인지 확인
 */
export const isAndroid = (): boolean => {
  return getPlatform() === 'android';
};

/**
 * iOS 환경인지 확인
 */
export const isIOS = (): boolean => {
  return getPlatform() === 'ios';
};

