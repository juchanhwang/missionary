# Design System Refactor - Learnings

## [2026-02-12] Plan Completion

### Key Patterns Discovered

1. **Color System Strategy**
   - Primary color (#E60012) should be used sparingly - CTA buttons only
   - Form components should NOT use primary color (looks like error state)
   - Gray-based neutral colors work better for form controls
   - Badge default variant changed from `bg-primary-80` to `bg-gray-80` for consistency

2. **Form Component Visibility**
   - Input components need visible borders on white backgrounds
   - `border border-gray-30` provides clear boundaries without being heavy
   - Placeholder text needs sufficient contrast: `text-gray-50` (#999) is standard
   - Focus rings should be clear: `ring-gray-50` works better than `ring-gray-40`
   - Hover states work better with border changes than background changes

3. **Test Maintenance**
   - When changing component styling, tests checking className need updates
   - Badge test expected `bg-primary-80` but implementation changed to `bg-gray-80`
   - Always run full test suite after color system changes

4. **Build Verification Chain**
   - Design system must be built before admin app can type-check
   - Full verification order: test → build:ds → build:admin → type-check → lint:all
   - Storybook build (`build-storybook`) verifies all stories compile without running dev server

### Successful Approaches

1. **Incremental Verification**
   - Verify each change immediately (tests, build, type-check)
   - Don't batch multiple changes before verification
   - Catch issues early when context is fresh

2. **Color Token Migration**
   - Start from gray tokens (10-90 scale)
   - Remove intermediate tokens (02, 03, 05) that cause confusion
   - Update all references systematically
   - Run full test suite to catch hardcoded expectations

3. **Form Component Consistency**
   - Apply same pattern across Input, InputField, SearchBox, DatePicker
   - Consistent border, padding, focus ring, placeholder color
   - Makes the design system feel cohesive

### Conventions Established

- **Gray tokens**: Start from 10, increment by 10 (10, 20, 30, 40, 50, 60, 70, 80, 90)
- **Primary color**: #E60012 - use only for CTA buttons and critical actions
- **Form focus**: `ring-gray-50` + `border-gray-50` for clear feedback
- **Placeholder**: `text-gray-50` for sufficient contrast
- **Disabled state**: `border-gray-20` to maintain shape visibility

### Tools & Commands

```bash
# Full verification chain
pnpm test --filter @samilhero/design-system
pnpm build:ds
pnpm build:admin
pnpm type-check
pnpm lint:all

# Storybook verification (without dev server)
cd packages/client/design-system && pnpm build-storybook

# Count test results
pnpm test 2>&1 | grep "Test Files"
```
