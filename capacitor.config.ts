import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ggacademy.ggfinder',
  appName: 'GGFinder',
  webDir: 'dist',
  server: {
    // 개발 환경에서만 사용 (프로덕션에서는 제거)
    // url: 'http://localhost:4001',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
