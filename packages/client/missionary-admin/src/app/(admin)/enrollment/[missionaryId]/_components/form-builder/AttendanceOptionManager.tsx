'use client';

import { Badge, Button, InputField, Select } from '@samilhero/design-system';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateAttendanceOption,
  useDeleteAttendanceOption,
} from '../../_hooks/useAttendanceOptionMutations';
import { useGetAttendanceOptions } from '../../_hooks/useGetAttendanceOptions';

const TYPE_LABELS: Record<string, string> = {
  FULL: '전체 참석',
  PARTIAL: '부분 참석',
};

interface AttendanceOptionManagerProps {
  missionaryId: string;
}

export function AttendanceOptionManager({
  missionaryId,
}: AttendanceOptionManagerProps) {
  const { data: options = [] } = useGetAttendanceOptions({ missionaryId });
  const createOption = useCreateAttendanceOption(missionaryId);
  const deleteOption = useDeleteAttendanceOption(missionaryId);

  const [newType, setNewType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      toast.error('참석 옵션 라벨을 입력해주세요.');
      return;
    }

    createOption.mutate(
      { type: newType, label: trimmed },
      {
        onSuccess: () => {
          setNewLabel('');
        },
      },
    );
  };

  const handleDelete = (optionId: string) => {
    deleteOption.mutate(optionId);
  };

  return (
    <section className="space-y-3">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-gray-900">참석 옵션 관리</h3>
      </div>

      {/* 기존 옵션 목록 */}
      <div className="space-y-2">
        {options.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            등록된 참석 옵션이 없습니다.
          </p>
        )}
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <Badge variant={option.type === 'FULL' ? 'info' : 'outline'}>
              {TYPE_LABELS[option.type] ?? option.type}
            </Badge>
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
              {option.label}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(option.id)}
              disabled={deleteOption.isPending}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-error-10 hover:text-error-60 disabled:opacity-50"
              aria-label={`${option.label} 삭제`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 새 옵션 추가 */}
      <div className="flex items-end gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-1 w-36">
          <label className="text-xs font-medium text-gray-500">유형</label>
          <Select
            value={newType}
            onChange={(v) => setNewType((v as 'FULL' | 'PARTIAL') ?? 'FULL')}
          >
            <Select.Trigger>{TYPE_LABELS[newType]}</Select.Trigger>
            <Select.Options>
              <Select.Option item="FULL">전체 참석</Select.Option>
              <Select.Option item="PARTIAL">부분 참석</Select.Option>
            </Select.Options>
          </Select>
        </div>
        <div className="flex-1">
          <InputField
            label="라벨"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="예: 1박2일, 당일참석"
          />
        </div>
        <Button
          variant="outline"
          color="primary"
          size="md"
          onClick={handleAdd}
          disabled={createOption.isPending || !newLabel.trim()}
        >
          추가
        </Button>
      </div>
    </section>
  );
}
