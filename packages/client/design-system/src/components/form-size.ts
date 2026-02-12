export type FormSize = 'sm' | 'md' | 'lg';

export const formSizeClasses: Record<
  FormSize,
  { container: string; text: string; icon: number }
> = {
  sm: {
    container: 'h-8 px-2.5 gap-1.5',
    text: 'text-xs',
    icon: 16,
  },
  md: {
    container: 'h-10 px-3 gap-2',
    text: 'text-sm',
    icon: 20,
  },
  lg: {
    container: 'h-12 px-4 gap-2',
    text: 'text-sm',
    icon: 20,
  },
};
