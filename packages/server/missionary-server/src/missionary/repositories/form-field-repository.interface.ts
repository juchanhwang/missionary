import type {
  MissionaryFormField,
  Prisma,
} from '../../../prisma/generated/prisma';

type JsonValue = Prisma.InputJsonValue;

export interface FormFieldCreateInput {
  missionaryId: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE';
  label: string;
  placeholder?: string | null;
  isRequired: boolean;
  order: number;
  options?: JsonValue | null;
  createdBy?: string;
}

export interface FormFieldUpdateInput {
  label?: string;
  placeholder?: string | null;
  isRequired?: boolean;
  order?: number;
  options?: JsonValue | null;
  updatedBy?: string;
}

export interface FormFieldRepository {
  create(data: FormFieldCreateInput): Promise<MissionaryFormField>;
  findByMissionary(missionaryId: string): Promise<MissionaryFormField[]>;
  findById(id: string): Promise<MissionaryFormField | null>;
  update(id: string, data: FormFieldUpdateInput): Promise<MissionaryFormField>;
  delete(id: string): Promise<MissionaryFormField>;
  reorderBulk(items: { id: string; order: number }[]): Promise<void>;
  countAnswersByFields(fieldIds: string[]): Promise<Record<string, number>>;
}

export const FORM_FIELD_REPOSITORY = Symbol('FORM_FIELD_REPOSITORY');
