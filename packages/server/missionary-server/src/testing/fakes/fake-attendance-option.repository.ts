import { randomUUID } from 'crypto';

import type {
  AttendanceOptionCreateInput,
  AttendanceOptionRepository,
  AttendanceOptionUpdateInput,
} from '@/missionary/repositories/attendance-option-repository.interface';

import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

export class FakeAttendanceOptionRepository implements AttendanceOptionRepository {
  private store = new Map<string, MissionaryAttendanceOption>();
  private participationCounts = new Map<string, number>();

  async create(
    data: AttendanceOptionCreateInput,
  ): Promise<MissionaryAttendanceOption> {
    const now = new Date();
    const entity: MissionaryAttendanceOption = {
      id: randomUUID(),
      type: data.type,
      label: data.label,
      order: data.order,
      missionaryId: data.missionaryId,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
    this.store.set(entity.id, entity);
    return entity;
  }

  async findByMissionary(
    missionaryId: string,
  ): Promise<MissionaryAttendanceOption[]> {
    return [...this.store.values()]
      .filter((o) => o.missionaryId === missionaryId && o.deletedAt === null)
      .sort((a, b) => a.order - b.order);
  }

  async findById(id: string): Promise<MissionaryAttendanceOption | null> {
    const entity = this.store.get(id);
    return entity && entity.deletedAt === null ? entity : null;
  }

  async update(
    id: string,
    data: AttendanceOptionUpdateInput,
  ): Promise<MissionaryAttendanceOption> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`AttendanceOption not found: ${id}`);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<MissionaryAttendanceOption> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`AttendanceOption not found: ${id}`);
    const deleted = { ...existing, deletedAt: new Date() };
    this.store.set(id, deleted);
    return deleted;
  }

  async countParticipationsByOption(optionId: string): Promise<number> {
    return this.participationCounts.get(optionId) ?? 0;
  }

  setParticipationCount(optionId: string, count: number): void {
    this.participationCounts.set(optionId, count);
  }

  clear(): void {
    this.store.clear();
    this.participationCounts.clear();
  }
}
