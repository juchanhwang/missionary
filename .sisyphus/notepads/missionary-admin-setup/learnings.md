## Server Actions vs React Query Research (2026-02-13)

### Official Next.js Guidance

**When to Use Server Actions:**
- **Primary use case: Data mutations** (create, update, delete operations)
- Form submissions and data mutations from frontend
- Progressive enhancement (works without JavaScript)
- Direct server-side code execution from components
- Eliminates need for API routes for simple mutations

**Key Limitations:**
- Server Actions are **queued and executed sequentially** (one at a time)
- NOT recommended for parallel data fetching
- Designed for mutations, not optimal for read operations
- Can introduce sequential execution bottlenecks

**Evidence:**
- Next.js docs explicitly state: "Server Actions are queued. Using them for data fetching introduces sequential execution."
- Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/backend-for-frontend.mdx
- Docs recommend: "If you need parallel data fetching, use data fetching in Server Components"

### Vercel's Production Pattern (Commerce Template)

**Vercel Commerce uses Server Actions exclusively for mutations:**

1. **Cart mutations** (`components/cart/actions.ts`):
   ```typescript
   'use server'
   
   export async function addItem(prevState: any, selectedVariantId: string | undefined)
   export async function removeItem(prevState: any, merchandiseId: string)
   export async function updateItemQuantity(prevState: any, payload: {...})
   ```
   - All cart operations use Server Actions
   - Uses `updateTag(TAGS.cart)` for cache invalidation
   - No React Query dependency in package.json

2. **Client-side optimistic updates** (`add-to-cart.tsx`):
   ```typescript
   const { addCartItem } = useCart(); // Optimistic update
   const [message, formAction] = useActionState(addItem, null); // Server Action
   
   action={async () => {
     addCartItem(finalVariant, product); // Instant UI update
     addItemAction(); // Server mutation
   }}
   ```
   - Combines React Context for optimistic UI
   - Server Actions for actual mutations
   - No React Query needed

**Key Insight:** Vercel's own production app (Commerce) does NOT use React Query at all.

### Community Consensus (2026)

**Hybrid Approach is Recommended:**

1. **Use Server Actions for:**
   - Form submissions
   - Data mutations (POST, PUT, DELETE)
   - Progressive enhancement
   - Simple, sequential operations
   - Integration with Next.js caching (`revalidatePath`, `updateTag`)

2. **Use React Query for:**
   - Complex client-side data fetching
   - Optimistic UI updates with rollback
   - Automatic retries and error handling
   - Infinite scrolling, pagination
   - Real-time data synchronization
   - Fine-grained cache control
   - Parallel data fetching

3. **Combine Both:**
   - Server Actions as mutation functions in React Query
   - Server-side prefetching + client-side hydration
   - Server Actions for writes, React Query for reads

### Performance Implications

**Server Actions:**
- ✅ Zero client-side bundle impact (runs on server)
- ✅ Direct database access (no API layer overhead)
- ✅ Integrated with Next.js cache
- ❌ Sequential execution (queued)
- ❌ Limited error handling compared to React Query

**React Query:**
- ✅ Parallel requests
- ✅ Advanced caching strategies
- ✅ Automatic retries with exponential backoff
- ✅ Optimistic updates with rollback
- ❌ ~13KB bundle size
- ❌ Additional complexity

### Recommendation for Missionary Admin

**For missionary management admin panel:**

1. **Use Server Actions for:**
   - Creating/updating/deleting missionaries
   - Form submissions (registration, profile updates)
   - File uploads
   - Any mutation that benefits from progressive enhancement

2. **Consider React Query if:**
   - Need complex data synchronization across multiple views
   - Require optimistic updates with automatic rollback
   - Have real-time requirements (polling, websockets)
   - Need advanced error handling and retry logic

3. **Start Simple:**
   - Begin with Server Actions only (like Vercel Commerce)
   - Add React Query later if specific needs arise
   - Use React Context for optimistic UI updates
   - Leverage Next.js cache invalidation (`revalidatePath`, `updateTag`)

**Evidence-based decision:** Vercel's own production apps use Server Actions without React Query, proving it's sufficient for most use cases.

### Sources

- Next.js Official Docs: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Vercel Commerce (production example): https://github.com/vercel/commerce/blob/1df2cf6f6c935f4782eed27351fa18f276917a4d/components/cart/actions.ts
- Community discussions: Reddit r/nextjs, Medium articles (2026)
- Next.js Backend for Frontend guide: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/backend-for-frontend.mdx

