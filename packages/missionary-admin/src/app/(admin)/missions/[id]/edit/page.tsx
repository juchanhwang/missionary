'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  InputField,
  DatePicker,
  Select,
} from '@samilhero/design-system';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { useDeleteMissionary } from '../../hooks/useDeleteMissionary';
import { useMissionary } from '../../hooks/useMissionary';
import { useRegions } from '../../hooks/useRegions';
import { useUpdateMissionary } from '../../hooks/useUpdateMissionary';
import {
  missionSchema,
  type MissionFormData,
} from '../../schemas/missionSchema';

export default function MissionaryEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: missionary, isLoading: isMissionaryLoading } =
    useMissionary(id);
  const { data: regions } = useRegions();

  const updateMutation = useUpdateMissionary(id);
  const deleteMutation = useDeleteMissionary(id);

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      pastorName: '',
      regionId: '',
    },
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (missionary) {
      form.reset({
        name: missionary.name,
        startDate: new Date(missionary.startDate),
        endDate: new Date(missionary.endDate),
        pastorName: missionary.pastorName || '',
        regionId: missionary.regionId || '',
        participationStartDate: new Date(missionary.participationStartDate),
        participationEndDate: new Date(missionary.participationEndDate),
      });
    }
  }, [missionary, form]);

  const onSubmit = (data: MissionFormData) => {
    updateMutation.mutate(
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
        onSuccess: () => {
          router.push('/missions');
        },
        onError: (error) => {
          console.error('Failed to update missionary:', error);
        },
      },
    );
  };

  if (isMissionaryLoading) {
    return (
      <div className="flex justify-center items-center h-full">로딩 중...</div>
    );
  }

  if (!missionary) {
    return (
      <div className="flex justify-center items-center h-full">
        선교를 찾을 수 없습니다
      </div>
    );
  }

  const selectedRegion = regions?.find((r) => r.id === form.watch('regionId'));

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">선교 수정</h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <InputField
          label="선교 이름"
          placeholder="선교 이름을 입력하세요"
          {...form.register('name')}
          error={form.formState.errors.name?.message}
          disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
          disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
                minDate={form.watch('participationStartDate') || undefined}
              />
            )}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1"
            size="lg"
            color="primary"
          >
            {updateMutation.isPending ? '수정 중...' : '수정하기'}
          </Button>
          <Button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            color="secondary"
            className="flex-1 bg-error-60 hover:bg-error-70 text-white"
            size="lg"
          >
            삭제하기
          </Button>
        </div>
      </form>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setIsDeleteModalOpen(false)}
        missionaryName={missionary?.name || ''}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
