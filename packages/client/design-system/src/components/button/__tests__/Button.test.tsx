import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '../index';

describe('Button', () => {
  it('children 텍스트가 렌더링된다', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy();
  });

  it('클릭 시 onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭해도 onClick이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled 상태일 때 disabled 속성이 적용된다', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('className이 전달되면 추가 클래스가 적용된다', () => {
    render(<Button className="custom-class">Click</Button>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });
});
