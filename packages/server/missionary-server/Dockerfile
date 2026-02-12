# ============================================
# Stage 1: Builder — 전체 의존성 설치 + 빌드
# ============================================
FROM node:20-alpine AS builder

# bcrypt 네이티브 C++ 모듈 빌드 도구
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/server/missionary-server/package.json ./packages/server/missionary-server/

RUN pnpm install --filter missionary-server... --frozen-lockfile

COPY packages/server/missionary-server/prisma ./packages/server/missionary-server/prisma/
COPY packages/server/missionary-server/prisma.config.ts ./packages/server/missionary-server/

WORKDIR /app/packages/server/missionary-server
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

WORKDIR /app
COPY packages/server/missionary-server/ ./packages/server/missionary-server/

WORKDIR /app/packages/server/missionary-server
RUN npx nest build

# ============================================
# Stage 2: Prod-deps — 프로덕션 의존성만 설치 (workspace 외부)
# ============================================
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY packages/server/missionary-server/package.json ./
RUN npm install --omit=dev --ignore-scripts && \
    npm install dotenv --ignore-scripts && \
    npm rebuild bcrypt

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/missionary-server/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/missionary-server/prisma/generated ./prisma/generated
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/missionary-server/prisma/migrations ./prisma/migrations
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/missionary-server/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages/server/missionary-server/prisma.config.ts ./prisma.config.ts

USER nestjs

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3100/health || exit 1

CMD ["node", "dist/main"]
