'use client';

import { useControllableState, useMergeRefs } from '@hooks';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { SelectOption } from './SelectOption';
import { SelectOptions } from './SelectOptions';
import { SelectSearchInput } from './SelectSearchInput';
import { SelectTrigger } from './Trigger';

type ValueType = string | string[] | undefined | null;
export const SelectActionsContext = createContext<{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectValue: (value: string) => void;
} | null>(null);
SelectActionsContext.displayName = 'SelectActionsContext';

export const SelectDataContext = createContext<{
  open: boolean;
  selectedValue?: ValueType;
} | null>(null);
SelectDataContext.displayName = 'SelectDataContext';

interface SelectRootProps {
  defaultValue?: ValueType;
  value?: ValueType;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
  onChange?(value?: ValueType): void;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<HTMLDivElement>;
}
const SelectRoot = ({
  defaultValue,
  value: controlledValue,
  onChange: controlledOnChange,
  children,
  multiple = false,
  onBlur,
  name,
  ref,
}: SelectRootProps) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(ref, selectRef);
  const onBlurRef = useRef(onBlur);
  const [open, setOpen] = useState(false);

  // Normalize undefined value to null when onChange is present to prevent uncontrolled->controlled warning
  // This is common with RHF which passes undefined as initial value
  const effectiveControlledValue =
    controlledValue === undefined && controlledOnChange
      ? null
      : controlledValue;

  const [selectedValue = multiple ? [] : undefined, setSelectedValue] =
    useControllableState<ValueType>(
      effectiveControlledValue,
      controlledOnChange,
      defaultValue,
    );

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  const handleSelectValue = useCallback(
    (item: string) => {
      let selectedList;
      const itemExists = selectedValue?.includes(item);

      if (multiple && selectedValue instanceof Array) {
        selectedList = itemExists
          ? selectedValue.filter((value) => value !== item)
          : [...selectedValue, item];
      } else {
        selectedList = itemExists ? null : item;
      }

      setSelectedValue(selectedList);

      if (!multiple) {
        setOpen(false);
        onBlurRef.current?.();
      }
    },
    [multiple, selectedValue, setSelectedValue],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        onBlurRef.current?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        onBlurRef.current?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const actions = useMemo(
    () => ({
      setOpen,
      handleSelectValue,
    }),
    [handleSelectValue],
  );

  const data = useMemo(
    () => ({
      open,
      selectedValue,
    }),
    [open, selectedValue],
  );
  return (
    <SelectActionsContext.Provider value={actions}>
      <SelectDataContext.Provider value={data}>
        <div ref={mergedRef} data-name={name} style={{ position: 'relative' }}>
          {children}
        </div>
      </SelectDataContext.Provider>
    </SelectActionsContext.Provider>
  );
};

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  SearchInput: SelectSearchInput,
  Options: SelectOptions,
  Option: SelectOption,
});
