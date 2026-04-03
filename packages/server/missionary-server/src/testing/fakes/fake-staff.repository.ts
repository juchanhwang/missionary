import type {
  StaffCreateInput,
  StaffRepository,
  StaffUpdateInput,
  StaffWithRelations,
} from '@/staff/repositories';

import { BaseFakeRepository } from './base-fake-repository';

import type {
  Missionary,
  MissionaryStaff,
  User,
} from '../../../prisma/generated/prisma';

/**
 * StaffRepository의 in-memory Fake 구현.
 * 테스트에서 PrismaStaffRepository 대신 사용한다.
 */
export class FakeStaffRepository
  extends BaseFakeRepository<
    MissionaryStaff,
    StaffCreateInput,
    StaffUpdateInput
  >
  implements StaffRepository
{
  // 테스트 헬퍼: 관계 데이터를 미리 세팅
  private missionaries = new Map<string, Missionary>();
  private users = new Map<string, User>();

  /** 테스트에서 Missionary 데이터를 미리 세팅한다 */
  seedMissionary(missionary: Missionary): void {
    this.missionaries.set(missionary.id, missionary);
  }

  /** 테스트에서 User 데이터를 미리 세팅한다 */
  seedUser(user: User): void {
    this.users.set(user.id, user);
  }

  override clear(): void {
    super.clear();
    this.missionaries.clear();
    this.users.clear();
  }

  protected buildEntity(data: StaffCreateInput): MissionaryStaff {
    const now = this.now();
    return {
      id: this.generateId(),
      missionaryId: data.missionaryId,
      userId: data.userId,
      role: data.role,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: data.updatedBy ?? null,
      version: data.version ?? 0,
      deletedAt: null,
    };
  }

  async findByMissionaryAndUser(
    missionaryId: string,
    userId: string,
  ): Promise<MissionaryStaff | null> {
    return (
      [...this.store.values()].find(
        (s) => s.missionaryId === missionaryId && s.userId === userId,
      ) ?? null
    );
  }

  async createWithRelations(
    data: StaffCreateInput,
  ): Promise<StaffWithRelations> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    return this.toWithRelations(entity);
  }

  async findByMissionary(missionaryId: string): Promise<StaffWithRelations[]> {
    const results = [...this.store.values()]
      .filter((s) => s.missionaryId === missionaryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return results.map((s) => this.toWithRelations(s));
  }

  async findByIdWithRelations(id: string): Promise<StaffWithRelations | null> {
    const staff = this.store.get(id);
    if (!staff) return null;
    return this.toWithRelations(staff);
  }

  async updateWithRelations(
    id: string,
    data: StaffUpdateInput,
  ): Promise<StaffWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Staff not found for update: ${id}`);
    }

    const updated: MissionaryStaff = {
      ...existing,
      ...(data as object),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return this.toWithRelations(updated);
  }

  async deleteWithRelations(id: string): Promise<StaffWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Staff not found for delete: ${id}`);
    }
    this.store.delete(id);
    return this.toWithRelations(existing);
  }

  // 내부 헬퍼
  private toWithRelations(staff: MissionaryStaff): StaffWithRelations {
    const missionary =
      this.missionaries.get(staff.missionaryId) ??
      this.stubMissionary(staff.missionaryId);

    const user = this.users.get(staff.userId) ?? this.stubUser(staff.userId);

    return {
      ...staff,
      missionary,
      user,
    };
  }

  private stubMissionary(id: string): Missionary {
    return {
      id,
      name: `Missionary ${id}`,
      startDate: new Date(),
      endDate: new Date(),
      pastorName: null,
      pastorPhone: null,
      participationStartDate: null,
      participationEndDate: null,
      price: null,
      description: null,
      maximumParticipantCount: null,
      currentParticipantCount: 0,
      bankName: null,
      bankAccountNumber: null,
      bankAccountHolder: null,
      status: 'ENROLLMENT_OPENED',
      isAcceptingResponses: true,
      closedMessage: null,
      missionGroupId: null,
      createdById: id,
      order: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
  }

  private stubUser(id: string): User {
    return {
      id,
      email: `user-${id}@test.com`,
      name: `User ${id}`,
      password: null,
      provider: 'LOCAL',
      providerId: null,
      role: 'USER',
      loginId: null,
      identityNumber: null,
      phoneNumber: null,
      birthDate: null,
      gender: null,
      isBaptized: false,
      baptizedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
  }
}
