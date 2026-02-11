# Learnings — color-system-overhaul

Conventions, patterns, and best practices discovered during execution.

---

## Task 3-5: DatePicker, SVG Icons, Badge Cleanup (Completed)

### DatePicker CSS Variable Migration
- **Pattern**: Replaced 11 hardcoded hex values with CSS variables in `DatePickerStyles.css`
- **Key insight**: Blue (#2563eb → var(--color-blue-50)) chosen for selected date state to avoid red (error) confusion
- **All 11 replacements successful**: border, header bg, month title, day names, day text, hover state, selected states, disabled text, outside month, nav icons
- **No structural changes needed**: CSS variables work seamlessly with react-datepicker overrides

### SVG Icon Color Updates
- **Pattern**: SVG fill attributes must use hex values (cannot reference CSS variables in file references)
- **Mapping applied**:
  - icon-input-error.svg: #EBBB13 → #dc2626 (error-60, orange-red)
  - icon-input-reset.svg: #C0C5CF → #dad6d2 (gray-20, warm neutral)
- **Note**: icon-input-search.svg uses stroke="black" (no changes needed)

### Badge Variant Correction
- **Pattern**: Tailwind utility class mapping in component constants
- **Change**: warning variant `'bg-error-10 text-error-70'` → `'bg-warning-10 text-warning-70'`
- **Rationale**: Semantic correctness — warning badge should use warning palette, not error palette

### Build Verification
- `pnpm build:ds` passed successfully (exit 0)
- All 46 modules transformed, declaration files generated
- No TypeScript errors or warnings
- Output: dist/styles/index.css (25.88 kB), dist/index.js (38.94 kB)

### Commit Strategy
Ready for atomic commit:
- Message: `refactor: DatePicker, SVG 아이콘, Badge 하드코딩 색상 정리`
- Files: DatePickerStyles.css, icon-input-error.svg, icon-input-reset.svg, badge/index.tsx

## Task 6: Build Verification + Storybook Visual QA

### Build Status
- ✓ All builds passed: `pnpm build:ds`, `pnpm build:admin`, `pnpm build:app`, `pnpm type-check`
- ✓ Type-check clean across all packages
- ✓ OAuth button colors preserved: #FEE500 (Kakao), #F2F2F2 (Google)

### Issue Fixed
**missionary-app build failure**: Path alias `@styles` was not resolving SCSS files from design-system package.
- **Root cause**: Next.js Turbopack cannot resolve SCSS files through path aliases from external packages
- **Solution**: Changed imports in `packages/client/missionary-app/src/app/layout.tsx` from:
  ```typescript
  import '@styles/tailwind.css';
  import '@styles/_global.scss';
  ```
  to:
  ```typescript
  import '../../../design-system/src/styles/tailwind.css';
  import '../../../design-system/src/styles/_global.scss';
  ```
- **Note**: missionary-admin already used relative paths, which is the correct pattern

### Storybook Visual Verification
- ✓ All 8 component stories rendered successfully
- ✓ New color system applied across all components
- ✓ Screenshots captured for: Button, Badge, InputField, Select, DatePicker, NavItem, Tab, IconButton
- ✓ Evidence files saved to `.sisyphus/evidence/task-6-*.png`

### Color System Validation
- Primary color (Samil red #EC2327) visible in Button and Badge components
- Secondary color (charcoal #2C3E50) applied correctly
- Warning palette (amber #F59E0B) visible in Badge warning variant
- Error color (#DC2626) applied to InputField error states
- Warm neutral gray palette applied across all components

### Key Learnings
1. **Path alias limitations**: SCSS files from workspace packages should use relative paths in Next.js apps, not path aliases
2. **Build verification**: Always run full monorepo build (all packages) to catch cross-package issues
3. **Color system completeness**: 68 CSS tokens successfully applied across 8+ component types
4. **Storybook as QA tool**: Visual verification through Storybook screenshots is effective for design system changes

### Recommendations
- Document the relative path pattern for importing design-system styles in Next.js apps
- Consider adding a build validation script to catch path alias issues early
- Keep Storybook screenshots as regression test baseline for future color system changes
