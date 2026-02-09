'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  DatePicker,
  InputField,
  Select,
} from '@samilhero/design-system';
import { Controller, useForm } from 'react-hook-form';

import { useCreateMissionary } from './hooks/useCreateMissionary';
import { useRegions } from '../hooks/useRegions';
import { missionSchema, type MissionFormData } from '../schemas/missionSchema';

export default function CreateMissionPage() {
  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      pastorName: '',
      regionId: '',
    },
  });

  const { data: regions } = useRegions();
  const createMutation = useCreateMissionary();

  const onSubmit = (data: MissionFormData) => {
    createMutation.mutate(
      {
        name: data.name,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        pastorName: data.pastorName,
        regionId: data.regionId,
        participationStartDate: data.participationStartDate.toISOString(),
        participationEndDate: data.participationEndDate.toISOString(),
      },
      {
        onError: (error) => {
          console.error('Failed to create missionary:', error);
        },
      },
    );
  };

  const selectedRegion = regions?.find((r) => r.id === form.watch('regionId'));

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">신규 국내선교 생성</h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <InputField
          label="선교 이름"
          placeholder="선교 이름을 입력하세요"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
          disabled={createMutation.isPending}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="선교 시작일"
                selected={field.value}
                onChange={field.onChange}
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.startDate?.message}
                disabled={createMutation.isPending}
              />
            )}
          />
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="선교 종료일"
                selected={field.value}
                onChange={field.onChange}
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.endDate?.message}
                disabled={createMutation.isPending}
                minDate={form.watch('startDate') || undefined}
              />
            )}
          />
        </div>

        <InputField
          label="담당 교역자"
          placeholder="담당 교역자 이름을 입력하세요"
          {...form.register('pastorName')}
          error={form.formState.errors.pastorName?.message}
          disabled={createMutation.isPending}
        />

        <div className="flex flex-col gap-1 relative">
          <label className="text-xs font-normal leading-[1.833] text-gray-70">
            지역
          </label>
          <Controller
            name="regionId"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange}>
                <Select.Trigger
                  type="button"
                  className={`w-full flex items-center justify-between h-12 px-4 rounded-lg bg-gray-02 text-sm ${
                    !field.value ? 'text-gray-30' : 'text-black'
                  }`}
                >
                  {selectedRegion ? selectedRegion.name : '지역을 선택하세요'}
                </Select.Trigger>
                <Select.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-10 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {regions?.map((region) => (
                    <Select.Option
                      key={region.id}
                      item={region.id}
                      className="px-4 py-2 hover:bg-gray-05 cursor-pointer text-sm"
                    >
                      {region.name}
                    </Select.Option>
                  ))}
                </Select.Options>
              </Select>
            )}
          />
          {form.formState.errors.regionId && (
            <div className="mt-1 text-error-60 text-xs leading-[1.5]">
              {form.formState.errors.regionId.message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="participationStartDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="참가 신청 시작일"
                selected={field.value}
                onChange={field.onChange}
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.participationStartDate?.message}
                disabled={createMutation.isPending}
              />
            )}
          />
          <Controller
            name="participationEndDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="참가 신청 종료일"
                selected={field.value}
                onChange={field.onChange}
                placeholder="YYYY-MM-DD"
                error={form.formState.errors.participationEndDate?.message}
                disabled={createMutation.isPending}
                minDate={form.watch('participationStartDate') || undefined}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            size="lg"
            className="w-full"
            color="primary"
          >
            {createMutation.isPending ? '생성 중...' : '생성하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
