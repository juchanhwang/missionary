import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';

import type { LocalFormField } from '../_components/FormFieldSettings';
import type { FormFieldDefinition } from 'apis/formField';

export interface LocalFormFieldWithMeta extends LocalFormField {
  hasAnswers: boolean;
  isNew?: boolean;
}

let tempIdCounter = 0;

function createTempId() {
  return `temp-${Date.now()}-${++tempIdCounter}`;
}

function createEmptyField(): LocalFormFieldWithMeta {
  return {
    id: createTempId(),
    fieldType: 'TEXT',
    label: '',
    placeholder: null,
    isRequired: false,
    options: null,
    hasAnswers: false,
    isNew: true,
  };
}

export function useLocalFields(serverFields: FormFieldDefinition[]) {
  const [localFields, setLocalFields] = useState<LocalFormFieldWithMeta[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [syncSource, setSyncSource] = useState<FormFieldDefinition[] | null>(
    null,
  );

  // 서버 → 로컬 동기화 (dirty가 아니고 서버 데이터가 변경되었을 때)
  if (!isDirty && serverFields !== syncSource) {
    setSyncSource(serverFields);
    setLocalFields(
      serverFields.map((f) => ({
        id: f.id,
        fieldType: f.fieldType,
        label: f.label,
        placeholder: f.placeholder,
        isRequired: f.isRequired,
        options: f.options,
        hasAnswers: f.hasAnswers,
      })),
    );
  }

  const addField = (): LocalFormFieldWithMeta => {
    const newField = createEmptyField();
    setLocalFields((prev) => [...prev, newField]);
    setIsDirty(true);
    return newField;
  };

  const deleteField = (id: string) => {
    setLocalFields((prev) => prev.filter((f) => f.id !== id));
    setIsDirty(true);
  };

  const changeField = (id: string, updates: Partial<LocalFormField>) => {
    setLocalFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
    setIsDirty(true);
  };

  const reorderFields = (activeId: string, overId: string) => {
    setLocalFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === activeId);
      const newIndex = prev.findIndex((f) => f.id === overId);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setIsDirty(true);
  };

  const resetDirty = () => setIsDirty(false);

  return {
    localFields,
    isDirty,
    addField,
    deleteField,
    changeField,
    reorderFields,
    resetDirty,
  };
}
