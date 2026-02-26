import { type MissionStatus } from 'apis/missionary';
import { render, screen } from 'test/test-utils';

import { MissionStatusBadge } from './MissionStatusBadge';

describe('MissionStatusBadge', () => {
  it.each<[MissionStatus, string]>([
    ['ENROLLMENT_OPENED', '모집중'],
    ['ENROLLMENT_CLOSED', '모집종료'],
    ['IN_PROGRESS', '진행중'],
    ['COMPLETED', '완료'],
  ])('상태가 %s일 때 "%s" 텍스트를 렌더링한다', (status, expectedLabel) => {
    render(<MissionStatusBadge status={status} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('알 수 없는 상태일 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <MissionStatusBadge status={'UNKNOWN' as MissionStatus} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
