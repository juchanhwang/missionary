import { vi } from 'vitest';

vi.mock('*.svg', () => ({
  default: 'svg-mock',
}));
