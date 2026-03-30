import { z } from 'zod';

import type { FormFieldType } from 'apis/formField';

export const formFieldSchema = z.object({
  fieldType: z.enum([
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'BOOLEAN',
    'SELECT',
    'DATE',
  ] as const satisfies readonly FormFieldType[]),
  label: z.string().min(1, '라벨을 입력해주세요'),
  placeholder: z.string().optional(),
  isRequired: z.boolean(),
  options: z.array(z.string()).optional(),
});

export type FormFieldFormValues = z.infer<typeof formFieldSchema>;
