# Google OAuth 리디렉션 방식 설정 가이드

## 환경 변수 설정

서버의 `.env` 파일에 다음 환경 변수를 추가하세요:

```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# 프론트엔드 URL (선택사항)
FRONTEND_URL=http://localhost:4001
```

## Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/apis/credentials

2. **OAuth 2.0 클라이언트 ID 선택**
   - 클라이언트 ID: `407454942798-ive9ifpoeog2da221icm0f71u6e1ukn0.apps.googleusercontent.com`

3. **승인된 리디렉션 URI 추가**
   - "승인된 리디렉션 URI" 섹션에서 "URI 추가" 클릭
   - 다음 URL 추가:
     ```
     http://localhost:4000/api/auth/google/callback
     ```
   - 프로덕션 배포 시 실제 도메인도 추가:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```

4. **저장**
   - 변경사항 저장
   - 설정 적용까지 몇 분 걸릴 수 있음

## 작동 방식

1. 사용자가 "Google로 계속하기" 버튼 클릭
2. `/api/auth/google/redirect`로 리디렉션
3. Google 인증 페이지로 이동
4. 사용자가 Google 계정으로 로그인 및 동의
5. Google이 `/api/auth/google/callback`으로 리디렉션 (code 파라미터 포함)
6. 백엔드가 code를 토큰으로 교환하고 사용자 정보 조회/생성
7. 프론트엔드 `/auth/callback`으로 리디렉션 (token 파라미터 포함)
8. 프론트엔드가 토큰으로 사용자 정보 가져와서 로그인 완료

## 장점

- Cursor 내장 브라우저에서도 정상 작동 (팝업 불필요)
- 모든 브라우저에서 작동
- 보안: CSRF 보호 (state 파라미터 사용)
- 표준 OAuth 2.0 플로우 준수

