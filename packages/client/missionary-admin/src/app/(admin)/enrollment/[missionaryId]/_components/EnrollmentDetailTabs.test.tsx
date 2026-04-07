import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { EnrollmentDetailTabs } from './EnrollmentDetailTabs';

function renderTabs() {
  return render(
    <EnrollmentDetailTabs
      participantsContent={
        <div data-testid="panel-participants">참가자 패널</div>
      }
      teamsContent={<div data-testid="panel-teams">팀 패널</div>}
    />,
  );
}

describe('EnrollmentDetailTabs', () => {
  it('기본 탭은 "참가자 목록"이고 해당 패널만 표시된다', () => {
    renderTabs();

    const participantsTab = screen.getByRole('tab', { name: '참가자 목록' });
    const teamsTab = screen.getByRole('tab', { name: '팀 관리' });

    expect(participantsTab).toHaveAttribute('aria-selected', 'true');
    expect(teamsTab).toHaveAttribute('aria-selected', 'false');

    // 양쪽 콘텐츠는 모두 마운트되어 있어야 한다 (R-10: display 토글 전략)
    expect(screen.getByTestId('panel-participants')).toBeInTheDocument();
    expect(screen.getByTestId('panel-teams')).toBeInTheDocument();

    // 비활성 탭 패널은 hidden 속성으로 가려진다
    const teamsPanel = screen.getByTestId('panel-teams').parentElement;
    expect(teamsPanel).toHaveAttribute('hidden');

    const participantsPanel =
      screen.getByTestId('panel-participants').parentElement;
    expect(participantsPanel).not.toHaveAttribute('hidden');
  });

  it('"팀 관리" 탭을 클릭하면 활성 탭이 전환되고 팀 패널이 노출된다', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: '팀 관리' }));

    expect(screen.getByRole('tab', { name: '팀 관리' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: '참가자 목록' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    const participantsPanel =
      screen.getByTestId('panel-participants').parentElement;
    const teamsPanel = screen.getByTestId('panel-teams').parentElement;

    expect(participantsPanel).toHaveAttribute('hidden');
    expect(teamsPanel).not.toHaveAttribute('hidden');
  });

  it('탭을 전환해도 양쪽 콘텐츠는 unmount되지 않는다', async () => {
    const user = userEvent.setup();
    renderTabs();

    expect(screen.getByTestId('panel-participants')).toBeInTheDocument();
    expect(screen.getByTestId('panel-teams')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '팀 관리' }));

    // 두 콘텐츠 모두 여전히 DOM에 존재 (display 토글만)
    expect(screen.getByTestId('panel-participants')).toBeInTheDocument();
    expect(screen.getByTestId('panel-teams')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '참가자 목록' }));

    expect(screen.getByTestId('panel-participants')).toBeInTheDocument();
    expect(screen.getByTestId('panel-teams')).toBeInTheDocument();
  });
});
