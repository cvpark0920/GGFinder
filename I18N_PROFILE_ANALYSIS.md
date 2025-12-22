# 프로필 화면 i18n 작업 상태 분석 보고서

## 분석 대상 파일
- `src/pages/ProfileDetail.tsx` - 프로필 상세 화면 (신랑/신부 공통)
- `src/pages/Dashboard.tsx` - 대시보드의 프로필 상세 시트
- `src/pages/ReceivedFavoritesPage.tsx` - 찜받은 목록의 프로필 상세 시트

## 현재 상태 요약

### ✅ i18n이 적용된 부분
1. **기본 라벨**: `t('label.dob')`, `t('label.maritalStatus')`, `t('label.height')`, `t('label.weight')`, `t('label.education')`, `t('label.job')`, `t('label.income')`, `t('label.religion')`, `t('label.address')`, `t('label.tattoo')`
2. **프로필 이름**: `getProfileDisplayName()` 함수 사용

### ❌ 하드코딩된 텍스트 (i18n 필요)

#### 1. 에러 메시지 (한국어 하드코딩)
- Line 43: `'프로필 ID가 없습니다.'`
- Line 54: `'유효하지 않은 프로필 ID입니다.'`
- Line 64: `'프로필을 불러오는데 실패했습니다.'`
- Line 123: `'찜 목록에서 제거되었습니다.'` (토스트)
- Line 144: `'찜 목록에 추가되었습니다.'` (토스트)
- Line 157: `'로딩 중...'`
- Line 167: `'프로필을 찾을 수 없습니다'`
- Line 168: `'요청하신 프로필이 존재하지 않습니다.'`
- Line 169: `'돌아가기'` (Button)

#### 2. SEO 메타 태그 (한국어 하드코딩)
- Line 201: `'신부'`, `'신랑'`
- Line 202: `'프로필'`
- Line 213: `'프로필'`

#### 3. 나이 표시 (영어 하드코딩)
- Line 228: `'years old'` (한국어로는 "세"가 필요)

#### 4. 탭 제목 (영어 하드코딩)
- Line 295: `'Personal Info'`
- Line 296: `'Detailed Profile'`

#### 5. 섹션 제목 (영어 하드코딩)
- Line 322: `'Other Information'`
- Line 345: `'Family Background'` (신부)
- Line 356: `'Preferences'` (신부)
- Line 367: `'Lifestyle & Assets'` (신랑)
- Line 375: `'Ideal Match'` (신랑)

#### 6. 필드 라벨 (영어 하드코딩)
- Line 312: `'Unknown'` (종교)
- Line 328: `'Health'` (신부)
- Line 332: `'Drinking'` (신랑)
- Line 333: `'Smoking'` (신랑)
- Line 347: `'Family Structure'` (신부/신랑)
- Line 348: `'Father Age'` (신부)
- Line 349: `'Mother Age'` (신부)
- Line 350: `'Parents Contact'` (신부)
- Line 351: `'Relatives Overseas'` (신부)
- Line 358: `'Desired Country'` (신부)
- Line 359: `'Previous Marriage'` (신부)
- Line 360: `'Children'` (신부)
- Line 370: `'Parental Support'` (신랑)

#### 7. 값 표시 (영어/한국어 하드코딩)
- Line 312: `'Unknown'`
- Line 348-349: `'세'` (나이 단위)
- Line 359: `'Yes'`, `'No'` (이전 결혼 여부)

#### 8. 다이얼로그 텍스트 (영어 하드코딩)
- Line 397: `'Request Meeting'` (DialogTitle)
- Line 398-399: `'Would you like to request a meeting with {name}? We will notify them of your interest.'` (DialogDescription)
- Line 403: `'Please confirm your contact details:'`
- Line 405: `'User: Guest User'`
- Line 406: `'Email: guest@example.com'`
- Line 410: `'Cancel'` (Button)
- Line 411: `'Send Request'` (Button)

#### 9. aria-label (한국어 하드코딩)
- Line 276: `'찜 해제'`, `'찜하기'`

#### 10. 주석 (한국어)
- Line 75: `// 찜 목록 로드 및 상태 확인`
- Line 88: `// 찜 목록 로드 실패는 치명적이지 않으므로 에러 토스트만 표시하지 않음`
- Line 120: `// 이미 찜한 경우 바로 제거`
- Line 126: `// 찜하기 전에 프로필 선택 다이얼로그 표시`
- Line 265: `/* 찜하기 버튼 - 프로필 사진 위에 오버레이 */`
- Line 416: `{/* 프로필 선택 다이얼로그 */}`

## 필요한 i18n 키 추가 사항

### profile 섹션에 추가 필요
```json
{
  "profile": {
    "errors": {
      "noProfileId": "프로필 ID가 없습니다.",
      "invalidProfileId": "유효하지 않은 프로필 ID입니다.",
      "loadFailed": "프로필을 불러오는데 실패했습니다.",
      "notFound": "프로필을 찾을 수 없습니다",
      "notFoundDesc": "요청하신 프로필이 존재하지 않습니다."
    },
    "loading": "로딩 중...",
    "back": "돌아가기",
    "yearsOld": "세",
    "ageDisplay": "{{age}}세",
    "tabs": {
      "personalInfo": "기본 정보",
      "detailedProfile": "상세 정보"
    },
    "sections": {
      "otherInformation": "기타 정보",
      "familyBackground": "가족 배경",
      "preferences": "선호사항",
      "lifestyleAssets": "생활 및 자산",
      "idealMatch": "이상형"
    },
    "labels": {
      "health": "건강",
      "drinking": "음주",
      "smoking": "흡연",
      "familyStructure": "가족 구성",
      "fatherAge": "아버지 연령",
      "motherAge": "어머니 연령",
      "parentsContact": "부모님 연락처",
      "relativesOverseas": "해외 친척",
      "desiredCountry": "희망 국가",
      "previousMarriage": "이전 결혼",
      "children": "자녀",
      "parentalSupport": "부모님 지원",
      "unknown": "알 수 없음"
    },
    "values": {
      "yes": "예",
      "no": "아니오",
      "unknown": "알 수 없음"
    },
    "meeting": {
      "requestTitle": "만남 요청",
      "requestDescription": "{{name}}님과 만남을 요청하시겠습니까? 관심을 전달하겠습니다.",
      "confirmContact": "연락처 정보를 확인해주세요:",
      "guestUser": "게스트 사용자",
      "guestEmail": "guest@example.com",
      "cancel": "취소",
      "sendRequest": "요청 보내기"
    },
    "favorite": {
      "add": "찜하기",
      "remove": "찜 해제"
    },
    "types": {
      "bride": "신부",
      "groom": "신랑"
    }
  }
}
```

### label 섹션에 추가 필요
```json
{
  "label": {
    "dob": "생년월일",
    "height": "키",
    "weight": "몸무게",
    "maritalStatus": "결혼 상태",
    "education": "학력",
    "job": "직업",
    "income": "소득",
    "religion": "종교",
    "address": "거주지",
    "tattoo": "문신"
  }
}
```

## 작업 우선순위

### 높음 (사용자에게 직접 보이는 텍스트)
1. 에러 메시지
2. 탭 제목
3. 섹션 제목
4. 필드 라벨
5. 다이얼로그 텍스트
6. 나이 표시

### 중간 (접근성 관련)
1. aria-label

### 낮음 (개발자용)
1. 주석

## 다른 파일의 하드코딩된 텍스트

### Dashboard.tsx
- Line 848: `'여'`, `'남'` (성별 표시)
- Line 856: `'세'` (나이 단위)
- Line 860: `'프로필 상세 정보 및 사진'` (SheetDescription)
- Line 944: `'상세 정보'` (CardTitle)

### ReceivedFavoritesPage.tsx
- Line 407: `'남'`, `'여'` (성별 표시)
- Line 416: `'세'` (나이 단위)
- Line 421: `'프로필 상세 정보 및 사진'` (SheetDescription)
- Line 505: `'상세 정보'` (CardTitle)

## 다음 단계

1. 번역 파일에 필요한 키 추가 (ko.json, en.json, vn.json)
2. ProfileDetail.tsx의 하드코딩된 텍스트를 i18n 키로 변경
3. Dashboard.tsx의 하드코딩된 텍스트를 i18n 키로 변경
4. ReceivedFavoritesPage.tsx의 하드코딩된 텍스트를 i18n 키로 변경

## 추가로 필요한 i18n 키

### common 섹션에 추가
```json
{
  "common": {
    "yearsOld": "세",
    "ageUnit": "세",
    "gender": {
      "male": "남",
      "female": "여"
    }
  }
}
```

### profile 섹션에 추가 (위의 키 외에)
```json
{
  "profile": {
    "detailDescription": "프로필 상세 정보 및 사진",
    "detailedInfo": "상세 정보"
  }
}
```

