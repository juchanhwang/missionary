'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField } from '@samilhero/design-system';
import { useForm } from 'react-hook-form';

import {
  type MissionaryRegionFormValues,
  missionaryRegionSchema,
} from '../../_schemas/missionaryRegionSchema';

interface MissionaryRegionFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<MissionaryRegionFormValues>;
  isPending: boolean;
  onSubmit: (data: MissionaryRegionFormValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function MissionaryRegionForm({
  defaultValues,
  isPending,
  onSubmit,
  onCancel,
  onDirtyChange,
}: MissionaryRegionFormProps) {
  const form = useForm<MissionaryRegionFormValues>({
    resolver: zodResolver(missionaryRegionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      visitPurpose: '',
      pastorName: '',
      pastorPhone: '',
      addressBasic: '',
      addressDetail: '',
      ...defaultValues,
    },
  });

  const { formState } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="이름"
        placeholder="연계지(교회) 이름을 입력하세요"
        error={formState.errors.name?.message}
        aria-required="true"
        {...form.register('name')}
      />

      <InputField
        label="방문목적"
        placeholder="예) 단기선교, 교류 방문"
        {...form.register('visitPurpose')}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="목사명"
          placeholder="담당 목사 이름"
          {...form.register('pastorName')}
        />
        <InputField
          label="목사연락처"
          placeholder="010-0000-0000"
          {...form.register('pastorPhone')}
        />
      </div>

      <InputField
        label="기본주소"
        placeholder="도로명 주소 또는 지번 주소"
        {...form.register('addressBasic')}
      />

      <InputField
        label="상세주소"
        placeholder="건물명, 층, 호수 등"
        {...form.register('addressDetail')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => {
            if (formState.isDirty && onDirtyChange) {
              onDirtyChange(true);
              return;
            }
            onCancel();
          }}
        >
          취소
        </Button>
        <Button type="submit" variant="filled" size="md" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
