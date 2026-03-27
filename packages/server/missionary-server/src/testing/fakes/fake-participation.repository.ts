import { randomUUID } from 'crypto';

import type { BaseRepository } from '@/common/repositories';
import type {
  EnrollmentSummary,
  FindAllFilters,
  FindAllResult,
  ParticipationCreateInput,
  ParticipationRepository,
  ParticipationUpdateInput,
  ParticipationWithRelations,
} from '@/participation/repositories/participation-repository.interface';

import type {
  Missionary,
  MissionaryAttendanceOption,
  Participation,
  ParticipationFormAnswer,
  Team,
  User,
} from '../../../prisma/generated/prisma';

export class FakeParticipationRepository
  implements
    ParticipationRepository,
    BaseRepository<
      Participation,
      ParticipationCreateInput,
      ParticipationUpdateInput
    >
{
  private store = new Map<string, Participation>();

  /**
   * missionary / user 조회를 위한 저장소.
   * 테스트에서 `setMissionary(id, missionary)`, `setUser(id, user)` 로 세팅한다.
   */
  private missionaries = new Map<string, Missionary>();
  private users = new Map<string, User>();
  private teams = new Map<string, Team>();
  private attendanceOptions = new Map<string, MissionaryAttendanceOption>();
  private formAnswers = new Map<string, ParticipationFormAnswer[]>();

  // --- BaseRepository 구현 ---

  async create(data: ParticipationCreateInput): Promise<Participation> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    return entity;
  }

  async findMany(args?: {
    where?: Partial<Participation>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Participation[]> {
    let results = [...this.store.values()];
    if (args?.where) {
      results = results.filter((item) => this.matchesWhere(item, args.where!));
    }
    return results;
  }

  async findUnique(
    where: Partial<Participation>,
  ): Promise<Participation | null> {
    if ('id' in where && typeof where.id === 'string') {
      const item = this.store.get(where.id);
      return item && this.matchesWhere(item, where) ? item : null;
    }
    return (
      [...this.store.values()].find((item) => this.matchesWhere(item, where)) ??
      null
    );
  }

  async findFirst(
    where: Partial<Participation>,
  ): Promise<Participation | null> {
    return (
      [...this.store.values()].find((item) => this.matchesWhere(item, where)) ??
      null
    );
  }

  async update(
    where: Partial<Participation>,
    data: ParticipationUpdateInput,
  ): Promise<Participation> {
    const existing = await this.findUnique(where);
    if (!existing) {
      throw new Error(
        `Participation not found for update: ${JSON.stringify(where)}`,
      );
    }
    const updated = {
      ...existing,
      ...this.resolveAtomicOperations(existing, data),
      updatedAt: new Date(),
    } as Participation;
    this.store.set(updated.id, updated);
    return updated;
  }

  async delete(where: Partial<Participation>): Promise<Participation> {
    const existing = await this.findUnique(where);
    if (!existing) {
      throw new Error(
        `Participation not found for delete: ${JSON.stringify(where)}`,
      );
    }
    this.store.delete(existing.id);
    return existing;
  }

  async count(where?: Partial<Participation>): Promise<number> {
    if (!where) return this.store.size;
    return [...this.store.values()].filter((item) =>
      this.matchesWhere(item, where),
    ).length;
  }

  // --- ParticipationRepository 전용 메서드 ---

  async createWithRelations(
    data: ParticipationCreateInput,
  ): Promise<ParticipationWithRelations> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    return this.withRelations(entity);
  }

  async findAllFiltered(filters: FindAllFilters): Promise<FindAllResult> {
    let results = [...this.store.values()].filter((p) => p.deletedAt === null);

    if (filters.missionaryId) {
      results = results.filter((p) => p.missionaryId === filters.missionaryId);
    }

    if (filters.userId) {
      results = results.filter((p) => p.userId === filters.userId);
    }

    if (filters.isPaid !== undefined) {
      results = results.filter((p) => p.isPaid === filters.isPaid);
    }

    if (filters.attendanceType) {
      results = results.filter((p) => {
        if (!p.attendanceOptionId) return false;
        const option = this.attendanceOptions.get(p.attendanceOptionId);
        return option?.type === filters.attendanceType;
      });
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }

    const sorted = results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = sorted.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit;
    const paged =
      limit !== undefined
        ? sorted.slice(offset, offset + limit)
        : sorted.slice(offset);

    return {
      data: paged.map((p) => this.withRelations(p)),
      total,
    };
  }

  async findOneWithRelations(
    id: string,
  ): Promise<ParticipationWithRelations | null> {
    const entity = this.store.get(id);
    if (!entity || entity.deletedAt !== null) return null;
    return this.withRelations(entity);
  }

  async updateWithRelations(
    id: string,
    data: ParticipationUpdateInput,
  ): Promise<ParticipationWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Participation not found: ${id}`);
    }
    const updated = {
      ...existing,
      ...this.resolveAtomicOperations(existing, data),
      updatedAt: new Date(),
    } as Participation;
    this.store.set(id, updated);
    return this.withRelations(updated);
  }

  async approvePayments(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const entity = this.store.get(id);
      if (entity) {
        this.store.set(id, { ...entity, isPaid: true, updatedAt: new Date() });
        count++;
      }
    }
    return count;
  }

  async softDeleteWithCountDecrement(
    id: string,
    userId: string,
    missionaryId: string,
  ): Promise<void> {
    const entity = this.store.get(id);
    if (!entity) {
      throw new Error(`Participation not found: ${id}`);
    }
    this.store.set(id, {
      ...entity,
      deletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    });

    const missionary = this.missionaries.get(missionaryId);
    if (missionary) {
      this.missionaries.set(missionaryId, {
        ...missionary,
        currentParticipantCount: missionary.currentParticipantCount - 1,
      });
    }
  }

  async createAndIncrementCount(
    data: ParticipationCreateInput,
    missionaryId: string,
  ): Promise<ParticipationWithRelations> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);

    // Prisma 동작과 일치: participation.create + include 시점에는
    // 아직 missionary count가 증가하지 않은 상태의 값을 반환한다.
    const result = this.withRelations(entity);

    const missionary = this.missionaries.get(missionaryId);
    if (missionary) {
      this.missionaries.set(missionaryId, {
        ...missionary,
        currentParticipantCount: missionary.currentParticipantCount + 1,
      });
    }

    return result;
  }

  async getEnrollmentSummary(missionaryId: string): Promise<EnrollmentSummary> {
    const active = [...this.store.values()].filter(
      (p) => p.missionaryId === missionaryId && p.deletedAt === null,
    );

    const missionary = this.missionaries.get(missionaryId);

    let fullAttendanceCount = 0;
    let partialAttendanceCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    for (const p of active) {
      if (p.isPaid) paidCount++;
      else unpaidCount++;

      if (p.attendanceOptionId) {
        const option = this.attendanceOptions.get(p.attendanceOptionId);
        if (option?.type === 'FULL') fullAttendanceCount++;
        else if (option?.type === 'PARTIAL') partialAttendanceCount++;
      }
    }

    return {
      totalParticipants: active.length,
      maxParticipants: missionary?.maximumParticipantCount ?? null,
      paidCount,
      unpaidCount,
      fullAttendanceCount,
      partialAttendanceCount,
    };
  }

  // --- 테스트 헬퍼 ---

  setMissionary(id: string, missionary: Missionary): void {
    this.missionaries.set(id, missionary);
  }

  setUser(id: string, user: User): void {
    this.users.set(id, user);
  }

  setTeam(id: string, team: Team): void {
    this.teams.set(id, team);
  }

  setAttendanceOption(id: string, option: MissionaryAttendanceOption): void {
    this.attendanceOptions.set(id, option);
  }

  setFormAnswers(
    participationId: string,
    answers: ParticipationFormAnswer[],
  ): void {
    this.formAnswers.set(participationId, answers);
  }

  clear(): void {
    this.store.clear();
    this.missionaries.clear();
    this.users.clear();
    this.teams.clear();
    this.attendanceOptions.clear();
    this.formAnswers.clear();
  }

  getAll(): Participation[] {
    return [...this.store.values()];
  }

  // --- 내부 유틸리티 ---

  private buildEntity(data: ParticipationCreateInput): Participation {
    const now = new Date();
    return {
      id: (data as { id?: string }).id ?? randomUUID(),
      name: data.name as string,
      birthDate: data.birthDate as string,
      applyFee: (data.applyFee as number) ?? null,
      isPaid: (data.isPaid as boolean) ?? false,
      identificationNumber: (data.identificationNumber as string) ?? null,
      isOwnCar: (data.isOwnCar as boolean) ?? false,
      missionaryId: data.missionaryId as string,
      userId: data.userId as string,
      memberId: (data.memberId as string) ?? null,
      teamId: (data.teamId as string) ?? null,
      affiliation: (data.affiliation as string) ?? null,
      attendanceOptionId: (data.attendanceOptionId as string) ?? null,
      cohort: (data.cohort as number) ?? null,
      hasPastParticipation: (data.hasPastParticipation as boolean) ?? null,
      isCollegeStudent: (data.isCollegeStudent as boolean) ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: (data.createdBy as string) ?? null,
      updatedBy: (data.updatedBy as string) ?? null,
      version: (data.version as number) ?? 0,
      deletedAt: null,
    };
  }

  private withRelations(entity: Participation): ParticipationWithRelations {
    const missionary = this.missionaries.get(entity.missionaryId);
    const user = this.users.get(entity.userId);

    if (!missionary) {
      throw new Error(
        `Missionary not found in fake store: ${entity.missionaryId}. ` +
          `Call setMissionary() before using relations.`,
      );
    }

    if (!user) {
      throw new Error(
        `User not found in fake store: ${entity.userId}. ` +
          `Call setUser() before using relations.`,
      );
    }

    const team = entity.teamId ? (this.teams.get(entity.teamId) ?? null) : null;
    const attendanceOption = entity.attendanceOptionId
      ? (this.attendanceOptions.get(entity.attendanceOptionId) ?? null)
      : null;
    const answers = this.formAnswers.get(entity.id) ?? [];

    return {
      ...entity,
      missionary,
      user,
      team,
      attendanceOption,
      formAnswers: answers,
    };
  }

  /**
   * Prisma 원자 연산자({ increment, decrement, set })를
   * 실제 값으로 변환한다.
   */
  private resolveAtomicOperations(
    existing: Participation,
    data: ParticipationUpdateInput,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as object)) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        const op = value as Record<string, unknown>;
        const currentVal = (existing as Record<string, unknown>)[key];
        const numCurrent = typeof currentVal === 'number' ? currentVal : 0;

        if ('increment' in op && typeof op.increment === 'number') {
          resolved[key] = numCurrent + op.increment;
        } else if ('decrement' in op && typeof op.decrement === 'number') {
          resolved[key] = numCurrent - op.decrement;
        } else if ('set' in op) {
          resolved[key] = op.set;
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  private matchesWhere(
    item: Participation,
    where: Partial<Participation>,
  ): boolean {
    return Object.entries(where).every(
      ([key, value]) => (item as Record<string, unknown>)[key] === value,
    );
  }
}
