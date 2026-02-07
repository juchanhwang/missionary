# Learnings - api-migration

## Conventions

### Naming

- All Prisma models use UUID for PK (`@default(uuid())`)
- Table names: snake_case with `@@map("table_name")`
- Column names: snake_case with `@map("column_name")`

### Architecture Decisions

- **Member Model**: Single `User` table with `role` enum (USER, ADMIN, STAFF) — NOT Spring's 3-table polymorphism
- **API Structure**: Resource-based URLs + RBAC guards — NOT Spring's role-prefixed URLs (`/api/admin/`, `/api/user/`)
- **Soft Delete**: Use `prisma-extension-soft-delete` package — NOT raw Prisma middleware (middleware doesn't handle nested writes)
- **Message Queue**: BullMQ (Redis) — replaces Spring's RabbitMQ
- **Testing**: TDD with Jest — write tests BEFORE implementation

### Spring → NestJS Mappings

- `@Embeddable` (Period, BankAccount) → Flattened columns (startDate, endDate, bankName, bankAccount, bankAccountHolder)
- `@PrePersist`/`@PreUpdate` → Prisma middleware for audit fields
- `@Convert(AesEncryptConverter)` → Custom Prisma field-level encryption in service layer
- `@EntityListeners(AuditingEntityListener)` → Prisma middleware
- RabbitMQ → BullMQ

### Code Quality Rules (from CLAUDE.md)

- **Readability**: Minimize context per read — separate components by execution path, abstract implementation details
- **Predictability**: Function names/params/returns must be self-documenting
- **Cohesion**: Code that changes together stays together — domain-based directory structure over type-based
- **Coupling**: One responsibility per Hook/function — allow duplication over premature abstraction

## Gotchas

### Prisma Limitations

- Soft delete middleware doesn't cascade to nested writes → MUST use `prisma-extension-soft-delete` package
- Embedded objects not supported → MUST flatten to columns
- No built-in audit trail → MUST implement via middleware

### Spring Compatibility

- AES encryption: Spring uses key's first 16 bytes as BOTH key AND IV (AES/CBC/PKCS5Padding)
- PII masking: Last 6 characters → `******` (not first N chars)
- Audit fields: createdBy/updatedBy are USER IDs (UUID), not usernames

### NestJS Patterns

- Guards execute AFTER middleware but BEFORE interceptors
- `@Roles()` decorator uses Reflector to set metadata, RolesGuard reads it
- BullMQ processors are separate classes with `@Processor()` decorator

## Dependencies Installed

### Wave 1 (Task 1)

- `prisma-extension-soft-delete` — Soft delete with nested write support
- `@nestjs/bullmq` — NestJS BullMQ integration
- `bullmq` — Redis-based message queue
- `ioredis` — Redis client for BullMQ
- `@nestjs/schedule` — Cron jobs for PII cleanup
- `fast-csv` — CSV export utility

## File Structure

```
packages/missionary-server/src/
├── common/
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── middleware/
│   │   ├── soft-delete.ts
│   │   └── audit.ts
│   ├── interceptors/
│   │   └── masking.interceptor.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   └── encryption.spec.ts
│   ├── queue/
│   │   └── (BullMQ config - Task 8)
│   ├── csv/
│   │   └── (CSV export - Task 13)
│   └── scheduler/
│       └── (PII cleanup - Task 14)
├── missionary/
├── participation/
├── team/
├── staff/
├── church/
├── board/
├── region/
└── terms/
```

---

_Last updated: 2026-02-07 (Wave 1 start)_

## [2026-02-07] Task 1: Test Infrastructure

### Jest Configuration

- Created `jest.config.ts` with ts-jest preset and node test environment
- Test files location: `src/**/*.spec.ts` pattern
- No separate test DB configured - tests use mocks/in-memory strategies
- Coverage collection excludes spec files and node_modules

### RBAC Implementation

- Roles decorator uses Reflector metadata key: `'roles'`
- RolesGuard reads `user.role` from JWT payload (set by JwtAuthGuard via `request.user`)
- Execution order: JwtAuthGuard → RolesGuard → Controller
- Returns `true` if no roles required (public endpoint), `false` if user lacks required role
- Supports multiple required roles (any match allows access)
- Test coverage: 7 test cases in `roles.guard.spec.ts`

### AES Encryption Gotchas

- **Spring Compatibility**: Uses first 16 bytes of key as BOTH key AND IV (non-standard)
- Algorithm: `aes-128-cbc` with UTF-8 encoding, Base64 output
- Deterministic encryption: Same plaintext + key = same ciphertext (due to fixed IV)
- Error handling: Throws on short keys (<16 bytes), invalid base64, or corrupted ciphertext
- Test coverage: 15 test cases in `encryption.spec.ts`

### PII Masking Implementation

- Fields masked: `phoneNumber`, `identityNumber`, `bankAccount`
- Masking logic: Last 6 characters replaced with `******` (matches Spring's `(.{6}$)` regex)
- Handles nested objects, arrays, and edge cases (null, undefined, short strings ≤6 chars)
- Short strings (≤6 chars) fully masked to `******`
- Interceptor uses RxJS `map` operator for non-blocking response transformation
- Test coverage: 18 test cases in `masking.interceptor.spec.ts`

### Soft Delete Extension

- Package: `prisma-extension-soft-delete` v2.0.1
- Configured with `defaultConfig` for `deletedAt` field (DateTime)
- `createValue` function: `deleted ? new Date() : null`
- Empty `models` object (models will be added in Task 2 when schema is finalized)
- Extension applied in PrismaService constructor using `$extends()`
- Handles nested writes automatically (advantage over raw middleware)

### Audit Middleware

- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Decodes JWT and stores `userId` in `request.userId` (not `request.user`)
- Execution order: Middleware runs BEFORE guards, so can't rely on `request.user`
- Silent error handling: Invalid tokens don't crash request (allows public endpoints)
- Actual audit field population (createdBy/updatedBy) will be handled in Prisma middleware (Task 2)

### Test Coverage Summary

- `encryption.spec.ts`: 15 tests (encrypt, decrypt, Spring compatibility, error handling)
- `roles.guard.spec.ts`: 7 tests (access control, role matching, metadata)
- `masking.interceptor.spec.ts`: 18 tests (PII fields, nested objects, arrays, edge cases)
- **Total**: 40 tests, all passing
- TDD approach followed: Tests written BEFORE implementation for all components

### Dependencies Installed (Wave 1)

Core packages:
- `prisma-extension-soft-delete` v2.0.1 — Soft delete with nested write support
- `@nestjs/bullmq` v11.0.4 — NestJS BullMQ integration (for Task 8)
- `bullmq` v5.67.3 — Redis-based message queue (for Task 8)
- `ioredis` v5.9.2 — Redis client for BullMQ (for Task 8)
- `@nestjs/schedule` v6.1.1 — Cron jobs for PII cleanup (for Task 14)
- `fast-csv` v5.0.5 — CSV export utility (for Task 13)

Test infrastructure:
- `jest` v30.2.0 — Test runner
- `@nestjs/testing` v11.1.13 — NestJS testing utilities
- `@types/jest` v30.0.0 — Jest TypeScript definitions
- `ts-jest` v29.4.6 — TypeScript preprocessor for Jest

### File Structure Created

```
packages/missionary-server/src/
├── common/
│   ├── enums/
│   │   └── user-role.enum.ts (UserRole: USER, ADMIN, STAFF)
│   ├── decorators/
│   │   └── roles.decorator.ts (@Roles(...roles))
│   ├── guards/
│   │   ├── roles.guard.ts (RolesGuard)
│   │   └── roles.guard.spec.ts
│   ├── middleware/
│   │   └── audit.middleware.ts (JWT → request.userId)
│   ├── interceptors/
│   │   ├── masking.interceptor.ts (PII masking)
│   │   └── masking.interceptor.spec.ts
│   └── utils/
│       ├── encryption.ts (AES-128-CBC Spring-compatible)
│       └── encryption.spec.ts
├── database/
│   └── prisma.service.ts (updated with soft delete extension)
└── jest.config.ts (new)
```

### Lessons Learned

1. **TDD Benefits**: Writing tests first clarified edge cases (short strings, nulls, nested objects) before implementation
2. **Spring Quirks**: Key-as-IV pattern is non-standard but must be preserved for data compatibility
3. **Middleware Timing**: Guards run after middleware → audit middleware can't access `request.user`
4. **Soft Delete Package**: `prisma-extension-soft-delete` handles nested writes correctly (raw middleware doesn't)
5. **Masking Direction**: Spring masks LAST 6 chars (not first N) — easy to get backwards
6. **Jest Setup**: Simple `ts-jest` preset sufficient for NestJS — no complex configuration needed

