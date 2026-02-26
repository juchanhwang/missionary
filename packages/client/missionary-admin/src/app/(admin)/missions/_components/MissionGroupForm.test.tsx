import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionGroupForm } from './MissionGroupForm';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../_schemas/missionGroupSchema';

function TestHarness({
  isPending = false,
  onSubmit = vi.fn(),
}: {
  isPending?: boolean;
  onSubmit?: (data: MissionGroupSchemaType) => void;
}) {
  const form = useForm<MissionGroupSchemaType>({
    resolver: zodResolver(missionGroupSchema),
    defaultValues: { name: '', description: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <MissionGroupForm form={form} isPending={isPending} />
      <button type="submit">제출</button>
    </form>
  );
}

describe('MissionGroupForm', () => {
  it('그룹명, 선교 유형, 설명 필드를 렌더링한다', () => {
    render(<TestHarness />);

    expect(screen.getByLabelText('선교 그룹명')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '선교 유형 선택' }),
    ).toBeInTheDocument();
  });

  it('그룹명과 설명을 입력할 수 있다', async () => {
    const { user } = render(<TestHarness />);

    await user.type(screen.getByLabelText('선교 그룹명'), '필리핀 선교');
    await user.type(screen.getByLabelText('설명'), '여름 단기선교');

    expect(screen.getByLabelText('선교 그룹명')).toHaveValue('필리핀 선교');
    expect(screen.getByLabelText('설명')).toHaveValue('여름 단기선교');
  });

  it('선교 유형을 선택하면 선택된 값이 표시된다', async () => {
    const { user } = render(<TestHarness />);

    await user.click(screen.getByRole('button', { name: '선교 유형 선택' }));
    await user.click(screen.getByText('국내'));

    expect(screen.getByText('국내')).toBeInTheDocument();
  });

  it('필수 필드가 비어있으면 에러 메시지를 표시한다', async () => {
    const { user } = render(<TestHarness />);

    await user.click(screen.getByRole('button', { name: '제출' }));

    expect(
      await screen.findByText('선교 그룹명을 입력해주세요'),
    ).toBeInTheDocument();
    expect(screen.getByText('선교 유형을 선택해주세요')).toBeInTheDocument();
  });

  it('유효한 데이터를 제출하면 onSubmit이 호출된다', async () => {
    const handleSubmit = vi.fn();
    const { user } = render(<TestHarness onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('선교 그룹명'), '필리핀 선교');
    await user.click(screen.getByRole('button', { name: '선교 유형 선택' }));
    await user.click(screen.getByText('해외'));
    await user.click(screen.getByRole('button', { name: '제출' }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '필리핀 선교',
          category: 'ABROAD',
        }),
        expect.anything(),
      );
    });
  });

  it('isPending이 true면 모든 필드가 비활성화된다', () => {
    render(<TestHarness isPending />);

    expect(screen.getByLabelText('선교 그룹명')).toBeDisabled();
    expect(screen.getByLabelText('설명')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '선교 유형 선택' }),
    ).toBeDisabled();
  });
});
