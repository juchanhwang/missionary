'use client';

import { forwardRef } from 'react';

import type {
  ForwardRefRenderFunction,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';

/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 * [래퍼런스 코드](https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/utils/render.ts)
 */

export const forwardRefWithAs = <R, P>(
  component: ForwardRefRenderFunction<R, P>,
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<R>> & {
  displayName: string;
} =>
  Object.assign(
    forwardRef(component as ForwardRefRenderFunction<R, PropsWithoutRef<P>>),
    {
      displayName: component.displayName ?? component.name,
    },
  );
