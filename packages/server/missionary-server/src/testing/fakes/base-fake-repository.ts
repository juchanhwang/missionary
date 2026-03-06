import { randomUUID } from 'crypto';

import type { BaseRepository } from '@/common/repositories';

/**
 * Fake Repository 기본 구현.
 * in-memory Map 기반으로, 도메인 Fake Repository가 확장한다.
 *
 * @typeParam T - 엔티티 타입 (id, createdAt, updatedAt 필드 필수)
 * @typeParam CreateInput - 생성 입력 타입
 * @typeParam UpdateInput - 수정 입력 타입
 */
export abstract class BaseFakeRepository<
  T extends { id: string; createdAt: Date; updatedAt: Date },
  CreateInput,
  UpdateInput,
> implements BaseRepository<T, CreateInput, UpdateInput> {
  protected store = new Map<string, T>();

  async create(data: CreateInput): Promise<T> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    return entity;
  }

  async findMany(args?: {
    where?: Partial<T>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<T[]> {
    let results = [...this.store.values()];
    if (args?.where) {
      results = results.filter((item) => this.matchesWhere(item, args.where!));
    }
    if (args?.orderBy) {
      const entries = Object.entries(args.orderBy);
      if (entries.length > 0) {
        const [key, direction] = entries[0];
        results.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[key];
          const bVal = (b as Record<string, unknown>)[key];
          if (aVal instanceof Date && bVal instanceof Date) {
            return direction === 'asc'
              ? aVal.getTime() - bVal.getTime()
              : bVal.getTime() - aVal.getTime();
          }
          const aStr = String(aVal ?? '');
          const bStr = String(bVal ?? '');
          if (aStr < bStr) return direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return results;
  }

  async findUnique(where: Partial<T>): Promise<T | null> {
    if ('id' in where && typeof where.id === 'string') {
      const item = this.store.get(where.id);
      return item && this.matchesWhere(item, where) ? item : null;
    }
    return (
      [...this.store.values()].find((item) => this.matchesWhere(item, where)) ??
      null
    );
  }

  async findFirst(where: Partial<T>): Promise<T | null> {
    return (
      [...this.store.values()].find((item) => this.matchesWhere(item, where)) ??
      null
    );
  }

  async update(where: Partial<T>, data: UpdateInput): Promise<T> {
    const existing = await this.findUnique(where);
    if (!existing) {
      throw new Error(`Entity not found for update: ${JSON.stringify(where)}`);
    }
    const updated = {
      ...existing,
      ...(data as object),
      updatedAt: new Date(),
    } as T;
    this.store.set(updated.id, updated);
    return updated;
  }

  async delete(where: Partial<T>): Promise<T> {
    const existing = await this.findUnique(where);
    if (!existing) {
      throw new Error(`Entity not found for delete: ${JSON.stringify(where)}`);
    }
    this.store.delete(existing.id);
    return existing;
  }

  async count(where?: Partial<T>): Promise<number> {
    if (!where) return this.store.size;
    return [...this.store.values()].filter((item) =>
      this.matchesWhere(item, where),
    ).length;
  }

  // 테스트 제어 메서드
  clear(): void {
    this.store.clear();
  }

  getAll(): T[] {
    return [...this.store.values()];
  }

  // 하위 클래스가 구현해야 하는 메서드
  protected abstract buildEntity(data: CreateInput): T;

  // 얕은 비교를 통한 where 매칭
  protected matchesWhere(item: T, where: Partial<T>): boolean {
    return Object.entries(where).every(
      ([key, value]) => (item as Record<string, unknown>)[key] === value,
    );
  }

  // 유틸리티
  protected generateId(): string {
    return randomUUID();
  }

  protected now(): Date {
    return new Date();
  }
}
