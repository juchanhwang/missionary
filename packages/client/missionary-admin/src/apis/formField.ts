import api from './instance';

import type { FormFieldDefinition } from './participation';

// === 타입 정의 ===

export type { FormFieldDefinition };

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'SELECT'
  | 'DATE';

export interface CreateFormFieldPayload {
  fieldType: FormFieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  order: number;
  options?: string[];
}

export interface UpdateFormFieldPayload {
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  options?: string[];
}

// === API 함수 ===

export const formFieldApi = {
  getFormFields(missionaryId: string) {
    return api.get<FormFieldDefinition[]>(
      `/missionaries/${missionaryId}/form-fields`,
    );
  },

  createFormField(missionaryId: string, data: CreateFormFieldPayload) {
    return api.post<FormFieldDefinition>(
      `/missionaries/${missionaryId}/form-fields`,
      data,
    );
  },

  updateFormField(
    missionaryId: string,
    fieldId: string,
    data: UpdateFormFieldPayload,
  ) {
    return api.patch<FormFieldDefinition>(
      `/missionaries/${missionaryId}/form-fields/${fieldId}`,
      data,
    );
  },

  deleteFormField(missionaryId: string, fieldId: string) {
    return api.delete(`/missionaries/${missionaryId}/form-fields/${fieldId}`);
  },

  reorderFormFields(missionaryId: string, fieldIds: string[]) {
    return api.patch(`/missionaries/${missionaryId}/form-fields/reorder`, {
      fieldIds,
    });
  },
};
