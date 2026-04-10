'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Select } from '@samilhero/design-system';
import { Controller, useForm } from 'react-hook-form';

import { teamSchema, type TeamFormValues } from './_schemas/teamSchema';
import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';

interface TeamFormProps {
  mode: 'create' | 'edit';
  defaultValues: TeamFormValues;
  participations: Participation[];
  regions: RegionListItem[];
  currentTeamId?: string | null;
  isPending: boolean;
  onSubmit: (values: TeamFormValues) => void;
  onCancel: () => void;
}

/**
 * 팀 생성/수정 공용 폼. fe-plan v1.2 §3-1, mockup Screen 3 & 4.
 *
 * - `팀 이름` InputField (필수)
 * - `팀장` Select (필수, 참가자 중 선택, value = participation.userId)
 * - `연계지` Select (선택)
 *
 * TeamCreateModal/TeamEditModal이 이 컴포넌트를 재사용하여 UI 일관성 확보.
 * 폼 상태·검증은 react-hook-form + zod (`teamSchema`)가 담당.
 */
export function TeamForm({
  mode,
  defaultValues,
  participations,
  regions,
  currentTeamId = null,
  isPending,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  const isCreate = mode === 'create';

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    mode: 'onBlur',
    defaultValues,
  });

  const selectedLeaderUserId = form.watch('leaderUserId');
  const leaderCandidates = getLeaderCandidates(
    participations,
    currentTeamId,
    selectedLeaderUserId,
  );
  const selectedLeader = participations.find(
    (p) => p.userId === selectedLeaderUserId,
  );

  const selectedRegionId = form.watch('missionaryRegionId') ?? '';
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3.5 px-6 pb-6"
      noValidate
    >
      <InputField
        label="팀 이름 *"
        placeholder="팀 이름을 입력하세요"
        error={form.formState.errors.teamName?.message}
        disabled={isPending}
        {...form.register('teamName')}
      />

      <Controller
        name="leaderUserId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Select
            value={field.value || null}
            onChange={(value) => field.onChange((value as string) ?? '')}
            onBlur={field.onBlur}
            label="팀장 *"
            size="md"
            error={fieldState.error?.message}
          >
            <Select.Trigger disabled={isPending}>
              {selectedLeader ? (
                <TeamLeaderOptionLabel participation={selectedLeader} />
              ) : (
                <span className="text-gray-400">등록자 중 선택</span>
              )}
            </Select.Trigger>
            <Select.Options>
              {leaderCandidates.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">
                  선택 가능한 참가자가 없습니다
                </div>
              ) : (
                leaderCandidates.map((participation) => (
                  <Select.Option
                    key={participation.userId}
                    item={participation.userId}
                  >
                    <TeamLeaderOptionLabel participation={participation} />
                  </Select.Option>
                ))
              )}
            </Select.Options>
          </Select>
        )}
      />

      <Controller
        name="missionaryRegionId"
        control={form.control}
        render={({ field }) => (
          <Select
            value={field.value || null}
            onChange={(value) => field.onChange((value as string) ?? '')}
            label="연계지"
            size="md"
          >
            <Select.Trigger disabled={isPending}>
              {selectedRegion ? (
                selectedRegion.name
              ) : (
                <span className="text-gray-400">선택 안 함</span>
              )}
            </Select.Trigger>
            <Select.Options>
              <Select.Option item="">선택 안 함</Select.Option>
              {regions.map((region) => (
                <Select.Option key={region.id} item={region.id}>
                  {region.name}
                </Select.Option>
              ))}
            </Select.Options>
          </Select>
        )}
      />

      <div className="mt-2 flex justify-end gap-2.5">
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
        <Button
          type="submit"
          variant="filled"
          color="primary"
          size="md"
          disabled={isPending}
        >
          {isCreate ? '팀 생성' : '저장'}
        </Button>
      </div>
    </form>
  );
}

function getLeaderCandidates(
  participations: Participation[],
  currentTeamId: string | null,
  selectedLeaderUserId: string,
) {
  return participations.filter((participation) => {
    if (participation.userId === selectedLeaderUserId) {
      return true;
    }

    return (
      participation.teamId === null || participation.teamId === currentTeamId
    );
  });
}

function TeamLeaderOptionLabel({
  participation,
}: {
  participation: Participation;
}) {
  const subText = getParticipationSubText(participation);
  return (
    <span className="text-sm text-gray-900">
      {participation.name}
      {subText !== null && <span className="text-gray-400"> ({subText})</span>}
    </span>
  );
}
