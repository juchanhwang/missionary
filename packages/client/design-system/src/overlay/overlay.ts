'use client';

import { overlay } from 'overlay-kit';
import { type ReactNode } from 'react';

export { overlay };

export interface OverlayRenderProps {
  isOpen: boolean;
  close: () => void;
}

/**
 * overlay.open()의 간편 래퍼.
 * close() 호출 시 닫기 애니메이션 후 자동으로 unmount까지 처리한다.
 *
 * @example
 * ```tsx
 * openOverlay(({ isOpen, close }) => (
 *   <MyModal isOpen={isOpen} onClose={close} />
 * ));
 * ```
 */
export function openOverlay(render: (props: OverlayRenderProps) => ReactNode) {
  return overlay.open(({ isOpen, close, unmount }) =>
    render({
      isOpen,
      close: () => {
        close();
        setTimeout(unmount, 300);
      },
    }),
  );
}

/**
 * overlay.openAsync()의 간편 래퍼.
 * Promise로 overlay 결과를 반환한다.
 *
 * @example
 * ```tsx
 * const confirmed = await openOverlayAsync<boolean>(({ isOpen, close }) => (
 *   <ConfirmModal
 *     isOpen={isOpen}
 *     onConfirm={() => close(true)}
 *     onCancel={() => close(false)}
 *   />
 * ));
 * ```
 */
export function openOverlayAsync<T>(
  render: (props: { isOpen: boolean; close: (result: T) => void }) => ReactNode,
) {
  return overlay.openAsync<T>(({ isOpen, close, unmount }) =>
    render({
      isOpen,
      close: (result: T) => {
        close(result);
        setTimeout(unmount, 300);
      },
    }),
  );
}
