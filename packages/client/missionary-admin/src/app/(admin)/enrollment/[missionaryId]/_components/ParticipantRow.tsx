'use client';

import { PaymentBadge } from './PaymentBadge';
import { formatDateTime } from '../_utils/formatParticipant';

import type { FormFieldDefinition, Participation } from 'apis/participation';

interface ParticipantRowProps {
  participant: Participation;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  customFields: FormFieldDefinition[];
  onCheck: (id: string) => void;
  onClick: (id: string) => void;
  onTogglePayment: (id: string, isPaid: boolean) => void;
}

export function ParticipantRow({
  participant,
  isSelected,
  isChecked,
  showCheckbox,
  customFields,
  onCheck,
  onClick,
  onTogglePayment,
}: ParticipantRowProps) {
  return (
    <tr
      onClick={() => onClick(participant.id)}
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-blue-10' : ''
      }`}
    >
      {showCheckbox && (
        <td className="w-[44px] px-3 py-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onCheck(participant.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300"
          />
        </td>
      )}
      <td className="w-[140px] px-4 py-3 text-gray-500 text-xs">
        {formatDateTime(participant.createdAt)}
      </td>
      <td className="w-[100px] px-4 py-3 font-medium text-gray-900">
        {participant.name}
      </td>
      <td className="w-[110px] px-4 py-3 text-gray-500 text-xs">
        {participant.birthDate
          ? new Date(participant.birthDate).toLocaleDateString('ko-KR')
          : '-'}
      </td>
      <td className="w-[120px] px-4 py-3 text-gray-500 text-xs">
        {participant.affiliation || '-'}
      </td>
      <td className="w-[110px] px-4 py-3 text-gray-500 text-xs">
        {participant.attendanceOption?.label ?? '-'}
      </td>
      <td className="w-[70px] px-4 py-3 text-center text-gray-500 text-xs">
        {participant.cohort ?? '-'}
      </td>
      <td className="w-[90px] px-4 py-3">
        <PaymentBadge
          isPaid={participant.isPaid}
          onToggle={() => onTogglePayment(participant.id, !participant.isPaid)}
        />
      </td>
      <td className="w-[90px] px-4 py-3 text-gray-500 text-xs">
        {participant.team?.teamName ?? '-'}
      </td>
      {/* 커스텀 필드 (최대 3개) */}
      {customFields.slice(0, 3).map((field) => {
        const answer = participant.formAnswers.find(
          (a) => a.formFieldId === field.id,
        );
        return (
          <td
            key={field.id}
            className="w-[100px] px-4 py-3 text-gray-500 text-xs"
          >
            {answer?.value || <span className="text-gray-300">미입력</span>}
          </td>
        );
      })}
    </tr>
  );
}
