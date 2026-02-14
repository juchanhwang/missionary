# React Query Mutation Complexity Analysis - missionary-admin

## Executive Summary

**Verdict: React Query is OVER-ENGINEERED for this codebase.**

All 7 mutations are **simple CRUD operations** with:
- ✅ Straightforward `mutationFn` (single API call)
- ✅ Basic `onSuccess` (cache invalidation + navigation)
- ❌ NO optimistic updates (`onMutate`)
- ❌ NO complex error recovery (`onError` only logs)
- ❌ NO context-based rollback
- ❌ NO retry logic in mutations
- ❌ NO coordinated multi-mutation flows

**Recommendation: Migrate to Next.js Server Actions** - would eliminate React Query entirely for mutations while maintaining the same UX.

---

## Detailed Analysis of All 7 Mutations

### 1. useLoginAction
**File:** `/packages/client/missionary-admin/src/app/login/_hooks/useLoginAction.ts`

```typescript
mutationFn: ({ email, password }) => authApi.login(email, password)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
  router.push('/')
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 1 query + navigate
- **Advanced features used**: ❌ None
- **Error handling**: ❌ Only form-level error display (no recovery logic)
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No

**Could be Server Action?** ✅ YES - Server Action + form action would be simpler

---

### 2. useLogoutAction
**File:** `/packages/client/missionary-admin/src/hooks/auth/useLogoutAction.ts`

```typescript
mutationFn: () => authApi.logout()
onSuccess: () => {
  queryClient.setQueryData(queryKeys.auth.me(), null)
  router.push('/login')
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - set cache to null + navigate
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No

**Could be Server Action?** ✅ YES - Server Action would be cleaner

---

### 3. useCreateMissionGroupAction
**File:** `/packages/client/missionary-admin/src/app/(admin)/missions/_hooks/useCreateMissionGroupAction.ts`

```typescript
mutationFn: (data: CreateMissionGroupPayload) => 
  missionGroupApi.createMissionGroup(data)
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.missionGroups.all,
  })
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 1 query
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None (handled at form level)
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No

**Could be Server Action?** ✅ YES - Server Action + revalidateTag would be equivalent

---

### 4. useUpdateMissionGroupAction
**File:** `/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/edit-group/_hooks/useUpdateMissionGroupAction.ts`

```typescript
mutationFn: (data: UpdateMissionGroupPayload) => 
  missionGroupApi.updateMissionGroup(id, data)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.missionGroups.all })
  queryClient.invalidateQueries({
    queryKey: queryKeys.missionGroups.detail(id),
  })
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 2 related queries
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None (only console.error)
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No
- **Note**: Invalidates both list and detail - could use `queryKey: queryKeys.missionGroups.all` to invalidate all

**Could be Server Action?** ✅ YES - Server Action + revalidateTag would be equivalent

---

### 5. useCreateMissionaryAction
**File:** `/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/create/_hooks/useCreateMissionaryAction.ts`

```typescript
mutationFn: (data: CreateMissionaryPayload) => 
  missionaryApi.createMissionary(data)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.missionaries.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.missionGroups.all })
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 2 independent queries
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None (only console.error)
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No
- **Note**: Invalidates both missionaries and missionGroups (because creating a missionary affects group's missionary count)

**Could be Server Action?** ✅ YES - Server Action + revalidateTags would be equivalent

---

### 6. useUpdateMissionaryAction
**File:** `/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_hooks/useUpdateMissionaryAction.ts`

```typescript
mutationFn: (data: UpdateMissionaryPayload) => 
  missionaryApi.updateMissionary(id, data)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.missionaries.all })
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 1 query
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None (only console.error)
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No

**Could be Server Action?** ✅ YES - Server Action + revalidateTag would be equivalent

---

### 7. useDeleteMissionaryAction
**File:** `/packages/client/missionary-admin/src/app/(admin)/missions/[groupId]/[missionId]/edit/_hooks/useDeleteMissionaryAction.ts`

```typescript
mutationFn: () => missionaryApi.deleteMissionary(id)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.missionaries.all })
}
```

**Complexity Assessment:**
- **mutationFn**: ✅ Simple - single API call
- **onSuccess**: ✅ Simple - invalidate 1 query
- **Advanced features used**: ❌ None
- **Error handling**: ❌ None
- **Optimistic updates**: ❌ No
- **Multi-mutation coordination**: ❌ No

**Could be Server Action?** ✅ YES - Server Action + revalidateTag would be equivalent

---

## Cache Invalidation Patterns

### Pattern Analysis

| Mutation | Invalidates | Sophistication |
|----------|------------|-----------------|
| Login | `auth.me()` | Simple |
| Logout | `auth.me()` (setQueryData) | Simple |
| Create Group | `missionGroups.all` | Simple |
| Update Group | `missionGroups.all` + `missionGroups.detail(id)` | Simple (could be optimized) |
| Create Missionary | `missionaries.all` + `missionGroups.all` | Simple (cross-domain) |
| Update Missionary | `missionaries.all` | Simple |
| Delete Missionary | `missionaries.all` | Simple |

**Verdict:** All invalidations are **straightforward, non-overlapping, and predictable**. No complex cache orchestration needed.

---

## Advanced React Query Features - Usage Report

### ✅ Features USED:
1. **useMutation** - Basic mutation hook
2. **useQueryClient** - For cache invalidation
3. **queryClient.invalidateQueries()** - Standard cache invalidation
4. **queryClient.setQueryData()** - Direct cache update (logout only)
5. **useSuspenseQuery** - For data loading (3 hooks)
6. **useQuery** - Standard query hook

### ❌ Features NOT USED:
1. **onMutate** - No optimistic updates
2. **onSettled** - No post-mutation cleanup
3. **context** parameter - No rollback on error
4. **retry** in mutations - No automatic retry
5. **mutationKey** - No mutation tracking
6. **useIsMutating** - No global mutation state
7. **useMutationState** - No mutation history
8. **Infinite queries** - Not needed
9. **Pagination** - Not needed
10. **Dependent queries** - Not needed

---

## Error Handling Analysis

### Current Error Handling

**LoginForm.tsx:**
```typescript
onError: () => {
  form.setError('root.serverError', {
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  })
}
```
- ✅ Form-level error display
- ❌ No error recovery logic
- ❌ No retry mechanism
- ❌ No error context

**Other mutations:**
```typescript
onError: (error) => {
  console.error('Failed to update missionary:', error)
}
```
- ❌ Only logging
- ❌ No user feedback
- ❌ No recovery

### Verdict:
Error handling is **minimal and form-centric**. React Query's advanced error handling features are not utilized.

---

## Client State Dependencies

### Form Components Using Mutations

1. **LoginForm.tsx** - Uses `useLoginAction()`
   - State: React Hook Form (email, password)
   - Post-mutation: Router navigation only
   - Complexity: ✅ Simple

2. **MissionGroupForm.tsx** - Presentational component
   - State: Passed via props (isPending)
   - No mutation logic

3. **CreateMissionForm.tsx** - Uses `useCreateMissionaryAction()`
   - State: React Hook Form + useGetMissionGroup query
   - Post-mutation: Router navigation only
   - Complexity: ✅ Simple

4. **EditMissionGroupForm.tsx** - Uses `useUpdateMissionGroupAction()`
   - State: React Hook Form + useGetMissionGroup query
   - Post-mutation: Router navigation only
   - Complexity: ✅ Simple

5. **MissionaryEditForm.tsx** - Uses `useUpdateMissionaryAction()`
   - State: React Hook Form + useSuspenseGetMissionary query
   - Post-mutation: Router navigation only
   - Complexity: ✅ Simple

### Verdict:
**No complex UI state changes after mutation success.** All mutations result in:
1. Cache invalidation
2. Router navigation

No cascading state updates, no dependent mutations, no complex workflows.

---

## Query Configuration Analysis

### QueryProvider Configuration
```typescript
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,      // 1 minute
    retry: 1,                   // Single retry
    refetchOnWindowFocus: false // No aggressive refetch
  }
}
```

**Assessment:**
- ✅ Conservative settings
- ✅ No aggressive caching
- ✅ Suitable for simple CRUD

### Mutation Configuration
- ❌ No custom retry logic
- ❌ No custom error handling
- ❌ No custom success handling beyond cache invalidation

---

## Comparison: React Query vs Server Actions

### Current React Query Approach
```typescript
// Hook
export function useCreateMissionGroupAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => missionGroupApi.createMissionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missionGroups.all })
    }
  })
}

// Usage
const { mutate, isPending } = useCreateMissionGroupAction()
const onSubmit = (data) => {
  mutate(data, {
    onSuccess: () => router.push('/missions')
  })
}
```

### Equivalent Server Action Approach
```typescript
// Server Action
'use server'
export async function createMissionGroup(data: CreateMissionGroupPayload) {
  const result = await missionGroupApi.createMissionGroup(data)
  revalidateTag('missionGroups')
  redirect('/missions')
}

// Usage
const onSubmit = async (data) => {
  await createMissionGroup(data)
}
```

**Advantages of Server Actions:**
- ✅ No client-side cache management
- ✅ No React Query boilerplate
- ✅ Type-safe form actions
- ✅ Automatic loading state with `useFormStatus()`
- ✅ Simpler error handling with `useFormState()`
- ✅ No need for queryClient
- ✅ Smaller bundle size

---

## Recommendations

### 1. **Immediate Action: Migrate Mutations to Server Actions**
   - All 7 mutations are candidates for Server Actions
   - Would eliminate React Query for mutations entirely
   - Keep React Query for queries (useQuery, useSuspenseQuery)
   - Estimated effort: 2-3 days

### 2. **Keep React Query for Queries**
   - Query hooks are well-structured
   - Cache invalidation via `revalidateTag()` is cleaner
   - No need to change query hooks

### 3. **Simplify Cache Invalidation**
   - Use `queryKey: queryKeys.missionGroups.all` instead of invalidating both list and detail
   - React Query will cascade invalidation automatically

### 4. **Remove Unnecessary Boilerplate**
   - Delete all mutation hooks
   - Move logic to Server Actions
   - Use `useFormStatus()` for loading state
   - Use `useFormState()` for error handling

### 5. **Consider Removing React Query Entirely (Future)**
   - If all mutations become Server Actions
   - Only queries remain
   - Could use Next.js `fetch()` with `revalidateTag()` instead
   - But React Query is still useful for client-side caching

---

## Conclusion

**React Query is over-engineered for missionary-admin's mutation patterns.**

The codebase uses only the most basic React Query features:
- Simple mutations with single API calls
- Basic cache invalidation
- No optimistic updates
- No complex error recovery
- No mutation coordination

**All 7 mutations could be replaced with Server Actions** without any loss of functionality, and with significant simplification of the codebase.

**Recommendation: Migrate to Server Actions for mutations, keep React Query for queries.**

