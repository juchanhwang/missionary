import userEvent from '@testing-library/user-event';
import { render, screen } from 'test/test-utils';

import { NewTeamGhostColumn } from './NewTeamGhostColumn';

describe('NewTeamGhostColumn', () => {
  it('"새 팀" 라벨과 Ghost 컬럼을 렌더한다', () => {
    render(<NewTeamGhostColumn onClick={() => {}} />);

    expect(screen.getByTestId('new-team-ghost-column')).toBeInTheDocument();
    expect(screen.getByText('새 팀')).toBeInTheDocument();
  });

  it('onClick이 없으면 disabled 상태가 된다', () => {
    render(<NewTeamGhostColumn />);

    expect(screen.getByTestId('new-team-ghost-column')).toBeDisabled();
  });

  it('클릭 시 onClick 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NewTeamGhostColumn onClick={onClick} />);

    await user.click(screen.getByTestId('new-team-ghost-column'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
