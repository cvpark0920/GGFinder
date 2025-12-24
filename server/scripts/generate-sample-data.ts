import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 로컬 환경에서 DATABASE_URL이 Docker 네트워크 주소인 경우 localhost로 변경
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:5432')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@db:5432', '@localhost:5432');
  console.log('DATABASE_URL을 localhost로 변경했습니다.');
}

const prisma = new PrismaClient();

// 한국 이름 샘플
const koreanNames = [
  '김민수', '이지은', '박준호', '최수진', '정현우', '강미영', '윤태영', '장혜진',
  '임동욱', '한소영', '오성민', '신지혜', '조영호', '권나영', '황민석', '배수진',
  '송지훈', '유미라', '홍성호', '서지영', '노현우', '문혜진', '양준호', '백수진',
  '남동욱', '심지영', '안성민', '류혜진', '구영호', '차나영', '전민석', '진수진',
  '엄지훈', '표미라', '하성호', '곽지영', '위현우', '제혜진', '공준호', '마수진'
];

// 베트남 이름 샘플
const vietnameseNames = [
  'Nguyễn Thị Mai', 'Trần Văn Nam', 'Lê Thị Hoa', 'Phạm Văn Đức', 'Hoàng Thị Lan',
  'Vũ Văn Hùng', 'Đặng Thị Nga', 'Bùi Văn Tuấn', 'Đỗ Thị Linh', 'Ngô Văn Minh',
  'Dương Thị Hương', 'Lý Văn Quang', 'Võ Thị Thảo', 'Phan Văn Long', 'Trương Thị Hạnh',
  'Đinh Văn Sơn', 'Lương Thị Mai', 'Tôn Văn Đạt', 'Chu Thị Lan', 'Hồ Văn Thành',
  'Lâm Thị Hoa', 'Đào Văn Tuấn', 'Bạch Thị Nga', 'Cao Văn Minh', 'Đỗ Thị Linh',
  'Hà Văn Quang', 'Kiều Thị Thảo', 'Lưu Văn Long', 'Mai Thị Hạnh', 'Nguyễn Văn Sơn',
  'Phạm Thị Mai', 'Trần Văn Đạt', 'Lê Thị Lan', 'Hoàng Văn Thành', 'Vũ Thị Hoa',
  'Đặng Văn Tuấn', 'Bùi Thị Nga', 'Ngô Văn Minh', 'Dương Thị Linh', 'Lý Văn Quang'
];

// 지역 샘플
const koreanRegions = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '수원', '성남', '고양', '용인', '부천', '안산', '안양', '평택',
  '시흥', '김포', '의정부', '광명', '포천', '이천', '오산', '구리',
  '남양주', '하남', '파주', '의왕', '양주', '화성', '고양', '부천',
  '안산', '안양', '평택', '시흥', '김포', '의정부', '광명', '포천'
];

const vietnameseRegions = [
  '호치민', '하노이', '다낭', '하이퐁', '껀터', '비엔호아', '나트랑', '후에',
  '푸꾸옥', '달랏', '빈', '타이응우옌', '타이빈', '하이즈엉', '푸옌', '응에안',
  '타인호아', '꽝빈', '꽝찌', '다낭', '꽝남', '꽝응아이', '빈딘', '푸옌',
  '카인호아', '닌투언', '빈투언', '람동', '동나이', '빈즈엉', '바리붕타우', '타이닌',
  '롱안', '동탑', '안장', '벤째', '까마우', '끼엔장', '하우장', '소크짱'
];

// 소속사 이름 샘플
const agencyNames = [
  '서울국제결혼', '부산해외매칭', '대구국제상담', '인천글로벌매칭', '광주해외결혼',
  '대전국제상담소', '울산해외매칭', '수원국제결혼', '성남해외상담', '고양글로벌매칭',
  '용인국제결혼', '부천해외매칭', '안산국제상담', '안양해외결혼', '평택글로벌매칭',
  '시흥국제상담소', '김포해외매칭', '의정부국제결혼', '광명해외상담', '포천글로벌매칭',
  '이천국제결혼', '구리해외매칭', '남양주국제상담', '하남해외결혼', '파주글로벌매칭',
  '의왕국제상담소', '양주해외매칭', '화성국제결혼', '고양해외상담', '부천글로벌매칭',
  '안산국제결혼', '안양해외매칭', '평택국제상담', '시흥해외결혼', '김포글로벌매칭',
  '의정부국제상담소', '광명해외매칭', '포천국제결혼', '이천해외상담', '구리글로벌매칭'
];

// 전화번호 생성
function generatePhone(): string {
  const areaCodes = ['02', '031', '032', '033', '041', '042', '043', '044', '051', '052', '053', '054', '055', '061', '062', '063', '064'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const first = String(Math.floor(Math.random() * 9000) + 1000);
  const second = String(Math.floor(Math.random() * 9000) + 1000);
  return `${areaCode}-${first}-${second}`;
}

// 베트남 전화번호 생성
function generateVietnamesePhone(): string {
  const prefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '099'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 9000000) + 1000000);
  return `${prefix}${number}`;
}

// 주소 생성
function generateKoreanAddress(): string {
  const cities = ['서울시', '부산시', '대구시', '인천시', '광주시', '대전시', '울산시'];
  const districts = ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구'];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = `${Math.floor(Math.random() * 100) + 1}번길`;
  return `${city} ${district} ${street}`;
}

function generateVietnameseAddress(): string {
  const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 10', 'Quận 11', 'Quận Bình Thạnh', 'Quận Tân Bình'];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = `Đường ${Math.floor(Math.random() * 100) + 1}`;
  return `${district}, ${street}, TP. Hồ Chí Minh`;
}

// 출생년도 생성 (25-45세)
function generateBirthYear(minAge: number = 25, maxAge: number = 45): number {
  const currentYear = new Date().getFullYear();
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  return currentYear - age;
}

// 학력 샘플
const educations = ['고졸', '전문대졸', '대졸', '대학원졸'];

// 직업 샘플
const jobs = [
  '회사원', '공무원', '교사', '의사', '변호사', '회계사', '엔지니어', '디자이너',
  '사업가', '자영업', '프리랜서', '간호사', '약사', '영업직', '관리직', '기타'
];

// 흡연/음주 샘플
const smokingOptions = ['비흡연', '흡연'];
const drinkingOptions = ['비음주', '가끔', '자주'];

// 문신 샘플
const tattooOptions = ['없음', '있음'];

// 상태 샘플 (DB 형식)
const clientStatuses: Array<'registered' | 'matching' | 'meeting_scheduled' | 'document_prep' | 'waiting' | 'in_progress'> = [
  'registered', 'matching', 'meeting_scheduled', 'document_prep', 'waiting', 'in_progress'
];
const agencyStatuses: Array<'active' | 'suspended'> = ['active', 'suspended'];
const userStatuses: Array<'pending' | 'active' | 'suspended'> = ['pending', 'active', 'suspended'];
const userRoles: Array<'super_admin' | 'platform_admin' | 'agency_member'> = ['super_admin', 'platform_admin', 'agency_member'];

async function generateSampleData() {
  console.log('샘플 데이터 생성 시작...');

  try {
    // 1. 소속사 생성 (40개)
    console.log('소속사 생성 중...');
    const agencies = [];
    for (let i = 0; i < 40; i++) {
      const role = i < 20 ? 'groom' : 'bride'; // 앞 20개는 신랑, 뒤 20개는 신부
      const agency = await prisma.agency.create({
        data: {
          name: agencyNames[i],
          role: role as 'groom' | 'bride',
          contact: koreanNames[i],
          phone: generatePhone(),
          address: generateKoreanAddress(),
          status: agencyStatuses[i < 35 ? 0 : 1], // 대부분 활성
          memo: i % 5 === 0 ? `소속사 메모 ${i + 1}` : null,
        },
      });
      agencies.push(agency);
      console.log(`소속사 생성: ${agency.name} (${i + 1}/40)`);
    }

    // 2. 신랑 생성 (40개)
    console.log('\n신랑 생성 중...');
    const groomAgencies = agencies.filter(a => a.role === 'groom');
    for (let i = 0; i < 40; i++) {
      const agency = groomAgencies[Math.floor(Math.random() * groomAgencies.length)];
      const birthYear = generateBirthYear(28, 45);
      
      await prisma.client.create({
        data: {
          name: koreanNames[i],
          loc: koreanRegions[i],
          type: 'groom',
          birthYear: birthYear,
          status: clientStatuses[Math.floor(Math.random() * clientStatuses.length)],
          education: educations[Math.floor(Math.random() * educations.length)],
          height: Math.floor(Math.random() * 20) + 165, // 165-184cm
          weight: Math.floor(Math.random() * 30) + 65, // 65-94kg
          job: jobs[Math.floor(Math.random() * jobs.length)],
          residence: koreanRegions[i],
          smoking: smokingOptions[Math.floor(Math.random() * smokingOptions.length)],
          drinking: drinkingOptions[Math.floor(Math.random() * drinkingOptions.length)],
          agencyId: agency.id,
          memo: i % 10 === 0 ? `신랑 메모 ${i + 1}` : null,
        },
      });
      console.log(`신랑 생성: ${koreanNames[i]} (${i + 1}/40)`);
    }

    // 3. 신부 생성 (40개)
    console.log('\n신부 생성 중...');
    const brideAgencies = agencies.filter(a => a.role === 'bride');
    for (let i = 0; i < 40; i++) {
      const agency = brideAgencies[Math.floor(Math.random() * brideAgencies.length)];
      const birthYear = generateBirthYear(20, 35);
      
      await prisma.client.create({
        data: {
          name: vietnameseNames[i],
          loc: vietnameseRegions[i],
          type: 'bride',
          birthYear: birthYear,
          status: clientStatuses[Math.floor(Math.random() * clientStatuses.length)],
          education: educations[Math.floor(Math.random() * educations.length)],
          height: Math.floor(Math.random() * 15) + 150, // 150-164cm
          weight: Math.floor(Math.random() * 20) + 45, // 45-64kg
          job: jobs[Math.floor(Math.random() * jobs.length)],
          currentAddress: generateVietnameseAddress(),
          tattoo: tattooOptions[Math.floor(Math.random() * tattooOptions.length)],
          phone: generateVietnamesePhone(),
          agencyId: agency.id,
          memo: i % 10 === 0 ? `신부 메모 ${i + 1}` : null,
        },
      });
      console.log(`신부 생성: ${vietnameseNames[i]} (${i + 1}/40)`);
    }

    // 4. 사용자 생성 (40개)
    console.log('\n사용자 생성 중...');
    for (let i = 0; i < 40; i++) {
      const role = i === 0 ? 'super_admin' : i < 5 ? 'platform_admin' : 'agency_member';
      const agency = role === 'agency_member' ? agencies[Math.floor(Math.random() * agencies.length)] : null;
      
      await prisma.user.create({
        data: {
          username: `user${i + 1}`,
          name: koreanNames[i],
          email: `user${i + 1}@example.com`,
          role: role as any,
          status: userStatuses[i < 35 ? 1 : (i < 38 ? 0 : 2)],
          agencyId: agency?.id || null,
          realName: koreanNames[i],
          phone: generatePhone(),
        },
      });
      console.log(`사용자 생성: user${i + 1} (${i + 1}/40)`);
    }

    console.log('\n✅ 샘플 데이터 생성 완료!');
    console.log(`- 소속사: 40개`);
    console.log(`- 신랑: 40개`);
    console.log(`- 신부: 40개`);
    console.log(`- 사용자: 40개`);

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
generateSampleData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

