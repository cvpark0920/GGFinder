import { Client, Agency } from "../types/dashboard";

// 초기 클라이언트 폼 값
export const initialClientForm = {
  name: "",
  birthYear: "",
  loc: "",
  education: "",
  height: "",
  weight: "",
  family: "",
  fatherAge: "",
  motherAge: "",
  marriage: "미혼",
  job: "",
  tattoo: "없음",
  income: "",
  smoking: "비흡연",
  drinking: "",
  idealType: "",
  memo: "",
  agencyId: "",
  religion: "",
  koreanLevel: "",
};

// 초기 소속사 폼 값
export const initialAgencyForm = {
  name: "",
  role: "groom" as "groom" | "bride",
  contact: "",
  phone: "",
  address: "",
  status: "활성",
  memo: "",
};

// 초기 매칭 정보 값
export const initialMatchInfo = {
  startDate: new Date().toISOString().split("T")[0],
  stage: "서류 확인",
  nextStep: "화상 미팅",
  memo: "",
};

// 상태 옵션들
export const CLIENT_STATUS_OPTIONS = [
  "등록 완료",
  "매칭 중",
  "만남 예정",
  "서류 준비",
  "대기 중",
  "진행 중",
] as const;

export const AGENCY_STATUS_OPTIONS = ["활성", "중지"] as const;

export const MATCH_STATUS_OPTIONS = ["진행 중", "대기 중", "완료"] as const;

export const MATCH_STAGE_OPTIONS = [
  "서류 확인",
  "화상 미팅",
  "대면 만남",
  "가족 소개",
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: "date-desc", label: "최신 등록순" },
  { value: "date-asc", label: "오래된 순" },
  { value: "name-asc", label: "이름 오름차순" },
  { value: "name-desc", label: "이름 내림차순" },
  { value: "age-asc", label: "나이 어린순" },
  { value: "age-desc", label: "나이 많은순" },
] as const;

