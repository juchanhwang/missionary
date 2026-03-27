import { randomUUID } from 'crypto';

import type {
  FormFieldCreateInput,
  FormFieldRepository,
  FormFieldUpdateInput,
} from '@/missionary/repositories/form-field-repository.interface';

import type { MissionaryFormField } from '../../../prisma/generated/prisma';

export class FakeFormFieldRepository implements FormFieldRepository {
  private store = new Map<string, MissionaryFormField>();
  private answerCounts = new Map<string, number>();

  async create(data: FormFieldCreateInput): Promise<MissionaryFormField> {
    const now = new Date();
    const entity: MissionaryFormField = {
      id: randomUUID(),
      fieldType: data.fieldType,
      label: data.label,
      placeholder: data.placeholder ?? null,
      isRequired: data.isRequired,
      order: data.order,
      options: (data.options ?? null) as MissionaryFormField['options'],
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

  async findByMissionary(missionaryId: string): Promise<MissionaryFormField[]> {
    return [...this.store.values()]
      .filter((f) => f.missionaryId === missionaryId && f.deletedAt === null)
      .sort((a, b) => a.order - b.order);
  }

  async findById(id: string): Promise<MissionaryFormField | null> {
    const entity = this.store.get(id);
    return entity && entity.deletedAt === null ? entity : null;
  }

  async update(
    id: string,
    data: FormFieldUpdateInput,
  ): Promise<MissionaryFormField> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`FormField not found: ${id}`);
    const updated: MissionaryFormField = {
      ...existing,
      ...data,
      options: (data.options !== undefined
        ? data.options
        : existing.options) as MissionaryFormField['options'],
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<MissionaryFormField> {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`FormField not found: ${id}`);
    const deleted = { ...existing, deletedAt: new Date() };
    this.store.set(id, deleted);
    return deleted;
  }

  async reorderBulk(items: { id: string; order: number }[]): Promise<void> {
    for (const item of items) {
      const entity = this.store.get(item.id);
      if (entity) {
        this.store.set(item.id, { ...entity, order: item.order });
      }
    }
  }

  async countAnswersByFields(
    fieldIds: string[],
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const id of fieldIds) {
      const count = this.answerCounts.get(id);
      if (count !== undefined && count > 0) {
        result[id] = count;
      }
    }
    return result;
  }

  setAnswerCount(fieldId: string, count: number): void {
    this.answerCounts.set(fieldId, count);
  }

  clear(): void {
    this.store.clear();
    this.answerCounts.clear();
  }
}
