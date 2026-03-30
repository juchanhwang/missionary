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
  formatDateTime,
  maskIdentificationNumber,
} from '../../_utils/formatParticipant';

import type {
  AttendanceOption,
  FormFieldDefinition,
  Participation,
} from 'apis/participation';

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <input
        type="text"
        className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none"
        value={value}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

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
      <div className="flex-1 p-5">
        {/* 기본 정보 (읽기 전용) */}
        <section className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Lock size={11} className="text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              기본 정보
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyField label="이름" value={participant.name} />
            <ReadonlyField
              label="주민등록번호"
              value={
                participant.identificationNumber
                  ? maskIdentificationNumber(participant.identificationNumber)
                  : '-'
              }
            />
            <ReadonlyField
              label="등록일시"
              value={formatDateTime(participant.createdAt)}
            />
            <ReadonlyField
              label="소속 팀"
              value={participant.team?.teamName ?? '-'}
            />
          </div>
        </section>

        <hr className="my-4 border-gray-100" />

        {/* 참석 정보 (편집 가능) */}
        <section className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                  참석 일정 <span className="text-red-600">*</span>
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">
                  기수 <span className="text-red-600">*</span>
                </label>
                <InputField
                  type="number"
                  value={String(field.value)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={!isAdmin}
                />
              </div>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="hasPastParticipation"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500 leading-none">
                    과거 참여 여부
                  </label>
                  <Switch
                    className="shrink-0"
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
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500 leading-none">
                    대학생 여부
                  </label>
                  <Switch
                    className="shrink-0"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={!isAdmin}
                  />
                </div>
              )}
            />
          </div>
        </section>

        {/* 추가 신청 정보 (커스텀 필드) */}
        {formFields.length > 0 && (
          <>
            <hr className="my-4 border-gray-100" />
            <section className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Lock size={11} className="text-gray-400" />
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  추가 신청 정보
                </h4>
              </div>
              <Controller
                control={control}
                name="answers"
                render={({ field: answersField }) => (
                  <div className="space-y-3">
                    {formFields.map((formField, index) => {
                      const answerValue =
                        answersField.value[index]?.value ?? '';
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
          </>
        )}
      </div>

      {/* 푸터 액션 (ADMIN만) — 하단 고정 */}
      {isAdmin && (
        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-3">
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
