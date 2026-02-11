# Decisions — color-system-overhaul

Architectural and design choices made during execution.

---

## [2026-02-11T11:50:44.177Z] Initial Context

**Primary Color**: #EC2327 (Samil Church logo red) anchored at primary-50  
**Secondary Color**: #2C3E50 range (dark charcoal)  
**Error/Warning**: Semantic fix — error=red, warning=yellow (NEW palette)  
**Gray**: Warm neutral (remove cool-blue undertone)  
**Key Constraint**: primary-10 used as admin background — must be warm cream, NOT pink

## [2026-02-11T12:05:00.000Z] Comprehensive Color System Design

### 1. Primary Palette (Samil Red)

- **Anchor**: `#EC2327` (primary-50) preserved as the core brand identity.
- **Lightest Shade**: `primary-10` set to `#FFF8F6` (Warm Cream). This is critical for the Admin App background to feel "warm and welcoming" rather than "pink and washed out."
- **Darkest Shade**: `primary-80` set to `#850A0D` (Deep Burgundy) to provide high-contrast text and authoritative button states.

### 2. Secondary Palette (Charcoal)

- **Shift**: Changed from a secondary red (redundant) to a Cool Charcoal/Slate palette (`#2C3E50` anchor at 80).
- **Purpose**: Provides a strong, neutral structural element that complements the vibrant red without competing for attention.

### 3. Error Palette (Orange-Red)

- **Differentiation**: Deliberately shifted closer to Orange-Red (`#EF4444`, `#DC2626`) to distinguish from the pink-based Primary Red.
- **Reasoning**: Users must instantly recognize "Error" vs "Brand Accent."

### 4. Gray Palette (Warm Neutral)

- **Undertone**: Removed the "corporate cool blue" undertone of the old `#F2F3F7`.
- **New Direction**: Adopted a "Warm Neutral" scale (Hue ~30-40, low saturation) inspired by Samil's beige/cream website backgrounds (`#F0EAE6`).
- **Expansion**: Added `gray-02` (`#FAF9F8`) and `gray-05` (`#F5F4F2`) for subtle surface differentiation.

### 5. Modern Semantics (Warning, Blue, Green)

- **Warning**: Updated to modern Amber (`#F59E0B`) for better visibility than the old washed-out yellow.
- **Blue/Green**: Increased vibrancy to match modern SaaS aesthetics.

### Compliance

- **WCAG AA Verified**:
  - `primary-80` on White: 10.26:1
  - `error-60` on White: 4.83:1
  - `gray-60` on White: 6.45:1
