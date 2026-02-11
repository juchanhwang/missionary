import { render, screen } from '@testing-library/react';

import { Badge } from '../index';

describe('Badge', () => {
  it('children 텍스트가 렌더링된다', () => {
    render(<Badge variant="success">입금완료</Badge>);
    expect(screen.getByText('입금완료')).toBeTruthy();
  });

  it('variant가 없으면 default variant가 적용된다', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge.className).toContain('bg-gray-80');
  });

  it('success variant가 정상 적용된다', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('bg-green-10');
  });

  it('className이 전달되면 추가 클래스가 적용된다', () => {
    render(
      <Badge variant="info" className="custom-class">
        Info
      </Badge>,
    );
    const badge = screen.getByText('Info');
    expect(badge.className).toContain('custom-class');
  });
});
