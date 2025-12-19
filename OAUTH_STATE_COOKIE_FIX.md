# OAuth State Cookie 에러 해결 가이드

## 🔍 문제 원인

DigitalOcean 배포 환경에서 `invalid_state` 에러 발생:
- URL: `http://localhost:4000/login?error=invalid_state`
- 원인: OAuth state 쿠키가 제대로 설정/읽히지 않음

### 가능한 원인

1. **쿠키 설정 문제**
   - `secure: true`는 HTTPS에서만 작동
   - `sameSite: 'lax'`는 크로스 도메인 요청에서 문제 발생 가능
   - DigitalOcean App Platform의 프록시 설정

2. **도메인 불일치**
   - Google OAuth 리디렉션 시 도메인이 변경됨
   - 쿠키가 다른 도메인에서 설정되어 읽히지 않음

3. **HTTPS vs HTTP**
   - 프로덕션은 HTTPS이지만 쿠키 설정이 잘못됨

## ✅ 해결 방법

### 1. 쿠키 설정 개선

`server/routes/auth.ts`에서 쿠키 설정 수정:

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions: any = {
  httpOnly: true,
  secure: isProduction, // 프로덕션에서는 HTTPS만 허용
  sameSite: isProduction ? 'none' : 'lax', // 프로덕션에서는 크로스 도메인 허용
  maxAge: 10 * 60 * 1000, // 10분
};

res.cookie('oauth_state', state, cookieOptions);
res.cookie('oauth_return_url', returnUrl, cookieOptions);
```

### 2. clearCookie도 동일한 옵션 사용

```typescript
const clearCookieOptions: any = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};
res.clearCookie('oauth_state', clearCookieOptions);
res.clearCookie('oauth_return_url', clearCookieOptions);
```

### 3. 디버깅 로그 추가

state 검증 실패 시 상세 로그 출력:

```typescript
if (!storedState || storedState !== state) {
  console.error('OAuth state validation failed:', {
    hasStoredState: !!storedState,
    storedStateLength: storedState?.length || 0,
    receivedStateLength: state?.length || 0,
    statesMatch: storedState === state,
    cookies: Object.keys(req.cookies || {}),
  });
  // ...
}
```

## 🔍 확인 방법

### 1. 서버 로그 확인

DigitalOcean 콘솔에서 런타임 로그 확인:

```
OAuth state validation failed: {
  hasStoredState: false,
  storedStateLength: 0,
  receivedStateLength: 64,
  statesMatch: false,
  cookies: []
}
```

### 2. 브라우저 개발자 도구 확인

1. Network 탭에서 `/api/auth/google/redirect` 요청 확인
2. Response Headers에서 `Set-Cookie` 확인
3. `/api/auth/google/callback` 요청에서 Request Headers의 `Cookie` 확인

### 3. 쿠키 확인

브라우저 개발자 도구 > Application > Cookies에서:
- `oauth_state` 쿠키가 설정되어 있는지 확인
- 쿠키의 `Secure`, `SameSite` 속성 확인

## ⚠️ 주의사항

1. **sameSite: 'none'**
   - HTTPS 환경에서만 작동
   - `secure: true`와 함께 사용해야 함

2. **도메인 설정**
   - DigitalOcean App Platform에서는 도메인을 명시적으로 설정하지 않음
   - 브라우저가 자동으로 설정함

3. **프록시 설정**
   - DigitalOcean App Platform은 프록시를 통해 요청을 전달
   - 쿠키가 제대로 전달되는지 확인 필요

## 📝 추가 해결 방법

### 방법 1: 세션 스토리지 사용 (대안)

쿠키 대신 세션 스토리지를 사용할 수 있습니다:

```typescript
// 세션에 state 저장 (예: Redis 또는 메모리 스토리지)
sessionStorage.set(state, { returnUrl, timestamp: Date.now() });
```

### 방법 2: 쿠키 도메인 명시적 설정

필요한 경우 도메인을 명시적으로 설정:

```typescript
const cookieOptions: any = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 10 * 60 * 1000,
  domain: isProduction ? '.ondigitalocean.app' : undefined, // 필요시
};
```

