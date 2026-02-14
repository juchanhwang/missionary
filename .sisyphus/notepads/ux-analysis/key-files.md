# Key Files Referenced in UX Analysis

## React Query Configuration

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-app/src/lib/QueryProvider.tsx`
  - QueryClient setup with 60s staleTime, retry: 1, refetchOnWindowFocus: false
  - Server/browser client separation for SSR

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/lib/QueryProvider.tsx`
  - Identical configuration to missionary-app

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-app/src/lib/queryKeys.ts`
  - Query key factory for auth, missionaries, missionGroups
  - Hierarchical structure for cache invalidation

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/lib/queryKeys.ts`
  - Same structure as missionary-app

## Data Fetching Hooks

### Query Hooks (Read)

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/_hooks/useGetMissionGroups.ts`
  - Basic useQuery for list fetching
  - No advanced options

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/_hooks/useSuspenseGetMissionGroup.ts`
  - useSuspenseQuery for detail page
  - Integrates with React Suspense

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/_hooks/useGetMissionGroup.ts`
  - useQuery with enabled flag for conditional execution
  - Used in form pages

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/hooks/auth/useSuspenseGetMe.ts`
  - Auth query with Suspense
  - Used in AuthProvider

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/hooks/auth/useGetMe.ts`
  - Auth query without Suspense
  - retry: false for auth failures

### Mutation Hooks (Write)

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/create/_hooks/useCreateMissionaryAction.ts`
  - useMutation with cache invalidation
  - Invalidates missionaries.all and missionGroups.all

## Page Components

### List Pages

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/_components/GroupPanel.tsx`
  - Sidebar with mission groups list
  - Client-side filtering (search + type)
  - Uses useGetMissionGroups hook

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/_components/MissionGroupDetail.tsx`
  - Detail view with nested missionaries table
  - Uses useSuspenseGetMissionGroup hook
  - No pagination

### Form Pages

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/create/_components/CreateMissionForm.tsx`
  - Form with dependent data loading
  - Uses useGetMissionGroup with enabled flag
  - Uses useCreateMissionaryAction for submission

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_components/EditMissionContent.tsx`
  - Server-side prefetch with HydrationBoundary
  - Client-side hydration pattern

### Layout Components

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-app/src/app/(main)/layout.tsx`
  - Server-side prefetch of auth data
  - Uses dehydrate() and HydrationBoundary

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/layout.tsx`
  - Server-side prefetch of auth data
  - Uses dehydrate() and HydrationBoundary

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-app/src/app/(main)/MainLayoutClient.tsx`
  - Client-side layout with AuthProvider
  - Suspense boundaries for auth loading

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/app/(admin)/AdminLayoutClient.tsx`
  - Client-side layout with AuthProvider
  - Suspense boundaries for auth loading

## Authentication

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/lib/auth/AuthContext.tsx`
  - AuthProvider with useSuspenseGetMe
  - Provides user and logout function
  - Uses Suspense for loading state

## API Layer

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/apis/instance.ts`
  - Axios instance with 401 refresh token handling
  - Interceptor for auth errors

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/apis/missionGroup.ts`
  - MissionGroup API functions
  - Simple CRUD operations

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/apis/missionary.ts`
  - Missionary API functions
  - Simple CRUD operations

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/src/apis/auth.ts`
  - Auth API functions
  - getMe, login, logout, refresh

## Dependencies

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-admin/package.json`
  - @tanstack/react-query: ^5.90.20
  - react-hook-form: ^7.71.1
  - axios: ^1.13.4
  - zod: ^4.3.6

- `/Users/JuChan/Documents/FE/missionary/packages/client/missionary-app/package.json`
  - Same dependencies as missionary-admin

## Summary Statistics

- **Total Query Hooks**: 5 (useGetMissionGroups, useSuspenseGetMissionGroup, useGetMissionGroup, useSuspenseGetMe, useGetMe)
- **Total Mutation Hooks**: 1 (useCreateMissionaryAction)
- **Advanced React Query Features Used**: 1 (enabled flag)
- **Advanced React Query Features NOT Used**: 8+ (useInfiniteQuery, refetchInterval, select, optimistic updates, etc.)
- **Server-Side Prefetch Locations**: 2 (MainLayout, AdminLayout)
- **Suspense Boundaries**: 3 (AsyncBoundary in layouts, AuthProvider)
