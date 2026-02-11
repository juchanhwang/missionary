import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tab } from '../index';

const tabList = [
  { value: 'a', label: 'Tab A' },
  { value: 'b', label: 'Tab B' },
  { value: 'c', label: 'Tab C' },
];

describe('Tab', () => {
  it('탭 목록이 렌더링된다', () => {
    render(<Tab list={tabList} selectedValue="a" onChange={() => {}} />);
    expect(screen.getByText('Tab A')).toBeTruthy();
    expect(screen.getByText('Tab B')).toBeTruthy();
    expect(screen.getByText('Tab C')).toBeTruthy();
  });

  it('role="tablist" 컨테이너가 존재한다', () => {
    render(<Tab list={tabList} selectedValue="a" onChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeTruthy();
  });

  it('각 탭이 role="tab"을 가진다', () => {
    render(<Tab list={tabList} selectedValue="a" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('선택된 탭이 aria-selected=true를 가진다', () => {
    render(<Tab list={tabList} selectedValue="b" onChange={() => {}} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
  });

  it('탭 클릭 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Tab list={tabList} selectedValue="a" onChange={onChange} />);
    await user.click(screen.getByText('Tab B'));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});
