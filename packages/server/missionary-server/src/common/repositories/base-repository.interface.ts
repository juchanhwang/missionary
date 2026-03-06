/**
 * 도메인 Repository 인터페이스의 기반 타입.
 * 각 도메인은 이를 확장하여 도메인-specific 메서드를 추가한다.
 *
 * 주의: Prisma의 include, select 등은 도메인별 메서드에서 처리.
 * 이 인터페이스는 가장 기본적인 CRUD 계약만 정의한다.
 */
export interface BaseRepository<T, CreateInput, UpdateInput> {
  create(data: CreateInput): Promise<T>;
  findMany(args?: {
    where?: Partial<T>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<T[]>;
  findUnique(where: Partial<T>): Promise<T | null>;
  findFirst(where: Partial<T>): Promise<T | null>;
  update(where: Partial<T>, data: UpdateInput): Promise<T>;
  delete(where: Partial<T>): Promise<T>;
  count(where?: Partial<T>): Promise<number>;
}
