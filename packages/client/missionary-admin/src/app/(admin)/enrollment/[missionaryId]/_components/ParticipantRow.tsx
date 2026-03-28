'use client';

import { TableCell, TableRow } from '@samilhero/design-system';

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
    <TableRow
      onClick={() => onClick(participant.id)}
      className={`cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-10' : ''
      }`}
    >
      {showCheckbox && (
        <TableCell className="w-[44px] px-3">
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
        </TableCell>
      )}
      <TableCell className="text-xs">
        {formatDateTime(participant.createdAt)}
      </TableCell>
      <TableCell className="font-semibold text-gray-900">
        {participant.name}
      </TableCell>
      <TableCell className="text-xs">
        {participant.birthDate
          ? new Date(participant.birthDate).toLocaleDateString('ko-KR')
          : '—'}
      </TableCell>
      <TableCell className="text-xs">
        {participant.affiliation || '—'}
      </TableCell>
      <TableCell className="text-xs">
        {participant.attendanceOption?.label ?? '—'}
      </TableCell>
      <TableCell className="text-center text-xs">
        {participant.cohort ?? '—'}
      </TableCell>
      <TableCell>
        <PaymentBadge
          isPaid={participant.isPaid}
          onToggle={() => onTogglePayment(participant.id, !participant.isPaid)}
        />
      </TableCell>
      <TableCell className="text-xs">
        {participant.team?.teamName ?? '—'}
      </TableCell>
      {customFields.map((field) => {
        const answer = participant.formAnswers.find(
          (a) => a.formFieldId === field.id,
        );
        return (
          <TableCell key={field.id} className="text-xs">
            {answer?.value != null && answer.value !== '' ? (
              answer.value
            ) : (
              <span className="text-gray-300">미입력</span>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
