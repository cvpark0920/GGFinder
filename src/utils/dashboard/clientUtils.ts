import { Client } from "../../types/dashboard";
import { initialClientForm } from "../../constants/dashboard";

/**
 * 새로운 클라이언트 ID를 생성합니다.
 */
export function generateClientId(): number {
  return Math.floor(Math.random() * 1000) + 100;
}

/**
 * 출생년도로부터 나이 계산
 */
function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * 클라이언트 폼 데이터를 Client 객체로 변환합니다.
 */
export function createClientFromForm(
  formData: typeof initialClientForm,
  type: "groom" | "bride"
): Client {
  const birthYear = parseInt(formData.birthYear) || 0;
  const age = calculateAge(birthYear);
  
  return {
    id: generateClientId(),
    name: formData.name,
    age: age,
    loc: formData.loc,
    status: "등록 완료",
    date: new Date().toISOString().split("T")[0],
    type,
    education: formData.education,
    height: formData.height ? parseInt(formData.height.replace(/[^0-9]/g, '')) : undefined,
    weight: formData.weight ? parseInt(formData.weight.replace(/[^0-9]/g, '')) : undefined,
    family: formData.family,
    fatherAge: formData.fatherAge ? parseInt(formData.fatherAge) : undefined,
    motherAge: formData.motherAge ? parseInt(formData.motherAge) : undefined,
    marriage: formData.marriage,
    job: formData.job,
    tattoo: formData.tattoo,
    income: formData.income,
    smoking: formData.smoking,
    drinking: formData.drinking,
    idealType: formData.idealType,
    memo: formData.memo,
    agencyId: formData.agencyId ? parseInt(formData.agencyId) : undefined,
    birthYear: birthYear,
  };
}

/**
 * 초기 클라이언트 폼 값을 반환합니다.
 */
export function getInitialClientForm() {
  return { ...initialClientForm };
}

