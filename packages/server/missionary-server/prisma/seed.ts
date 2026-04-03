import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

import { PrismaClient } from './generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

// ============================================
// ADMIN USER
// ============================================

async function seedAdminUser() {
  const adminLoginId = 'admin';
  const existing = await prisma.user.findFirst({
    where: { loginId: adminLoginId, role: 'ADMIN', deletedAt: null },
  });

  if (existing) {
    console.log(
      `  ✓ 관리자 계정 이미 존재 (${existing.email ?? adminLoginId})`,
    );
    return existing;
  }

  const hashedPassword = await bcrypt.hash('admin1234', SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@missionary.dev',
      name: '관리자',
      loginId: adminLoginId,
      password: hashedPassword,
      role: 'ADMIN',
      provider: 'LOCAL',
    },
  });

  console.log('  + 관리자 계정 생성 (admin / admin1234)');
  return admin;
}

// ============================================
// TERMS
// ============================================

async function seedTerms() {
  const termsData = [
    {
      termsType: 'USING_OF_SERVICE' as const,
      termsTitle: '서비스 이용약관',
      isEssential: true,
    },
    {
      termsType: 'PROCESSING_POLICY_OF_PRIVATE_INFO' as const,
      termsTitle: '개인정보 처리방침',
      isEssential: true,
    },
    {
      termsType: 'USING_OF_PRIVATE_INFO' as const,
      termsTitle: '개인정보 수집 및 이용 동의',
      isEssential: true,
    },
    {
      termsType: 'OFFERING_PRIVATE_INFO_TO_THIRD_PARTY' as const,
      termsTitle: '제3자 정보 제공 동의',
      isEssential: false,
    },
  ];

  for (const data of termsData) {
    const existing = await prisma.terms.findFirst({
      where: { termsType: data.termsType, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 약관 이미 존재: ${data.termsTitle}`);
      continue;
    }

    await prisma.terms.create({ data });
    console.log(`  + 약관 생성: ${data.termsTitle}`);
  }
}

// ============================================
// MISSION GROUPS
// ============================================

interface MissionGroupSeed {
  name: string;
  category: 'DOMESTIC' | 'ABROAD';
  description?: string;
}

const MISSION_GROUPS: MissionGroupSeed[] = [
  // 국내 선교
  { name: '군선교', category: 'DOMESTIC', description: '군부대 복음 전파 및 군인 대상 섬김 활동' },
  { name: '농촌선교', category: 'DOMESTIC', description: '농촌 지역 교회 및 마을 섬김 활동' },
  { name: '도시선교', category: 'DOMESTIC', description: '도시 소외 계층 섬김 및 복음 전파' },
  { name: '청소년선교', category: 'DOMESTIC', description: '청소년 대상 캠프 및 멘토링 프로그램' },
  // 해외 선교
  { name: '필리핀선교', category: 'ABROAD', description: '필리핀 마닐라·세부 지역 단기선교' },
  { name: '캄보디아선교', category: 'ABROAD', description: '캄보디아 프놈펜·시엠립 지역 단기선교' },
  { name: '몽골선교', category: 'ABROAD', description: '몽골 울란바토르 지역 단기선교' },
];

async function seedMissionGroups() {
  const groupMap = new Map<string, string>();

  for (const data of MISSION_GROUPS) {
    const existing = await prisma.missionGroup.findFirst({
      where: { name: data.name, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 선교 그룹 이미 존재: ${data.name}`);
      groupMap.set(data.name, existing.id);
      continue;
    }

    const group = await prisma.missionGroup.create({ data });
    console.log(`  + 선교 그룹 생성: ${data.name}`);
    groupMap.set(data.name, group.id);
  }

  return groupMap;
}

// ============================================
// MISSIONARIES (차수)
// ============================================

interface MissionarySeed {
  groupName: string;
  order: number;
  startDate: string;
  endDate: string;
  participationStartDate: string;
  participationEndDate: string;
  status: 'ENROLLMENT_OPENED' | 'ENROLLMENT_CLOSED' | 'IN_PROGRESS' | 'COMPLETED';
  pastorName?: string;
  pastorPhone?: string;
  price?: number;
  maximumParticipantCount?: number;
  description?: string;
}

const MISSIONARIES: MissionarySeed[] = [
  // ── 군선교 ──
  {
    groupName: '군선교',
    order: 33,
    startDate: '2025-07-21',
    endDate: '2025-07-25',
    participationStartDate: '2025-05-01',
    participationEndDate: '2025-06-30',
    status: 'COMPLETED',
    pastorName: '김영진',
    pastorPhone: '010-1111-2222',
    price: 150000,
    maximumParticipantCount: 80,
    description: '강원도 지역 군부대 방문 및 군인 섬김',
  },
  {
    groupName: '군선교',
    order: 34,
    startDate: '2025-12-15',
    endDate: '2025-12-19',
    participationStartDate: '2025-10-01',
    participationEndDate: '2025-11-30',
    status: 'COMPLETED',
    pastorName: '김영진',
    pastorPhone: '010-1111-2222',
    price: 150000,
    maximumParticipantCount: 80,
    description: '경기 북부 군부대 방문 및 군인 섬김',
  },
  {
    groupName: '군선교',
    order: 35,
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    participationStartDate: '2026-04-01',
    participationEndDate: '2026-06-30',
    status: 'ENROLLMENT_OPENED',
    pastorName: '김영진',
    pastorPhone: '010-1111-2222',
    price: 180000,
    maximumParticipantCount: 100,
    description: '강원·경기 지역 군부대 복음 전파 및 군인 섬김',
  },

  // ── 농촌선교 ──
  {
    groupName: '농촌선교',
    order: 10,
    startDate: '2025-08-04',
    endDate: '2025-08-08',
    participationStartDate: '2025-06-01',
    participationEndDate: '2025-07-20',
    status: 'COMPLETED',
    pastorName: '박성호',
    pastorPhone: '010-3333-4444',
    price: 120000,
    maximumParticipantCount: 60,
    description: '전남 해남 지역 농촌 교회 섬김 및 농활',
  },
  {
    groupName: '농촌선교',
    order: 11,
    startDate: '2026-08-03',
    endDate: '2026-08-07',
    participationStartDate: '2026-05-01',
    participationEndDate: '2026-07-15',
    status: 'ENROLLMENT_OPENED',
    pastorName: '박성호',
    pastorPhone: '010-3333-4444',
    price: 130000,
    maximumParticipantCount: 60,
    description: '경북 영주 지역 농촌 교회 섬김 및 농활',
  },

  // ── 도시선교 ──
  {
    groupName: '도시선교',
    order: 5,
    startDate: '2025-09-01',
    endDate: '2025-09-05',
    participationStartDate: '2025-07-01',
    participationEndDate: '2025-08-20',
    status: 'COMPLETED',
    pastorName: '이민수',
    pastorPhone: '010-5555-6666',
    price: 100000,
    maximumParticipantCount: 40,
    description: '서울 영등포·쪽방촌 지역 섬김',
  },
  {
    groupName: '도시선교',
    order: 6,
    startDate: '2026-05-18',
    endDate: '2026-05-22',
    participationStartDate: '2026-03-01',
    participationEndDate: '2026-05-01',
    status: 'IN_PROGRESS',
    pastorName: '이민수',
    pastorPhone: '010-5555-6666',
    price: 110000,
    maximumParticipantCount: 50,
    description: '부산 동구 지역 노숙인 쉼터 섬김',
  },

  // ── 청소년선교 ──
  {
    groupName: '청소년선교',
    order: 8,
    startDate: '2026-01-13',
    endDate: '2026-01-17',
    participationStartDate: '2025-11-01',
    participationEndDate: '2025-12-31',
    status: 'ENROLLMENT_CLOSED',
    pastorName: '정다윗',
    pastorPhone: '010-7777-8888',
    price: 90000,
    maximumParticipantCount: 120,
    description: '겨울 청소년 수련회 및 멘토링 캠프',
  },
  {
    groupName: '청소년선교',
    order: 9,
    startDate: '2026-07-27',
    endDate: '2026-07-31',
    participationStartDate: '2026-05-01',
    participationEndDate: '2026-07-10',
    status: 'ENROLLMENT_OPENED',
    pastorName: '정다윗',
    pastorPhone: '010-7777-8888',
    price: 100000,
    maximumParticipantCount: 120,
    description: '여름 청소년 수련회 및 리더십 캠프',
  },

  // ── 필리핀선교 ──
  {
    groupName: '필리핀선교',
    order: 12,
    startDate: '2025-10-06',
    endDate: '2025-10-12',
    participationStartDate: '2025-07-01',
    participationEndDate: '2025-09-15',
    status: 'COMPLETED',
    pastorName: '한은혜',
    pastorPhone: '010-1234-5678',
    price: 800000,
    maximumParticipantCount: 30,
    description: '마닐라 빈민 지역 아동 교육 및 의료 봉사',
  },
  {
    groupName: '필리핀선교',
    order: 13,
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    participationStartDate: '2026-06-01',
    participationEndDate: '2026-09-15',
    status: 'ENROLLMENT_OPENED',
    pastorName: '한은혜',
    pastorPhone: '010-1234-5678',
    price: 850000,
    maximumParticipantCount: 30,
    description: '세부 지역 교회 건축 지원 및 아동 교육',
  },

  // ── 캄보디아선교 ──
  {
    groupName: '캄보디아선교',
    order: 3,
    startDate: '2026-03-09',
    endDate: '2026-03-15',
    participationStartDate: '2025-12-01',
    participationEndDate: '2026-02-28',
    status: 'IN_PROGRESS',
    pastorName: '최바울',
    pastorPhone: '010-2345-6789',
    price: 900000,
    maximumParticipantCount: 25,
    description: '프놈펜 고아원 방문 및 시엠립 건축 봉사',
  },
  {
    groupName: '캄보디아선교',
    order: 4,
    startDate: '2026-11-02',
    endDate: '2026-11-08',
    participationStartDate: '2026-07-01',
    participationEndDate: '2026-10-15',
    status: 'ENROLLMENT_OPENED',
    pastorName: '최바울',
    pastorPhone: '010-2345-6789',
    price: 950000,
    maximumParticipantCount: 25,
    description: '시엠립 지역 교회 개척 지원 및 아동 섬김',
  },

  // ── 몽골선교 ──
  {
    groupName: '몽골선교',
    order: 7,
    startDate: '2025-06-16',
    endDate: '2025-06-22',
    participationStartDate: '2025-03-01',
    participationEndDate: '2025-05-31',
    status: 'COMPLETED',
    pastorName: '윤사무엘',
    pastorPhone: '010-3456-7890',
    price: 750000,
    maximumParticipantCount: 20,
    description: '울란바토르 외곽 게르 마을 의료·교육 봉사',
  },
  {
    groupName: '몽골선교',
    order: 8,
    startDate: '2026-06-15',
    endDate: '2026-06-21',
    participationStartDate: '2026-03-01',
    participationEndDate: '2026-05-31',
    status: 'ENROLLMENT_OPENED',
    pastorName: '윤사무엘',
    pastorPhone: '010-3456-7890',
    price: 800000,
    maximumParticipantCount: 25,
    description: '울란바토르 현지 교회 협력 사역 및 게르 마을 봉사',
  },
];

async function seedMissionaries(
  groupMap: Map<string, string>,
  adminId: string,
) {
  const missionaryMap = new Map<string, string>(); // "35차 군선교" -> id

  for (const data of MISSIONARIES) {
    const groupId = groupMap.get(data.groupName);

    if (!groupId) {
      console.log(`  ⚠ 그룹 없음 (건너뜀): ${data.groupName}`);
      continue;
    }

    const name = `${data.order}차 ${data.groupName}`;

    const existing = await prisma.missionary.findFirst({
      where: {
        missionGroupId: groupId,
        order: data.order,
        deletedAt: null,
      },
    });

    if (existing) {
      console.log(`  ✓ 선교 이미 존재: ${name}`);
      missionaryMap.set(name, existing.id);
      continue;
    }

    const missionary = await prisma.missionary.create({
      data: {
        name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        participationStartDate: new Date(data.participationStartDate),
        participationEndDate: new Date(data.participationEndDate),
        status: data.status,
        pastorName: data.pastorName,
        pastorPhone: data.pastorPhone,
        price: data.price,
        maximumParticipantCount: data.maximumParticipantCount,
        description: data.description,
        order: data.order,
        missionGroupId: groupId,
        createdById: adminId,
      },
    });
    console.log(`  + 선교 생성: ${name} (${data.status})`);
    missionaryMap.set(name, missionary.id);
  }

  return missionaryMap;
}

// ============================================
// PARTICIPANT USERS (목 유저)
// ============================================

interface ParticipantUserSeed {
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  isBaptized: boolean;
  isCollegeStudent: boolean;
}

const PARTICIPANT_USERS: ParticipantUserSeed[] = [
  { name: '이수빈', email: 'subin@test.dev', gender: 'F', birthDate: '2001-03-15', phoneNumber: '010-1001-0001', isBaptized: true, isCollegeStudent: true },
  { name: '김민준', email: 'minjun@test.dev', gender: 'M', birthDate: '1999-07-22', phoneNumber: '010-1001-0002', isBaptized: true, isCollegeStudent: false },
  { name: '박서연', email: 'seoyeon@test.dev', gender: 'F', birthDate: '2002-11-03', phoneNumber: '010-1001-0003', isBaptized: true, isCollegeStudent: true },
  { name: '정우진', email: 'woojin@test.dev', gender: 'M', birthDate: '2000-01-18', phoneNumber: '010-1001-0004', isBaptized: true, isCollegeStudent: true },
  { name: '최예린', email: 'yerin@test.dev', gender: 'F', birthDate: '1998-05-30', phoneNumber: '010-1001-0005', isBaptized: true, isCollegeStudent: false },
  { name: '한지호', email: 'jiho@test.dev', gender: 'M', birthDate: '2001-09-12', phoneNumber: '010-1001-0006', isBaptized: false, isCollegeStudent: true },
  { name: '윤하은', email: 'haeun@test.dev', gender: 'F', birthDate: '2003-02-28', phoneNumber: '010-1001-0007', isBaptized: true, isCollegeStudent: true },
  { name: '장도현', email: 'dohyun@test.dev', gender: 'M', birthDate: '1997-12-05', phoneNumber: '010-1001-0008', isBaptized: true, isCollegeStudent: false },
  { name: '임서진', email: 'seojin@test.dev', gender: 'F', birthDate: '2000-08-19', phoneNumber: '010-1001-0009', isBaptized: true, isCollegeStudent: true },
  { name: '오준서', email: 'junseo@test.dev', gender: 'M', birthDate: '2002-04-07', phoneNumber: '010-1001-0010', isBaptized: false, isCollegeStudent: true },
  { name: '송유나', email: 'yuna@test.dev', gender: 'F', birthDate: '1999-10-25', phoneNumber: '010-1001-0011', isBaptized: true, isCollegeStudent: false },
  { name: '배현우', email: 'hyunwoo@test.dev', gender: 'M', birthDate: '2001-06-14', phoneNumber: '010-1001-0012', isBaptized: true, isCollegeStudent: true },
  { name: '류지원', email: 'jiwon@test.dev', gender: 'F', birthDate: '2000-03-21', phoneNumber: '010-1001-0013', isBaptized: true, isCollegeStudent: true },
  { name: '곽태민', email: 'taemin@test.dev', gender: 'M', birthDate: '1998-11-08', phoneNumber: '010-1001-0014', isBaptized: true, isCollegeStudent: false },
  { name: '문가영', email: 'gayoung@test.dev', gender: 'F', birthDate: '2003-07-16', phoneNumber: '010-1001-0015', isBaptized: false, isCollegeStudent: true },
  { name: '홍석현', email: 'seokhyun@test.dev', gender: 'M', birthDate: '2001-01-29', phoneNumber: '010-1001-0016', isBaptized: true, isCollegeStudent: true },
  { name: '신예지', email: 'yeji@test.dev', gender: 'F', birthDate: '1999-09-03', phoneNumber: '010-1001-0017', isBaptized: true, isCollegeStudent: false },
  { name: '조민석', email: 'minseok@test.dev', gender: 'M', birthDate: '2002-05-11', phoneNumber: '010-1001-0018', isBaptized: true, isCollegeStudent: true },
  { name: '강다인', email: 'dain@test.dev', gender: 'F', birthDate: '2000-12-22', phoneNumber: '010-1001-0019', isBaptized: true, isCollegeStudent: true },
  { name: '서준혁', email: 'junhyuk@test.dev', gender: 'M', birthDate: '1997-08-17', phoneNumber: '010-1001-0020', isBaptized: true, isCollegeStudent: false },
];

async function seedParticipantUsers() {
  const userIds: string[] = [];

  for (const data of PARTICIPANT_USERS) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 유저 이미 존재: ${data.name}`);
      userIds.push(existing.id);
      continue;
    }

    const hashedPassword = await bcrypt.hash('test1234', SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        provider: 'LOCAL',
        role: 'USER',
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        phoneNumber: data.phoneNumber,
        isBaptized: data.isBaptized,
      },
    });
    console.log(`  + 유저 생성: ${data.name}`);
    userIds.push(user.id);
  }

  return userIds;
}

// ============================================
// ATTENDANCE OPTIONS (참석 옵션)
// ============================================

async function seedAttendanceOptions(missionaryMap: Map<string, string>) {
  const optionMap = new Map<string, string[]>(); // missionaryId -> optionIds

  for (const [name, missionaryId] of missionaryMap) {
    const existing = await prisma.missionaryAttendanceOption.findFirst({
      where: { missionaryId, deletedAt: null },
    });

    if (existing) {
      const allOptions = await prisma.missionaryAttendanceOption.findMany({
        where: { missionaryId, deletedAt: null },
        orderBy: { order: 'asc' },
      });
      console.log(`  ✓ 참석 옵션 이미 존재: ${name} (${allOptions.length}개)`);
      optionMap.set(missionaryId, allOptions.map((o) => o.id));
      continue;
    }

    const options = [
      { type: 'FULL' as const, label: '전일 참석', order: 1 },
      { type: 'PARTIAL' as const, label: '부분 참석 (전반부)', order: 2 },
      { type: 'PARTIAL' as const, label: '부분 참석 (후반부)', order: 3 },
    ];

    const ids: string[] = [];
    for (const opt of options) {
      const created = await prisma.missionaryAttendanceOption.create({
        data: { ...opt, missionaryId },
      });
      ids.push(created.id);
    }
    console.log(`  + 참석 옵션 생성: ${name} (${ids.length}개)`);
    optionMap.set(missionaryId, ids);
  }

  return optionMap;
}

// ============================================
// PARTICIPATIONS (등록자)
// ============================================

const AFFILIATIONS = [
  '새일교회', '은혜교회', '사랑의교회', '영락교회', '소망교회',
  '한빛교회', '열린교회', '새벽교회', '감사교회', '믿음교회',
];

/**
 * 선교별 참가자 수 배분 (상태에 따라 다르게)
 */
function getParticipantCount(status: string, maxCount: number): number {
  switch (status) {
    case 'COMPLETED':
      return Math.min(Math.floor(maxCount * 0.8), 15);
    case 'IN_PROGRESS':
      return Math.min(Math.floor(maxCount * 0.6), 12);
    case 'ENROLLMENT_CLOSED':
      return Math.min(Math.floor(maxCount * 0.7), 14);
    case 'ENROLLMENT_OPENED':
      return Math.min(Math.floor(maxCount * 0.3), 8);
    default:
      return 5;
  }
}

async function seedParticipations(
  missionaryMap: Map<string, string>,
  optionMap: Map<string, string[]>,
  userIds: string[],
) {
  // 선교 정보를 가져와서 참가자 수 결정
  for (const [name, missionaryId] of missionaryMap) {
    const existingCount = await prisma.participation.count({
      where: { missionaryId, deletedAt: null },
    });

    if (existingCount > 0) {
      console.log(`  ✓ 등록자 이미 존재: ${name} (${existingCount}명)`);
      continue;
    }

    const missionary = await prisma.missionary.findUnique({
      where: { id: missionaryId },
    });

    if (!missionary) continue;

    const attendanceOptionIds = optionMap.get(missionaryId) ?? [];
    const targetCount = getParticipantCount(
      missionary.status,
      missionary.maximumParticipantCount ?? 30,
    );

    // 유저 풀에서 이 선교에 참가할 유저를 뽑음 (겹치지 않도록 offset 사용)
    const allMissionaryNames = [...missionaryMap.keys()];
    const missionaryIndex = allMissionaryNames.indexOf(name);
    const startIdx = (missionaryIndex * 3) % userIds.length;

    let created = 0;
    for (let i = 0; i < targetCount; i++) {
      const userIdx = (startIdx + i) % userIds.length;
      const userId = userIds[userIdx];
      const userData = PARTICIPANT_USERS[userIdx];

      // 같은 선교에 같은 유저가 중복 등록되지 않도록 확인
      const alreadyRegistered = await prisma.participation.findFirst({
        where: { missionaryId, userId, deletedAt: null },
      });
      if (alreadyRegistered) continue;

      const optionId = attendanceOptionIds.length > 0
        ? attendanceOptionIds[i % attendanceOptionIds.length]
        : undefined;

      const isPaid = missionary.status === 'COMPLETED'
        ? true
        : missionary.status === 'IN_PROGRESS'
          ? Math.random() > 0.3
          : Math.random() > 0.5;

      await prisma.participation.create({
        data: {
          name: userData.name,
          birthDate: userData.birthDate,
          applyFee: missionary.price ?? 0,
          isPaid,
          isOwnCar: Math.random() > 0.7,
          affiliation: AFFILIATIONS[i % AFFILIATIONS.length],
          attendanceOptionId: optionId,
          cohort: i < targetCount / 2 ? 1 : 2,
          hasPastParticipation: Math.random() > 0.6,
          isCollegeStudent: userData.isCollegeStudent,
          missionaryId,
          userId,
        },
      });
      created++;
    }

    // currentParticipantCount 업데이트
    await prisma.missionary.update({
      where: { id: missionaryId },
      data: { currentParticipantCount: created },
    });

    console.log(`  + 등록자 생성: ${name} (${created}명)`);
  }
}

// ============================================
// MISSIONARY REGIONS (연계지)
// ============================================

interface RegionSeed {
  groupName: string;
  name: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
  note?: string;
}

const REGIONS: RegionSeed[] = [
  // ── 군선교 연계지 ──
  {
    groupName: '군선교',
    name: '제1군단 사령부',
    pastorName: '이상훈 군목',
    pastorPhone: '010-2001-0001',
    addressBasic: '강원도 원주시 단구동',
    addressDetail: '제1군단 사령부 종교시설',
    note: '매주 수요일 오후 예배',
  },
  {
    groupName: '군선교',
    name: '제3사단',
    pastorName: '박준영 군목',
    pastorPhone: '010-2001-0002',
    addressBasic: '강원도 철원군 갈말읍',
    addressDetail: '제3사단 군종실',
    note: 'GOP 인접, 보안 절차 필요',
  },
  {
    groupName: '군선교',
    name: '제5사단',
    pastorName: '최동욱 군목',
    pastorPhone: '010-2001-0003',
    addressBasic: '강원도 인제군 북면',
    addressDetail: '제5사단 본부 군종병과',
    note: '산간 지역, 차량 이동 1시간',
  },
  {
    groupName: '군선교',
    name: '제7사단',
    pastorName: '김태호 군목',
    pastorPhone: '010-2001-0004',
    addressBasic: '강원도 화천군 화천읍',
    addressDetail: '제7사단 종교시설',
  },
  {
    groupName: '군선교',
    name: '수도기계화보병사단',
    pastorName: '정현석 군목',
    pastorPhone: '010-2001-0005',
    addressBasic: '경기도 고양시 덕양구',
    addressDetail: '수기사 군종실',
    note: '서울 근접, 접근성 우수',
  },

  // ── 농촌선교 연계지 ──
  {
    groupName: '농촌선교',
    name: '해남 은광교회',
    pastorName: '김복음 목사',
    pastorPhone: '010-2002-0001',
    addressBasic: '전남 해남군 해남읍 중앙로 42',
    addressDetail: '은광교회 본당',
    note: '숙소 30명 수용 가능',
  },
  {
    groupName: '농촌선교',
    name: '영주 새생명교회',
    pastorName: '이진호 목사',
    pastorPhone: '010-2002-0002',
    addressBasic: '경북 영주시 풍기읍 삼가로 15',
    addressDetail: '새생명교회 교육관',
    note: '인삼밭 농활 가능, 주차 넓음',
  },
  {
    groupName: '농촌선교',
    name: '홍성 열매교회',
    pastorName: '박은혜 전도사',
    pastorPhone: '010-2002-0003',
    addressBasic: '충남 홍성군 홍북읍 충남대로 218',
    addressDetail: '열매교회',
    note: '유기농 농장 협력',
  },
  {
    groupName: '농촌선교',
    name: '정읍 벧엘교회',
    pastorName: '한성민 목사',
    pastorPhone: '010-2002-0004',
    addressBasic: '전북 정읍시 칠보면 무성리 56',
    addressDetail: '벧엘교회',
  },

  // ── 도시선교 연계지 ──
  {
    groupName: '도시선교',
    name: '영등포 쪽방촌 쉼터',
    pastorName: '오세진 목사',
    pastorPhone: '010-2003-0001',
    addressBasic: '서울 영등포구 영등포동 618-97',
    addressDetail: '생명나눔의집 2층',
    note: '무료 급식 봉사 병행, 매주 화·목 운영',
  },
  {
    groupName: '도시선교',
    name: '동자동 노숙인 센터',
    pastorName: '구원석 목사',
    pastorPhone: '010-2003-0002',
    addressBasic: '서울 용산구 동자동 24-1',
    addressDetail: '따뜻한 나눔 센터',
    note: '저녁 식사 배식 봉사',
  },
  {
    groupName: '도시선교',
    name: '부산 동구 희망센터',
    pastorName: '장미소 전도사',
    pastorPhone: '010-2003-0003',
    addressBasic: '부산 동구 초량동 1189-3',
    addressDetail: '동구 자활센터 1층',
    note: '외국인 근로자 한국어 교실 병행',
  },

  // ── 청소년선교 연계지 ──
  {
    groupName: '청소년선교',
    name: '양평 비전수련원',
    pastorName: '강수현 목사',
    pastorPhone: '010-2004-0001',
    addressBasic: '경기도 양평군 양서면 목왕리 152',
    addressDetail: '비전수련원 본관',
    note: '150명 숙박 가능, 체육관 보유',
  },
  {
    groupName: '청소년선교',
    name: '가평 은혜캠프장',
    pastorName: '임승훈 목사',
    pastorPhone: '010-2004-0002',
    addressBasic: '경기도 가평군 상면 행현리 310',
    addressDetail: '은혜캠프장',
    note: '계곡 인접, 여름 캠프 적합',
  },
  {
    groupName: '청소년선교',
    name: '천안 새싹지역아동센터',
    pastorName: '윤미래 사모',
    pastorPhone: '010-2004-0003',
    addressBasic: '충남 천안시 동남구 신부동 120-5',
    addressDetail: '새싹센터 3층',
    note: '방과후 학습 멘토링 30명',
  },

  // ── 필리핀선교 연계지 ──
  {
    groupName: '필리핀선교',
    name: 'Tondo Community Church',
    pastorName: 'Pastor Manuel Cruz',
    pastorPhone: '+63-917-123-4567',
    addressBasic: 'Tondo, Manila, Philippines',
    addressDetail: 'Tondo Community Church',
    note: '마닐라 빈민가 중심, 아동 200명 출석',
  },
  {
    groupName: '필리핀선교',
    name: 'Cebu Grace Church',
    pastorName: 'Pastor David Lim',
    pastorPhone: '+63-917-234-5678',
    addressBasic: 'Cebu City, Cebu, Philippines',
    addressDetail: 'Grace Church Main Hall',
    note: '세부 현지 파트너 교회, 건축 봉사 장소',
  },
  {
    groupName: '필리핀선교',
    name: 'Payatas Hope Center',
    pastorName: 'Sister Maria Santos',
    pastorPhone: '+63-917-345-6789',
    addressBasic: 'Payatas, Quezon City, Philippines',
    addressDetail: 'Hope Center',
    note: '쓰레기 매립지 인근, 의료 봉사 중심',
  },

  // ── 캄보디아선교 연계지 ──
  {
    groupName: '캄보디아선교',
    name: 'Phnom Penh Bethel Church',
    pastorName: 'Pastor Sokha Chan',
    pastorPhone: '+855-12-345-678',
    addressBasic: 'Phnom Penh, Cambodia',
    addressDetail: 'Bethel Church, Street 271',
    note: '프놈펜 시내, 한인 선교사 협력',
  },
  {
    groupName: '캄보디아선교',
    name: 'Siem Reap Grace Orphanage',
    pastorName: '김선교 선교사',
    pastorPhone: '+855-12-456-789',
    addressBasic: 'Siem Reap, Cambodia',
    addressDetail: 'Grace Orphanage',
    note: '고아원 아동 45명, 건축 봉사 진행 중',
  },
  {
    groupName: '캄보디아선교',
    name: 'Battambang Village School',
    pastorName: 'Pastor Dara Phan',
    pastorPhone: '+855-12-567-890',
    addressBasic: 'Battambang, Cambodia',
    addressDetail: 'Village School',
    note: '농촌 마을 학교, 영어 교육 봉사',
  },

  // ── 몽골선교 연계지 ──
  {
    groupName: '몽골선교',
    name: 'UB Grace Church',
    pastorName: 'Pastor Batbold',
    pastorPhone: '+976-9911-2345',
    addressBasic: 'Ulaanbaatar, Mongolia',
    addressDetail: 'Bayangol District, Grace Church',
    note: '울란바토르 중심부, 한몽 이중 예배',
  },
  {
    groupName: '몽골선교',
    name: 'Ger Village Hope Center',
    pastorName: '이몽골 선교사',
    pastorPhone: '+976-9922-3456',
    addressBasic: 'Songino Khairkhan, Ulaanbaatar',
    addressDetail: 'Hope Center (게르 마을)',
    note: '게르 마을 아동 교육 및 의료, 겨울 영하 30도 대비 필요',
  },
  {
    groupName: '몽골선교',
    name: 'Darkhan New Life Church',
    pastorName: 'Pastor Munkh',
    pastorPhone: '+976-9933-4567',
    addressBasic: 'Darkhan, Mongolia',
    addressDetail: 'New Life Church',
    note: '울란바토르 북쪽 3시간, 지방 교회 협력',
  },
];

async function seedRegions(groupMap: Map<string, string>) {
  for (const data of REGIONS) {
    const groupId = groupMap.get(data.groupName);

    if (!groupId) {
      console.log(`  ⚠ 그룹 없음 (건너뜀): ${data.groupName}`);
      continue;
    }

    const existing = await prisma.missionaryRegion.findFirst({
      where: { name: data.name, missionGroupId: groupId, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 연계지 이미 존재: [${data.groupName}] ${data.name}`);
      continue;
    }

    await prisma.missionaryRegion.create({
      data: {
        name: data.name,
        pastorName: data.pastorName,
        pastorPhone: data.pastorPhone,
        addressBasic: data.addressBasic,
        addressDetail: data.addressDetail,
        note: data.note,
        missionGroupId: groupId,
      },
    });
    console.log(`  + 연계지 생성: [${data.groupName}] ${data.name}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🌱 Seed 시작...\n');

  console.log('[관리자 계정]');
  const admin = await seedAdminUser();

  console.log('\n[약관]');
  await seedTerms();

  console.log('\n[선교 그룹]');
  const groupMap = await seedMissionGroups();

  console.log('\n[선교 차수]');
  const missionaryMap = await seedMissionaries(groupMap, admin.id);

  console.log('\n[참가자 유저]');
  const userIds = await seedParticipantUsers();

  console.log('\n[참석 옵션]');
  const optionMap = await seedAttendanceOptions(missionaryMap);

  console.log('\n[등록자]');
  await seedParticipations(missionaryMap, optionMap, userIds);

  console.log('\n[연계지]');
  await seedRegions(groupMap);

  console.log('\n✅ Seed 완료');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
