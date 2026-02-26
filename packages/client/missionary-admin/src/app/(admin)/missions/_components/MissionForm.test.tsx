import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionForm } from './MissionForm';
import { missionSchema, type MissionFormData } from '../_schemas/missionSchema';

function TestHarness({
  isPending = false,
  onSubmit = vi.fn(),
}: {
  isPending?: boolean;
  onSubmit?: (data: MissionFormData) => void;
}) {
  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    defaultValues: { name: '', pastorName: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <MissionForm form={form} isPending={isPending} />
      <button type="submit">제출</button>
    </form>
  );
}

describe('MissionForm', () => {
  it('5개 fieldset 제목을 렌더링한다', () => {
    render(<TestHarness />);

    expect(screen.getByText('기본 정보')).toBeInTheDocument();
    expect(screen.getByText('일정')).toBeInTheDocument();
    expect(screen.getByText('담당자 정보')).toBeInTheDocument();
    expect(screen.getByText('참가 정보')).toBeInTheDocument();
    expect(screen.getByText('입금 정보')).toBeInTheDocument();
  });

  it('텍스트 필드를 입력할 수 있다', async () => {
    const { user } = render(<TestHarness />);

    await user.type(screen.getByLabelText('선교 이름'), '필리핀 단기선교');
    await user.type(screen.getByLabelText('담당 교역자'), '김목사');
    await user.type(screen.getByLabelText('선교 설명'), '여름 선교');

    expect(screen.getByLabelText('선교 이름')).toHaveValue('필리핀 단기선교');
    expect(screen.getByLabelText('담당 교역자')).toHaveValue('김목사');
    expect(screen.getByLabelText('선교 설명')).toHaveValue('여름 선교');
  });

  it('날짜 입력 필드를 렌더링한다', () => {
    render(<TestHarness />);

    expect(screen.getByLabelText('선교 시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('선교 종료일')).toBeInTheDocument();
    expect(screen.getByLabelText('참가 신청 시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('참가 신청 종료일')).toBeInTheDocument();
  });

  it('필수 필드가 비어있으면 에러 메시지를 표시한다', async () => {
    const { user } = render(<TestHarness />);

    await user.click(screen.getByRole('button', { name: '제출' }));

    expect(
      await screen.findByText('선교 이름을 입력해주세요'),
    ).toBeInTheDocument();
    expect(screen.getByText('담당 교역자를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByText('선교 시작일을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('선교 종료일을 선택해주세요')).toBeInTheDocument();
  });

  it('선교 상태를 선택할 수 있다', async () => {
    const { user } = render(<TestHarness />);

    await user.click(screen.getByRole('button', { name: '상태를 선택하세요' }));
    await user.click(screen.getByText('모집 중'));

    expect(screen.getByText('모집 중')).toBeInTheDocument();
  });

  it('isPending이 true면 입력 필드가 비활성화된다', () => {
    render(<TestHarness isPending />);

    expect(screen.getByLabelText('선교 이름')).toBeDisabled();
    expect(screen.getByLabelText('담당 교역자')).toBeDisabled();
    expect(screen.getByLabelText('선교 시작일')).toBeDisabled();
    expect(screen.getByLabelText('선교 종료일')).toBeDisabled();
    expect(screen.getByLabelText('참가 비용 (원)')).toBeDisabled();
    expect(screen.getByLabelText('최대 참가 인원')).toBeDisabled();
  });
});
