import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  screen,
  waitFor,
  within,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const user = userEvent.setup();

  return {
    ...rtlRender(ui, { wrapper: AllProviders, ...options }),
    user,
  };
}

function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) {
  return rtlRenderHook(hook, { wrapper: AllProviders, ...options });
}

export { render, renderHook, screen, waitFor, within };
