import { BrideProfile, GroomProfile } from "../types";

export const MOCK_BRIDES: BrideProfile[] = [
  {
    id: 'b1',
    type: 'bride',
    status: 'active',
    name: 'Cúc',
    birthDate: '2004-12-24',
    height: 163,
    weight: 59,
    education: '고등학교 졸업 (Tốt nghiệp THPT)',
    maritalStatus: '미혼 (Độc thân)',
    hasMarriedBefore: false,
    children: '없음 (Không)',
    job: '의류 회사 근무 (Nhân viên công ty may)',
    addressRegistration: '소크짱 (Sóc Trăng)',
    currentAddress: '소크짱 (Sóc Trăng)',
    monthlyIncome: '800만~1000만 동 (8-10 triệu VND)',
    tattoo: '없음 (Không)',
    siblings: '여동생 1명 (1 em gái)',
    relativesOverseas: '없음 (Không)',
    fatherAge: '47',
    motherAge: '42',
    parentsPhone: '036 (어머니)',
    phone: '000-0000-0000',
    healthIssues: '없음 (Không)',
    desiredDestination: '한국 (Hàn Quốc)',
    guarantee: true,
    images: [
      'https://images.unsplash.com/photo-1761635491338-f2767d72f997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1761933808453-e53af6d5804b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1688726201027-4c323845c804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1573912381880-59a77f95883b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ]
  },
  {
    id: 'b2',
    type: 'bride',
    status: 'consulting',
    name: 'Mai',
    birthDate: '2002-05-15',
    height: 160,
    weight: 48,
    education: '대학교 재학 (Sinh viên đại học)',
    maritalStatus: '미혼 (Độc thân)',
    hasMarriedBefore: false,
    children: '없음 (Không)',
    job: '학생 (Sinh viên)',
    addressRegistration: '껀터 (Cần Thơ)',
    currentAddress: '호치민 (TP.HCM)',
    monthlyIncome: '없음 (Không)',
    tattoo: '없음 (Không)',
    siblings: '남동생 2명',
    relativesOverseas: '이모 한국 거주',
    fatherAge: '49',
    motherAge: '46',
    parentsPhone: '090 (아버지)',
    phone: '010-0000-0000',
    healthIssues: '없음',
    desiredDestination: '한국',
    guarantee: false,
    images: [
      'https://images.unsplash.com/photo-1668172143468-00494a0d8461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1525362081669-2b4764d5eb05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1555445054-848885338324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    ]
  }
];

export const MOCK_GROOMS: GroomProfile[] = [
  {
    id: 'g1',
    type: 'groom',
    status: 'active',
    name: '서정민 (Seo Jeong-min)',
    residence: '호주 브리즈번 (Brisbane, Australia)',
    birthYear: 1978,
    education: '석사 (회계학, IT) - Thạc sĩ',
    height: 178,
    weight: 68,
    maritalStatus: '미혼 (첫 결혼) - Độc thân',
    job: '회사원 (IT 컨설팅) - Nhân viên văn phòng',
    income: '70,000 USD (세전)',
    transportation: 'Toyota Corolla Cross 2025',
    housing: '자가 소유 (Nhà riêng)',
    family: '부모님과 본인 (외동) - Con một',
    hobbies: '헬스, 근력 운동 (Gym)',
    parentalSupport: '결혼 후 별거 예정 (Sống riêng)',
    drinking: '거의 안 함 (Hiếm khi)',
    smoking: '안 함 (Không)',
    tattoo: '없음 (Không)',
    features: '건강한 생활, 규칙적인 생활 습관',
    religion: '기독교 (개신교) - Tin lành',
    idealType: [
        '기독교와 교회에 대해 거부감이나 반감이 없는 사람',
        '키 160cm 이상',
        '문신이 없고 건강이 좋은 사람'
    ],
    images: [
      'https://images.unsplash.com/photo-1759153820013-0e42a58ac2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1597409236455-f0cb2eb94bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1696457478950-454bda4e8902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ]
  }
];
