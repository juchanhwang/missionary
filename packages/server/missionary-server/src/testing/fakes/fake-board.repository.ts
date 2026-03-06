import type {
  BoardCreateInput,
  BoardRepository,
  BoardUpdateInput,
  BoardWithRelations,
} from '@/board/repositories/board-repository.interface';
import type { MissionaryBoardType } from '@/common/enums/missionary-board-type.enum';

import { BaseFakeRepository } from './base-fake-repository';

import type {
  Missionary,
  MissionaryBoard,
} from '../../../prisma/generated/prisma';

export class FakeBoardRepository
  extends BaseFakeRepository<
    MissionaryBoard,
    BoardCreateInput,
    BoardUpdateInput
  >
  implements BoardRepository
{
  /**
   * missionary 저장소.
   * createWithRelations / findByIdWithRelations 등에서 관계를 포함한 결과를 반환할 때 사용한다.
   * 테스트에서 `setMissionary(missionaryId, missionary)` 로 세팅한다.
   */
  private missionaries = new Map<string, Missionary>();

  // --- BoardRepository 전용 메서드 ---

  async createWithRelations(
    data: BoardCreateInput,
  ): Promise<BoardWithRelations> {
    const entity = this.buildEntity(data);
    this.store.set(entity.id, entity);
    return this.attachMissionary(entity);
  }

  async findByMissionary(
    missionaryId: string,
    type?: MissionaryBoardType,
  ): Promise<BoardWithRelations[]> {
    let results = [...this.store.values()].filter(
      (board) => board.missionaryId === missionaryId,
    );

    if (type !== undefined) {
      results = results.filter((board) => board.type === type);
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return results.map((board) => this.attachMissionary(board));
  }

  async findByIdWithRelations(id: string): Promise<BoardWithRelations | null> {
    const board = this.store.get(id);
    if (!board) return null;
    return this.attachMissionary(board);
  }

  async updateWithRelations(
    id: string,
    data: BoardUpdateInput,
  ): Promise<BoardWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Entity not found for update: ${JSON.stringify({ id })}`);
    }
    const updated = {
      ...existing,
      ...(data as object),
      updatedAt: new Date(),
    } as MissionaryBoard;
    this.store.set(updated.id, updated);
    return this.attachMissionary(updated);
  }

  async deleteWithRelations(id: string): Promise<BoardWithRelations> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Entity not found for delete: ${JSON.stringify({ id })}`);
    }
    this.store.delete(id);
    return this.attachMissionary(existing);
  }

  // --- 테스트 헬퍼 ---

  setMissionary(missionaryId: string, missionary: Missionary): void {
    this.missionaries.set(missionaryId, missionary);
  }

  clearMissionaries(): void {
    this.missionaries.clear();
  }

  override clear(): void {
    super.clear();
    this.missionaries.clear();
  }

  // --- buildEntity ---

  protected buildEntity(data: BoardCreateInput): MissionaryBoard {
    const now = this.now();
    return {
      id: data.id ?? this.generateId(),
      type: data.type,
      title: data.title,
      content: data.content,
      missionaryId: data.missionaryId,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy ?? null,
      updatedBy: data.updatedBy ?? null,
      version: data.version ?? 0,
      deletedAt: null,
    };
  }

  // --- private ---

  private attachMissionary(board: MissionaryBoard): BoardWithRelations {
    const missionary = this.missionaries.get(board.missionaryId);
    if (!missionary) {
      throw new Error(
        `Missionary not found for board: ${board.missionaryId}. ` +
          `Use setMissionary() to set up test data.`,
      );
    }
    return { ...board, missionary };
  }
}
