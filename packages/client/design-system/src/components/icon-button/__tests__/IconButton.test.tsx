import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IconButton } from '../index';

const TestIcon = () => <span data-testid="icon">X</span>;

describe('IconButton', () => {
  it('아이콘이 렌더링된다', () => {
    render(<IconButton icon={<TestIcon />} />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('label이 전달되면 텍스트가 표시된다', () => {
    render(<IconButton icon={<TestIcon />} label="Search" />);
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('클릭 시 onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<IconButton icon={<TestIcon />} onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 disabled 속성이 적용된다', () => {
    render(<IconButton icon={<TestIcon />} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
