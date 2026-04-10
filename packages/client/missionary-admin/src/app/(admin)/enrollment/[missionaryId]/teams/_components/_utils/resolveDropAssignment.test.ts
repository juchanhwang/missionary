import { describe, expect, it } from 'vitest';

import { resolveDropAssignment } from './resolveDropAssignment';

import type { DragData, DropData } from '../types';

describe('resolveDropAssignment', () => {
  const drag = (overrides: Partial<DragData> = {}): DragData => ({
    participationId: 'p-1',
    fromTeamId: null,
    ...overrides,
  });

  it('dragData가 undefined이면 null을 반환한다', () => {
    const dropData: DropData = { type: 'unassigned' };
    expect(resolveDropAssignment(undefined, dropData)).toBeNull();
  });

  it('dropData가 undefined이면 null을 반환한다', () => {
    expect(resolveDropAssignment(drag(), undefined)).toBeNull();
  });

  it('미배치 → 미배치 드롭은 noop(null)이다', () => {
    const dropData: DropData = { type: 'unassigned' };
    expect(
      resolveDropAssignment(drag({ fromTeamId: null }), dropData),
    ).toBeNull();
  });

  it('같은 팀으로의 드롭은 noop(null)이다', () => {
    const dropData: DropData = { type: 'team', teamId: 'team-a' };
    expect(
      resolveDropAssignment(drag({ fromTeamId: 'team-a' }), dropData),
    ).toBeNull();
  });

  it('팀 → 미배치 드롭은 teamId=null로 반환한다', () => {
    const dropData: DropData = { type: 'unassigned' };
    const result = resolveDropAssignment(
      drag({ participationId: 'p-9', fromTeamId: 'team-x' }),
      dropData,
    );
    expect(result).toEqual({ participationId: 'p-9', teamId: null });
  });

  it('미배치 → 팀 드롭은 해당 teamId로 반환한다', () => {
    const dropData: DropData = { type: 'team', teamId: 'team-42' };
    const result = resolveDropAssignment(
      drag({ participationId: 'p-7', fromTeamId: null }),
      dropData,
    );
    expect(result).toEqual({ participationId: 'p-7', teamId: 'team-42' });
  });

  it('팀 A → 팀 B 드롭은 새 teamId로 반환한다', () => {
    const dropData: DropData = { type: 'team', teamId: 'team-b' };
    const result = resolveDropAssignment(
      drag({ participationId: 'p-3', fromTeamId: 'team-a' }),
      dropData,
    );
    expect(result).toEqual({ participationId: 'p-3', teamId: 'team-b' });
  });
});
