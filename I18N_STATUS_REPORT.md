# Dashboard 탭별 등록/수정 화면 i18n 상태 점검 리포트

## 📋 개요
각 Dashboard 탭 메뉴별로 등록 및 수정 화면의 i18n(국제화) 상태를 상세히 점검한 결과입니다.

---

## ✅ 완료된 탭

### 1. 소속사 탭 (Agencies) ✅
**상태**: 완료

**등록 화면**: `AgencyRegistrationForm.tsx`
- ✅ 모든 텍스트 i18n 적용 완료
- ✅ 섹션 제목, 필드 라벨, 플레이스홀더, 버튼 모두 번역됨

**수정 화면**: `EditAgencySheet.tsx`
- ✅ 모든 텍스트 i18n 적용 완료
- ✅ 섹션 제목, 필드 라벨, 플레이스홀더, 버튼 모두 번역됨

**i18n 키 경로**: `dashboard.agency.*`

---

## ⚠️ 부분 완료된 탭

### 2. 신랑 탭 (Grooms) ⚠️

**등록 화면**: `GroomRegistrationForm.tsx`
- ✅ 기본 정보, 학력 및 직업, 신체 정보 섹션: 완료
- ⚠️ **하드코딩된 텍스트 발견**:
  - 라인 169: `placeholder="홍길동"` → `t('form.registration.placeholders.nameGroom')` 사용 필요
  - 라인 353: `CardTitle>생활 습관</CardTitle>` → `t('form.registration.sections.lifestyle')` 사용 필요
  - 라인 355: `CardDescription>신랑의 생활 습관을 입력하세요</CardDescription>` → `t('form.registration.sectionDescriptions.lifestyleGroom')` 사용 필요
  - 라인 360: `Label>흡연유무</Label>` → `t('form.registration.fields.smoking')` 사용 필요
  - 라인 371: `placeholder="선택"` → `t('common.select')` 사용 필요
  - 라인 374-375: `비흡연`, `흡연` → `t('form.registration.options.nonSmoker')`, `t('form.registration.options.smoker')` 사용 필요
  - 라인 380: `Label>음주주량</Label>` → `t('form.registration.fields.drinking')` 사용 필요
  - 라인 390: `placeholder="소주 1병"` → `t('form.registration.placeholders.drinking')` 사용 필요
  - 라인 528: `{selectedPhotos.length}장 선택됨` → i18n 키 필요

**수정 화면**: `EditGroomSheet.tsx`
- ✅ 기본 정보, 학력 및 직업, 신체 정보, 재산 및 라이프스타일 섹션: 완료
- ⚠️ **하드코딩된 텍스트 발견**:
  - 라인 403: `value={editingClient.smoking || "비흡연"}` → 기본값 "비흡연" 하드코딩
  - 라인 573: `{selectedPhotos.length}장 선택됨` → i18n 키 필요

**필요한 i18n 키 추가**:
```json
{
  "form": {
    "registration": {
      "sections": {
        "lifestyle": "생활 습관" // 이미 존재할 수 있음
      },
      "sectionDescriptions": {
        "lifestyleGroom": "신랑의 생활 습관을 입력하세요"
      },
      "fields": {
        "smoking": "흡연유무", // 이미 존재할 수 있음
        "drinking": "음주주량" // 이미 존재할 수 있음
      },
      "placeholders": {
        "nameGroom": "홍길동", // 이미 존재할 수 있음
        "drinking": "소주 1병" // 이미 존재할 수 있음
      },
      "media": {
        "photosSelected": "{{count}}장 선택됨"
      }
    }
  }
}
```

---

### 3. 신부 탭 (Brides) ⚠️

**등록 화면**: `BrideRegistrationForm.tsx`
- ✅ 대부분 i18n 적용 완료
- ⚠️ **하드코딩된 텍스트 발견**:
  - 라인 600: `{selectedPhotos.length}장 선택됨` → i18n 키 필요

**수정 화면**: `EditBrideSheet.tsx`
- ✅ 대부분 i18n 적용 완료
- ⚠️ **하드코딩된 텍스트 발견**:
  - 라인 376: `value={editingClient.tattoo || "없음"}` → 기본값 "없음" 하드코딩
  - 라인 618: `{selectedPhotos.length}장 선택됨` → i18n 키 필요

**필요한 i18n 키 추가**:
```json
{
  "form": {
    "registration": {
      "media": {
        "photosSelected": "{{count}}장 선택됨"
      }
    }
  }
}
```

---

## ❌ 미완료된 탭

### 4. 사용자 탭 (Users) ❌

**수정 화면**: `UserForm.tsx`
- ❌ **모든 텍스트가 하드코딩됨**

**하드코딩된 텍스트 목록**:
1. 라인 99: `"사용자 정보 수정"` / `"새 사용자 추가"`
2. 라인 103: `"사용자의 계정 정보를 수정합니다."`
3. 라인 104: `"새로운 관리자나 소속사 회원을 시스템에 등록합니다."`
4. 라인 116: `CardTitle>기본 정보</CardTitle>`
5. 라인 118: `CardDescription>사용자의 기본적인 신상 정보를 입력하세요</CardDescription>`
6. 라인 123: `Label>아이디</Label>`
7. 라인 126: `placeholder="user123"`
8. 라인 134: `Label>이름</Label>`
9. 라인 137: `placeholder="홍길동"`
10. 라인 147: `이메일`
11. 라인 152: `placeholder="example@email.com"`
12. 라인 166: `CardTitle>권한 및 소속</CardTitle>`
13. 라인 168: `CardDescription>사용자의 역할과 권한을 설정하세요</CardDescription>`
14. 라인 172: `Label>역할</Label>`
15. 라인 179: `placeholder="역할 선택"`
16. 라인 183: `슈퍼관리자`
17. 라인 184: `- 모든 권한`
18. 라인 187: `플랫폼 관리자`
19. 라인 188: `- 운영 관리`
20. 라인 191: `소속사 회원`
21. 라인 192: `- 소속사 전용`
22. 라인 198: `⚠️ 슈퍼 관리자 계정의 역할은 슈퍼 관리자만 변경할 수 있습니다.`
23. 라인 206: `모든 데이터에 접근하고 시스템 설정을 변경할 수 있는 최고 관리자 권한입니다.`
24. 라인 212: `회원 및 매칭 관리 등 플랫폼 운영에 필요한 대부분의 권한을 가집니다.`
25. 라인 218: `자신이 속한 소속사의 데이터만 조회하고 관리할 수 있습니다.`
26. 라인 228: `label="소속사 선택"`
27. 라인 238: `계정 상태`
28. 라인 245: `placeholder="상태 선택"`
29. 라인 250: `승인 대기`
30. 라인 255: `활동 중`
31. 라인 260: `정지됨`
32. 라인 277: `취소`
33. 라인 283: `"수정 완료"` / `"사용자 추가"`

**필요한 i18n 키 추가**:
```json
{
  "dashboard": {
    "user": {
      "titles": {
        "edit": "사용자 정보 수정",
        "add": "새 사용자 추가"
      },
      "descriptions": {
        "edit": "사용자의 계정 정보를 수정합니다.",
        "add": "새로운 관리자나 소속사 회원을 시스템에 등록합니다."
      },
      "sections": {
        "basicInfo": "기본 정보",
        "roleAndAgency": "권한 및 소속"
      },
      "sectionDescriptions": {
        "basicInfo": "사용자의 기본적인 신상 정보를 입력하세요",
        "roleAndAgency": "사용자의 역할과 권한을 설정하세요"
      },
      "fields": {
        "username": "아이디",
        "name": "이름",
        "email": "이메일",
        "role": "역할",
        "agency": "소속사 선택",
        "status": "계정 상태"
      },
      "placeholders": {
        "username": "user123",
        "name": "홍길동",
        "email": "example@email.com",
        "role": "역할 선택",
        "status": "상태 선택"
      },
      "roles": {
        "superAdmin": "슈퍼관리자",
        "platformAdmin": "플랫폼 관리자",
        "agencyMember": "소속사 회원",
        "superAdminDesc": "- 모든 권한",
        "platformAdminDesc": "- 운영 관리",
        "agencyMemberDesc": "- 소속사 전용"
      },
      "roleDescriptions": {
        "superAdmin": "모든 데이터에 접근하고 시스템 설정을 변경할 수 있는 최고 관리자 권한입니다.",
        "platformAdmin": "회원 및 매칭 관리 등 플랫폼 운영에 필요한 대부분의 권한을 가집니다.",
        "agencyMember": "자신이 속한 소속사의 데이터만 조회하고 관리할 수 있습니다."
      },
      "status": {
        "pending": "승인 대기",
        "active": "활동 중",
        "suspended": "정지됨"
      },
      "warnings": {
        "superAdminRoleChange": "⚠️ 슈퍼 관리자 계정의 역할은 슈퍼 관리자만 변경할 수 있습니다."
      },
      "buttons": {
        "cancel": "취소",
        "save": "수정 완료",
        "add": "사용자 추가"
      }
    }
  }
}
```

---

### 5. 매칭 탭 (Matches) ⚠️

**생성 화면**: `CreateMatchSheet.tsx`
- ⚠️ **부분적으로 하드코딩됨**

**하드코딩된 텍스트 목록**:
1. 라인 80: `placeholder={`${matchingClient?.type === "groom" ? "신부" : "신랑"} 이름 또는 지역 검색`}`
2. 라인 95-97: `매칭 가능한{" "}{matchingClient?.type === "groom" ? "신부" : "신랑"}가 없습니다.`
3. 라인 148: `{partner.age}세` → "세" 하드코딩
4. 라인 159: `학력 {partner.education}` → "학력" 하드코딩
5. 라인 252: `placeholder="예: 화상 미팅 일정 조율"`
6. 라인 286: `취소`

**필요한 i18n 키 추가**:
```json
{
  "match": {
    "create": {
      "searchPlaceholder": {
        "groom": "신부 이름 또는 지역 검색",
        "bride": "신랑 이름 또는 지역 검색"
      },
      "noPartners": {
        "groom": "매칭 가능한 신부가 없습니다.",
        "bride": "매칭 가능한 신랑이 없습니다."
      },
      "fields": {
        "age": "{{age}}세",
        "education": "학력 {{education}}"
      },
      "placeholders": {
        "nextStep": "예: 화상 미팅 일정 조율"
      },
      "buttons": {
        "cancel": "취소"
      }
    }
  }
}
```

---

### 6. 유튜브 탭 (YouTube) ❌

**등록/수정 화면**: `YouTubeRegistrationForm.tsx`
- ❌ **모든 텍스트가 하드코딩됨**

**하드코딩된 텍스트 목록**:
1. 라인 101: `"동영상 수정"` / `"유튜브 동영상 등록"`
2. 라인 104: `"앱에 표시될 유튜브 동영상을 등록하세요."`
3. 라인 114: `YouTube URL` (영어는 유지 가능)
4. 라인 122: `placeholder="https://www.youtube.com/watch?v=..."`
5. 라인 143: `동영상 미리보기`
6. 라인 151: `제목`
7. 라인 157: `placeholder="동영상 제목을 입력하세요"`
8. 라인 165: `상태`
9. 라인 178: `활성 (공개)`
10. 라인 184: `비활성 (비공개)`
11. 라인 194: `설명`
12. 라인 200: `placeholder="동영상에 대한 설명을 입력하세요"`
13. 라인 213: `취소`
14. 라인 220: `"수정완료"` / `"등록하기"`

**필요한 i18n 키 추가**:
```json
{
  "dashboard": {
    "youtube": {
      "titles": {
        "register": "유튜브 동영상 등록",
        "edit": "동영상 수정"
      },
      "descriptions": {
        "register": "앱에 표시될 유튜브 동영상을 등록하세요."
      },
      "fields": {
        "url": "YouTube URL",
        "title": "제목",
        "status": "상태",
        "description": "설명"
      },
      "placeholders": {
        "url": "https://www.youtube.com/watch?v=...",
        "title": "동영상 제목을 입력하세요",
        "description": "동영상에 대한 설명을 입력하세요"
      },
      "status": {
        "active": "활성 (공개)",
        "inactive": "비활성 (비공개)"
      },
      "preview": {
        "title": "동영상 미리보기"
      },
      "buttons": {
        "cancel": "취소",
        "register": "등록하기",
        "save": "수정완료"
      }
    }
  }
}
```

---

## 📊 요약 통계

| 탭 | 등록 화면 | 수정 화면 | 완료도 |
|---|---|---|---|
| 소속사 | ✅ 완료 | ✅ 완료 | 100% |
| 신랑 | ⚠️ 90% | ⚠️ 95% | 92.5% |
| 신부 | ⚠️ 98% | ⚠️ 98% | 98% |
| 사용자 | ❌ 0% | ❌ 0% | 0% |
| 매칭 | ⚠️ 80% | - | 80% |
| 유튜브 | ❌ 0% | ❌ 0% | 0% |

**전체 완료도**: 약 60%

---

## 🔧 권장 작업 순서

1. **우선순위 높음**:
   - 사용자 탭 (UserForm.tsx) - 완전히 미완료
   - 유튜브 탭 (YouTubeRegistrationForm.tsx) - 완전히 미완료

2. **우선순위 중간**:
   - 매칭 탭 (CreateMatchSheet.tsx) - 부분 완료
   - 신랑/신부 탭 - 사진 선택 개수 표시 등 세부 사항

3. **우선순위 낮음**:
   - 신랑/신부 탭의 나머지 하드코딩 텍스트

---

## 📝 공통 i18n 키 추가 필요

다음 키들은 여러 컴포넌트에서 공통으로 사용됩니다:

```json
{
  "form": {
    "registration": {
      "media": {
        "photosSelected": "{{count}}장 선택됨"
      }
    }
  },
  "common": {
    "age": "세",
    "education": "학력"
  }
}
```

---

## ✅ 다음 단계

1. i18n 키를 `ko.json`, `en.json`, `vn.json`에 추가
2. 각 컴포넌트에서 하드코딩된 텍스트를 i18n 키로 교체
3. `useLanguage` 훅 import 및 `t()` 함수 사용
4. 테스트: 언어 전환 시 모든 텍스트가 올바르게 번역되는지 확인

