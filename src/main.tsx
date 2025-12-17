import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const currentOrigin = window.location.origin;
const currentHost = window.location.host;
const currentProtocol = window.location.protocol;

// #region agent log
// COOP 정책 확인
const coopHeader = document.querySelector('meta[http-equiv="Cross-Origin-Opener-Policy"]');
const coopResponseHeader = 'NOT_CHECKED'; // 브라우저에서만 확인 가능

// 브라우저 환경 감지
const isElectron = typeof window !== 'undefined' && window.process && window.process.type;
const isCursorBrowser = navigator.userAgent.includes('Electron') || navigator.userAgent.includes('Cursor');
const userAgent = navigator.userAgent;
const isInFrame = window.self !== window.top;
const hasOpener = window.opener !== null;

// 브라우저 환경 상세 정보
const browserInfo = {
  userAgent: userAgent,
  isElectron: isElectron,
  isCursorBrowser: isCursorBrowser,
  isInFrame: isInFrame,
  hasOpener: hasOpener,
  windowOpener: window.opener ? 'EXISTS' : 'NULL',
  windowParent: window.parent !== window ? 'DIFFERENT' : 'SAME',
  windowTop: window.top !== window ? 'DIFFERENT' : 'SAME',
  windowSelf: window.self === window ? 'SAME' : 'DIFFERENT',
};

console.log('[DEBUG] Browser Environment Detection:', browserInfo);

console.log('[DEBUG] Google OAuth Configuration:', {
  clientId: googleClientId ? `${googleClientId.substring(0, 20)}...` : 'NOT SET',
  origin: currentOrigin,
  host: currentHost,
  protocol: currentProtocol,
  fullUrl: window.location.href,
  coopMetaTag: coopHeader ? coopHeader.getAttribute('content') : 'NOT SET',
  windowOpener: window.opener ? 'EXISTS' : 'NULL',
  browserInfo: browserInfo,
});

// Google OAuth가 사용할 origin 확인
console.log('[DEBUG] Origin to register in Google Cloud Console:');
console.log('  ✅ Add this EXACT origin:', currentOrigin);
console.log('  ⚠️  Also try if above doesn\'t work:', `http://127.0.0.1:4001`);
console.log('  📝 Google Cloud Console URL: https://console.cloud.google.com/apis/credentials');
console.log('  ⚠️  IMPORTANT: Make sure the origin is EXACTLY:', currentOrigin);
console.log('  ⚠️  "Cannot read properties of null (reading postMessage)" 에러는');
console.log('      Google Cloud Console에 origin이 등록되지 않아서 발생할 수 있습니다.');
console.log('  🔍 Cursor 내장 브라우저 감지:', isCursorBrowser ? 'YES' : 'NO');
console.log('  🔍 Electron 환경 감지:', isElectron ? 'YES' : 'NO');
console.log('  🔍 iframe 내부:', isInFrame ? 'YES' : 'NO');
// #endregion

if (!googleClientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables");
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId || ""}>
    <App />
  </GoogleOAuthProvider>
);
  