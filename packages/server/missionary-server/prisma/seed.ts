import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

import { PrismaClient } from './generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function seedAdminUser() {
  const adminLoginId = 'admin';
  const existing = await prisma.user.findFirst({
    where: { loginId: adminLoginId, role: 'ADMIN', deletedAt: null },
  });

  if (existing) {
    console.log(
      `  ✓ 관리자 계정 이미 존재 (${existing.email ?? adminLoginId})`,
    );
    return;
  }

  const hashedPassword = await bcrypt.hash('admin1234', SALT_ROUNDS);

  await prisma.user.create({
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
}

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

async function seedMissionaryRegions() {
  const regions = [
    { name: '국내', type: 'DOMESTIC' as const },
    { name: '해외', type: 'ABROAD' as const },
  ];

  for (const data of regions) {
    const existing = await prisma.missionaryRegion.findFirst({
      where: { name: data.name, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 선교 지역 이미 존재: ${data.name}`);
      continue;
    }

    await prisma.missionaryRegion.create({ data });
    console.log(`  + 선교 지역 생성: ${data.name}`);
  }
}

async function seedMissionGroups() {
  const groups = [{ name: '군선교', type: 'DOMESTIC' as const }];

  for (const data of groups) {
    const existing = await prisma.missionGroup.findFirst({
      where: { name: data.name, deletedAt: null },
    });

    if (existing) {
      console.log(`  ✓ 선교 그룹 이미 존재: ${data.name}`);
      continue;
    }

    await prisma.missionGroup.create({ data });
    console.log(`  + 선교 그룹 생성: ${data.name}`);
  }
}

async function main() {
  console.log('🌱 Seed 시작...\n');

  console.log('[관리자 계정]');
  await seedAdminUser();

  console.log('\n[약관]');
  await seedTerms();

  console.log('\n[선교 지역]');
  await seedMissionaryRegions();

  console.log('\n[선교 그룹]');
  await seedMissionGroups();

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
