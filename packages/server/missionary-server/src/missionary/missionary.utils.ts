/**
 * MissionaryService의 순수 비즈니스 로직 (Functional Core)
 * Mock 없이 테스트 가능한 순수 함수들.
 */

export function calculateNextOrder(currentMaxOrder: number | null): number {
  return (currentMaxOrder ?? 0) + 1;
}

export function generateMissionaryName(
  order: number,
  groupName: string,
): string {
  return `${order}차 ${groupName}`;
}

export function shouldAutoFillName(name?: string | null): boolean {
  return !name || name.trim() === '';
}
