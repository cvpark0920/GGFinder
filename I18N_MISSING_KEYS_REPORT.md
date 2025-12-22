# i18n 키값이 그대로 표시되는 문제 분석 보고서

## 문제 발견

DOM에서 `profile.filters`가 그대로 표시되는 문제가 발견되었습니다.

## 원인 분석

번역 파일에서 `profile.filters`가 **두 번 정의**되어 있습니다:

1. **Line 112**: `"filters": "필터"` (문자열)
2. **Line 155**: `"filters": { "title": "필터", ... }` (객체)

JSON에서는 같은 키가 두 번 나오면 **마지막 것이 덮어씁니다**. 따라서 `profile.filters`는 객체가 되고, `t('profile.filters')`를 호출하면:
- 객체를 반환하려고 시도
- `t` 함수는 문자열이 아니면 키 자체를 반환 (LanguageContext.tsx Line 73-74)
- 결과: `'profile.filters'`가 그대로 화면에 표시됨

## 발견된 문제 위치

### 1. ProfileFilters.tsx
- **Line 458**: `{t('profile.filters')}` → `{t('profile.filters.title')}`로 변경 필요

### 2. ProfileList.tsx  
- **Line 491**: `{t('profile.filters')}` → `{t('profile.filters.title')}`로 변경 필요
- **Line 493**: `{t('profile.filters')}` → `{t('profile.filters.title')}`로 변경 필요

## 해결 방법

### 방법 1: 코드 수정 (권장)
`t('profile.filters')`를 모두 `t('profile.filters.title')`로 변경

### 방법 2: 번역 파일 수정
`profile.filters` 문자열을 제거하고 `profile.filters.title`만 사용

## 전체 코드베이스에서 i18n 키 사용 현황

전체 코드베이스에서 `t()` 함수를 사용하는 파일: **24개**

주요 사용 패턴:
- `t('common.*')` - 공통 키
- `t('dashboard.*')` - 대시보드 키
- `t('profile.*')` - 프로필 키
- `t('form.*')` - 폼 키
- `t('favorite.*')` - 찜 관련 키

## 추가 확인 필요 사항

다른 중복 키가 있는지 확인:
1. 번역 파일에서 같은 키가 두 번 정의된 경우
2. 객체와 문자열이 충돌하는 경우
3. 키 경로가 잘못된 경우

## 수정 완료

✅ `src/components/ProfileFilters.tsx` - Line 458 수정 완료
✅ `src/pages/ProfileList.tsx` - Line 491, 493 수정 완료

