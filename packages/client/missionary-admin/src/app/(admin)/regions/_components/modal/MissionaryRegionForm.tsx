'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, TextareaField } from '@samilhero/design-system';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useKakaoAddress } from '../../_hooks/useKakaoAddress';
import {
  missionaryRegionSchema,
  type MissionaryRegionFormValues,
} from '../../_schemas/missionaryRegionSchema';
import { formatDate } from '../../_utils/formatDate';
import { formatPhoneNumber } from '../../_utils/formatPhoneNumber';
import { MissionGroupSelect } from '../MissionGroupSelect';

import type { RegionListItem } from 'apis/missionaryRegion';

interface MissionaryRegionFormProps {
  mode: 'create' | 'edit';
  region?: RegionListItem;
  defaultMissionGroupId?: string;
  onSubmit: (data: MissionaryRegionFormValues) => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  isPending: boolean;
}

export function MissionaryRegionForm({
  mode,
  region,
  defaultMissionGroupId,
  onSubmit,
  onCancel,
  onDirtyChange,
  isPending,
}: MissionaryRegionFormProps) {
  const isEdit = mode === 'edit';
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const form = useForm<MissionaryRegionFormValues>({
    resolver: zodResolver(missionaryRegionSchema),
    mode: 'onBlur',
    defaultValues: {
      missionGroupId: isEdit
        ? (region?.missionGroup?.id ?? '')
        : (defaultMissionGroupId ?? ''),
      name: region?.name ?? '',
      pastorName: region?.pastorName ?? '',
      pastorPhone: formatPhoneNumber(region?.pastorPhone ?? ''),
      addressBasic: region?.addressBasic ?? '',
      addressDetail: region?.addressDetail ?? '',
      note: region?.note ?? '',
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const { openSearch } = useKakaoAddress({
    onSelect: (address) => {
      form.setValue('addressBasic', address, { shouldDirty: true });
      addressDetailRef.current?.focus();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-4">
          {/* 선교 그룹 */}
          <Controller
            name="missionGroupId"
            control={form.control}
            render={({ field }) => (
              <MissionGroupSelect
                value={field.value}
                onChange={field.onChange}
                label="선교 그룹 *"
              />
            )}
          />

          {form.formState.errors.missionGroupId && (
            <p className="text-xs text-error-60">
              {form.formState.errors.missionGroupId.message}
            </p>
          )}

          <hr className="border-gray-100" />

          {/* 연계지 정보 */}
          <InputField
            label="이름 *"
            placeholder="연계지(교회) 이름"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="목사명"
              placeholder="담당 목사 이름"
              {...form.register('pastorName')}
            />
            <Controller
              name="pastorPhone"
              control={form.control}
              render={({ field, fieldState }) => (
                <InputField
                  label="목사연락처"
                  placeholder="010-0000-0000"
                  value={field.value ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(formatPhoneNumber(e.target.value));
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  error={fieldState.error?.message}
                  inputMode="numeric"
                  maxLength={13}
                />
              )}
            />
          </div>

          {/* 주소 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField
                label="기본주소"
                placeholder="주소 검색 버튼을 클릭하세요"
                readOnly
                className="[&_input]:bg-gray-50"
                {...form.register('addressBasic')}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                onClick={openSearch}
              >
                주소 검색
              </Button>
            </div>
          </div>

          <InputField
            label="상세주소"
            placeholder="상세 주소를 입력하세요"
            {...form.register('addressDetail')}
            ref={addressDetailRef}
          />

          {/* 비고 */}
          <TextareaField
            label="비고"
            placeholder="메모를 입력하세요"
            rows={3}
            {...form.register('note')}
          />

          {isEdit && region && (
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="생성일"
                value={formatDate(region.createdAt)}
                readOnly
              />
              <InputField
                label="수정일"
                value={formatDate(region.updatedAt)}
                readOnly
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="submit" size="md" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
