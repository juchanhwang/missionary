import type {
  TeamCreateInput,
  TeamMemberWithUser,
  TeamRepository,
  TeamUpdateInput,
  TeamWithRelations,
} from '@/team/repositories';

import { BaseFakeRepository } from './base-fake-repository';

import type {
  Church,
  Missionary,
  Team,
  TeamMember,
  User,
} from '../../../prisma/generated/prisma';

/**
 * TeamRepository의 in-memory Fake 구현.
 * 테스트에서 PrismaTeamRepository 대신 사용한다.
 */
export class FakeTeamRepository
  extends BaseFakeRepository<Team, TeamCreateInput, TeamUpdateInput>
  implements TeamRepository
{
  private members = new Map<string, (TeamMember & { user: User })[]>();

  // 테스트 헬퍼: 관계 데이터를 미리 세팅
  private missionaries = new Map<string, Missionary>();
  private churches = new Map<string, Church>();
  private users = new Map<string, User>();

  /** 테스트에서 Missionary 데이터를 미리 세팅한다 */
  seedMissionary(missionary: Missionary): void {
    this.missionaries.set(missionary.id, missionary);
  }

  /** 테스트에서 Church 데이터를 미리 세팅한다 */
  seedChurch(church: Church): void {
    this.churches.set(church.id, church);
  }

  /** 테스트에서 User 데이터를 미리 세팅한다 */
  seedUser(user: User): void {
    this.users.set(user.id, user);
  }

  override clear(): void {
    super.clear();
    this.members.clear();
    this.missionaries.clear();
    this.churches.clear();
    this.users.clear();
  }

  protected buildEntity(data: TeamCreateInput): Team {
    const now = this.now();
    return {
      id: this.generateId(),
      teamName: data.teamName ?? '',
      leaderUserId: data.leaderUserId ?? '',
      leaderUserName: data.leaderUserName ?? '',
      missionaryId: data.missionaryId ?? '',
      churchId: data.churchId ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: data.updatedBy ?? null,
      version: data.version ?? 0,
      deletedAt: null,
    };
  }

  async createWithRelations(data: TeamCreateInput): Promise<TeamWithRelations> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    this.members.set(entity.id, []);
    return this.toWithRelations(entity);
  }

  async findAll(missionaryId?: string): Promise<TeamWithRelations[]> {
    let results = [...this.store.values()];

    if (missionaryId) {
      results = results.filter((t) => t.missionaryId === missionaryId);
    }

    // orderBy createdAt desc
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return results.map((t) => this.toWithRelations(t));
  }

  async findWithMembers(id: string): Promise<TeamWithRelations | null> {
    const team = this.store.get(id);
    if (!team) return null;
    return this.toWithRelations(team);
  }

  async updateWithRelations(
    id: string,
    data: TeamUpdateInput,
  ): Promise<TeamWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Team not found for update: ${id}`);
    }

    const updated: Team = {
      ...existing,
      ...this.flattenUpdateInput(data),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return this.toWithRelations(updated);
  }

  async addMembers(teamId: string, userIds: string[]): Promise<void> {
    const existing = this.members.get(teamId) ?? [];
    const now = this.now();

    for (const userId of userIds) {
      const user = this.users.get(userId) ?? this.stubUser(userId);
      existing.push({
        id: this.generateId(),
        teamId,
        userId,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        updatedBy: null,
        version: 0,
        deletedAt: null,
        user,
      });
    }

    this.members.set(teamId, existing);
  }

  async softDeleteMembers(teamId: string, userIds: string[]): Promise<void> {
    const existing = this.members.get(teamId) ?? [];
    const now = new Date();

    for (const member of existing) {
      if (userIds.includes(member.userId) && member.deletedAt === null) {
        member.deletedAt = now;
      }
    }

    this.members.set(teamId, existing);
  }

  // 내부 헬퍼
  private toWithRelations(team: Team): TeamWithRelations {
    const missionary =
      this.missionaries.get(team.missionaryId) ??
      this.stubMissionary(team.missionaryId);

    const church = team.churchId
      ? (this.churches.get(team.churchId) ?? this.stubChurch(team.churchId))
      : null;

    const teamMembers: TeamMemberWithUser[] = (
      this.members.get(team.id) ?? []
    ).filter((m) => m.deletedAt === null);

    return {
      ...team,
      missionary,
      church,
      teamMembers,
    };
  }

  private flattenUpdateInput(data: TeamUpdateInput): Partial<Team> {
    const flat: Partial<Team> = {};

    if ('teamName' in data && data.teamName !== undefined) {
      flat.teamName = data.teamName as string;
    }
    if ('leaderUserId' in data && data.leaderUserId !== undefined) {
      flat.leaderUserId = data.leaderUserId as string;
    }
    if ('leaderUserName' in data && data.leaderUserName !== undefined) {
      flat.leaderUserName = data.leaderUserName as string;
    }
    if ('missionary' in data && data.missionary) {
      const conn = data.missionary as { connect?: { id: string } };
      if (conn.connect) {
        flat.missionaryId = conn.connect.id;
      }
    }
    if ('church' in data && data.church !== undefined) {
      const rel = data.church as {
        connect?: { id: string };
        disconnect?: boolean;
      } | null;
      if (rel && 'connect' in rel && rel.connect) {
        flat.churchId = rel.connect.id;
      } else if (rel && 'disconnect' in rel && rel.disconnect) {
        flat.churchId = null;
      }
    }

    return flat;
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

  private stubChurch(id: string): Church {
    return {
      id,
      name: `Church ${id}`,
      pastorName: null,
      pastorPhone: null,
      addressBasic: null,
      addressDetail: null,
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
