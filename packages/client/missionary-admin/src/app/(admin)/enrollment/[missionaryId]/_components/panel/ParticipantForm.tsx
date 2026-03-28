'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Select, Switch } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { Lock } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CustomFieldInput } from './CustomFieldInput';
import {
  participantSchema,
  type ParticipantFormValues,
} from '../../_schemas/participantSchema';
import {
  formatBirthDate,
  formatDateTime,
} from '../../_utils/formatParticipant';

import type {
  AttendanceOption,
  FormFieldDefinition,
  Participation,
} from 'apis/participation';

interface ParticipantFormProps {
  participant: Participation;
  attendanceOptions: AttendanceOption[];
  formFields: FormFieldDefinition[];
  onSubmit: (data: ParticipantFormValues) => void;
  onDirtyChange: (dirty: boolean) => void;
  isPending: boolean;
}

export function ParticipantForm({
  participant,
  attendanceOptions,
  formFields,
  onSubmit,
  onDirtyChange,
  isPending,
}: ParticipantFormProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      affiliation: participant.affiliation ?? '',
      attendanceOptionId: participant.attendanceOptionId,
      cohort: participant.cohort,
      hasPastParticipation: participant.hasPastParticipation ?? false,
      isCollegeStudent: participant.isCollegeStudent ?? false,
      answers: formFields.map((field) => {
        const existing = participant.formAnswers.find(
          (a) => a.formFieldId === field.id,
        );
        return {
          formFieldId: field.id,
          value: existing?.value ?? '',
        };
      }),
    },
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const selectedOption = attendanceOptions.find(
    (o) => o.id === participant.attendanceOptionId,
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 overflow-y-auto"
    >
      <div className="flex-1 space-y-6 p-5">
        {/* 참석 정보 (편집 가능) */}
        <section className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            참석 정보
          </h4>
          <Controller
            control={control}
            name="affiliation"
            render={({ field }) => (
              <InputField
                label="소속"
                value={field.value}
                onChange={field.onChange}
                disabled={!isAdmin}
              />
            )}
          />
          <Controller
            control={control}
            name="attendanceOptionId"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  참석 일정
                </label>
                <Select
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ''))}
                >
                  <Select.Trigger>
                    {attendanceOptions.find((o) => o.id === field.value)
                      ?.label ??
                      selectedOption?.label ??
                      '선택'}
                  </Select.Trigger>
                  <Select.Options>
                    {attendanceOptions.map((option) => (
                      <Select.Option key={option.id} item={option.id}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select.Options>
                </Select>
              </div>
            )}
          />
          <Controller
            control={control}
            name="cohort"
            render={({ field }) => (
              <InputField
                label="기수"
                type="number"
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={!isAdmin}
              />
            )}
          />
          <Controller
            control={control}
            name="hasPastParticipation"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">
                  과거 참여 여부
                </label>
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={!isAdmin}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="isCollegeStudent"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">
                  대학생 여부
                </label>
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={!isAdmin}
                />
              </div>
            )}
          />
        </section>

        {/* 개인 정보 (읽기 전용) */}
        <section className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              개인 정보
            </h4>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">이름</span>
            <span className="text-sm text-gray-900">{participant.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">생년월일</span>
            <span className="text-sm text-gray-900">
              {participant.birthDate
                ? formatBirthDate(participant.birthDate)
                : '-'}
            </span>
          </div>
        </section>

        {/* 기본 정보 (읽기 전용) */}
        <section className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              기본 정보
            </h4>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">등록일시</span>
            <span className="text-sm text-gray-900">
              {formatDateTime(participant.createdAt)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">소속 팀</span>
            <span className="text-sm text-gray-900">
              {participant.team?.teamName ?? '-'}
            </span>
          </div>
        </section>

        {/* 추가 신청 정보 (커스텀 필드) */}
        {formFields.length > 0 && (
          <section className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              추가 신청 정보
            </h4>
            <Controller
              control={control}
              name="answers"
              render={({ field: answersField }) => (
                <div className="space-y-4">
                  {formFields.map((formField, index) => {
                    const answerValue = answersField.value[index]?.value ?? '';
                    return (
                      <CustomFieldInput
                        key={formField.id}
                        field={formField}
                        value={answerValue}
                        readOnly={!isAdmin}
                        onChange={(value) => {
                          const newAnswers = [...answersField.value];
                          newAnswers[index] = {
                            formFieldId: formField.id,
                            value,
                          };
                          answersField.onChange(newAnswers);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            />
          </section>
        )}
      </div>

      {/* 푸터 액션 (ADMIN만) */}
      {isAdmin && (
        <div className="shrink-0 flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => reset()}
            disabled={!isDirty}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="md"
            disabled={!isDirty || isPending}
          >
            저장
          </Button>
        </div>
      )}
    </form>
  );
}
