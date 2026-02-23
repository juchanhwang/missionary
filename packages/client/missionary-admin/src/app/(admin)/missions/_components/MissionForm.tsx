'use client';

import { DatePicker, InputField, Select } from '@samilhero/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { type MissionFormData } from '../_schemas/missionSchema';

const STATUS_LABELS: Record<string, string> = {
  ENROLLMENT_OPENED: '모집 중',
  ENROLLMENT_CLOSED: '모집 종료',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

interface MissionFormProps {
  form: UseFormReturn<MissionFormData>;
  isPending: boolean;
}

export function MissionForm({ form, isPending }: MissionFormProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* 기본 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          기본 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="차수"
            type="number"
            placeholder="차수"
            {...form.register('order', { valueAsNumber: true })}
            error={form.formState.errors.order?.message}
            disabled={isPending}
          />
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value ?? null}
                onChange={field.onChange}
                label="선교 상태"
              >
                <Select.Trigger disabled={isPending}>
                  {field.value
                    ? STATUS_LABELS[field.value]
                    : '상태를 선택하세요'}
                </Select.Trigger>
                <Select.Options>
                  <Select.Option item="ENROLLMENT_OPENED">
                    모집 중
                  </Select.Option>
                  <Select.Option item="ENROLLMENT_CLOSED">
                    모집 종료
                  </Select.Option>
                  <Select.Option item="IN_PROGRESS">진행 중</Select.Option>
                  <Select.Option item="COMPLETED">완료</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
        </div>

        <InputField
          label="선교 이름"
          placeholder="선교 이름을 입력하세요"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
          disabled={isPending}
        />

        <InputField
          label="선교 설명"
          placeholder="선교에 대한 설명을 입력하세요 (선택)"
          {...form.register('description')}
          disabled={isPending}
        />
      </fieldset>

      {/* 일정 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          일정
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="선교 시작일"
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.startDate?.message}
                disabled={isPending}
              />
            )}
          />
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="선교 종료일"
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.endDate?.message}
                disabled={isPending}
                minDate={form.watch('startDate') || undefined}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="participationStartDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="참가 신청 시작일"
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.participationStartDate?.message}
                disabled={isPending}
              />
            )}
          />
          <Controller
            name="participationEndDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="참가 신청 종료일"
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.participationEndDate?.message}
                disabled={isPending}
                minDate={form.watch('participationStartDate') || undefined}
              />
            )}
          />
        </div>
      </fieldset>

      {/* 담당자 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          담당자 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="담당 교역자"
            placeholder="담당 교역자 이름을 입력하세요"
            {...form.register('pastorName')}
            error={form.formState.errors.pastorName?.message}
            disabled={isPending}
          />
          <InputField
            label="담당 교역자 연락처"
            placeholder="010-0000-0000"
            {...form.register('pastorPhone')}
            disabled={isPending}
          />
        </div>
      </fieldset>

      {/* 참가 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          참가 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="참가 비용 (원)"
            type="number"
            placeholder="0"
            {...form.register('price', { valueAsNumber: true })}
            disabled={isPending}
          />
          <InputField
            label="최대 참가 인원"
            type="number"
            placeholder="0"
            {...form.register('maximumParticipantCount', {
              valueAsNumber: true,
            })}
            disabled={isPending}
          />
        </div>
      </fieldset>

      {/* 입금 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          입금 정보
        </legend>

        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="은행명"
            placeholder="국민은행"
            {...form.register('bankName')}
            disabled={isPending}
          />
          <InputField
            label="예금주"
            placeholder="예금주명"
            {...form.register('bankAccountHolder')}
            disabled={isPending}
          />
          <InputField
            label="계좌번호"
            placeholder="000-000-000000"
            {...form.register('bankAccountNumber')}
            disabled={isPending}
          />
        </div>
      </fieldset>
    </div>
  );
}
