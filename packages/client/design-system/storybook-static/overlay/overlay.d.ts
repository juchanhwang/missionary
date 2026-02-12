import { overlay } from 'overlay-kit';
import { ReactNode } from '../../../../../node_modules/react';
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
export declare function openOverlay(render: (props: OverlayRenderProps) => ReactNode): string;
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
export declare function openOverlayAsync<T>(render: (props: {
    isOpen: boolean;
    close: (result: T) => void;
}) => ReactNode): Promise<T>;
