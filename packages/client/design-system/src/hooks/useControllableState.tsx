'use client';

import { useEffect, useRef, useState } from 'react';

import { useEvent } from './useEvent';

export const useControllableState = <T,>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T,
) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const wasControlled = useRef(isControlled);
  const didWarnOnUncontrolledToControlled = useRef(false);
  const didWarnOnControlledToUncontrolled = useRef(false);

  useEffect(() => {
    if (
      isControlled &&
      !wasControlled.current &&
      !didWarnOnUncontrolledToControlled.current
    ) {
      didWarnOnUncontrolledToControlled.current = true;
      console.error(
        'A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen.',
      );
    } else if (
      !isControlled &&
      wasControlled.current &&
      !didWarnOnControlledToUncontrolled.current
    ) {
      didWarnOnControlledToUncontrolled.current = true;
      console.error(
        'A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen.',
      );
    }

    wasControlled.current = isControlled;
  }, [isControlled]);

  return [
    (isControlled ? controlledValue : internalValue)!,
    useEvent((value: T) => {
      if (isControlled) {
        return onChange?.(value);
      } else {
        setInternalValue(value);
        return onChange?.(value);
      }
    }),
  ] as const;
};
