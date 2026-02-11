# Design System Refactor - Decisions

## [2026-02-12] Color System Decisions

### Decision: Primary Color Usage
**Context**: Primary color #E60012 is very intense red
**Decision**: Use primary ONLY for CTA buttons and critical user actions
**Rationale**: 
- Too strong for general UI elements
- Form components with red look like error states
- Following kokomu.jp reference site pattern

### Decision: Remove Secondary Color Palette
**Context**: Navy blue secondary palette was underutilized
**Decision**: Completely remove secondary, replace with neutral (gray-based)
**Rationale**:
- Simplifies color system
- Gray-based neutral is more versatile
- Reduces cognitive load for developers

### Decision: Gray Token Scale
**Context**: Had inconsistent gray tokens (02, 03, 05, 10, 20, etc.)
**Decision**: Start from 10, increment by 10 (10-90)
**Rationale**:
- More predictable naming
- Easier to remember
- Aligns with common design system patterns

### Decision: Form Component Colors
**Context**: Forms need to be visible but not alarming
**Decision**: Use gray-50 for focus rings, gray-30 for borders
**Rationale**:
- Clear visibility without being aggressive
- Distinguishes from error states (which use error-60)
- Consistent with neutral, professional aesthetic

## [2026-02-12] Component Architecture Decisions

### Decision: Badge Default Variant
**Context**: Badge default was using primary-80 (red)
**Decision**: Change to gray-80 (neutral dark)
**Rationale**:
- Red should be reserved for destructive/critical actions
- Default badge should be neutral
- Aligns with new color system philosophy
