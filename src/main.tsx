import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform } from "./utils/platform";

// 플랫폼별 Google OAuth Client ID 처리
// 모바일 환경에서는 VITE_GOOGLE_CLIENT_ID_MOBILE 사용 가능 (선택사항)
// 없으면 기본 VITE_GOOGLE_CLIENT_ID 사용
const getGoogleClientId = (): string => {
  if (isNativePlatform()) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  }
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
};

const googleClientId = getGoogleClientId();

if (!googleClientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables");
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <App />
    </GoogleOAuthProvider>
  </HelmetProvider>
);
  