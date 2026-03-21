import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TextareaField } from './index';

describe('TextareaField', () => {
  it('라벨과 textarea를 렌더링한다', () => {
    render(<TextareaField label="설명" placeholder="입력하세요" />);

    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('hideLabel이 true이면 라벨을 시각적으로 숨긴다', () => {
    render(<TextareaField label="설명" hideLabel />);

    const label = screen.getByText('설명');
    expect(label).toHaveClass('sr-only');
  });

  it('에러 메시지를 표시하고 aria 속성을 설정한다', () => {
    render(<TextareaField label="설명" error="필수 항목입니다" />);

    const textarea = screen.getByLabelText('설명');
    const errorMessage = screen.getByRole('alert');

    expect(errorMessage).toHaveTextContent('필수 항목입니다');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('error'),
    );
  });

  it('에러가 없으면 aria-invalid가 false이다', () => {
    render(<TextareaField label="설명" />);

    expect(screen.getByLabelText('설명')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });

  it('disabled 상태를 올바르게 적용한다', () => {
    render(<TextareaField label="설명" disabled />);

    expect(screen.getByLabelText('설명')).toBeDisabled();
  });

  it('readOnly 상태를 올바르게 적용한다', () => {
    render(<TextareaField label="설명" readOnly value="읽기 전용" />);

    expect(screen.getByLabelText('설명')).toHaveAttribute('readonly');
  });

  it('maxLength가 있으면 글자 수 카운터를 표시한다', () => {
    render(<TextareaField label="설명" value="안녕" maxLength={100} />);

    expect(screen.getByText('2 / 100')).toBeInTheDocument();
  });

  it('showCount만 있으면 현재 글자 수만 표시한다', () => {
    render(<TextareaField label="설명" value="안녕하세요" showCount />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('maxLength 초과 시 카운터에 에러 스타일이 적용된다', () => {
    const { container } = render(
      <TextareaField label="설명" value="abcde" maxLength={3} />,
    );

    const counter = container.querySelector('.text-error-60:last-child');
    expect(counter).toHaveTextContent('5 / 3');
  });

  it('maxLength가 소프트 한도로 동작한다 (native maxLength 미적용)', () => {
    render(<TextareaField label="설명" value="abcde" maxLength={3} />);

    const textarea = screen.getByLabelText('설명');
    expect(textarea).not.toHaveAttribute('maxLength');
  });

  it('에러와 카운터가 동시에 표시된다', () => {
    render(
      <TextareaField
        label="설명"
        value="abc"
        maxLength={200}
        error="에러입니다"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('에러입니다');
    expect(screen.getByText('3 / 200')).toBeInTheDocument();
  });

  it('카운터가 aria-describedby에 연결된다', () => {
    render(<TextareaField label="설명" value="abc" maxLength={200} />);

    const textarea = screen.getByLabelText('설명');
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('counter'),
    );
  });

  it('에러와 카운터 모두 aria-describedby에 연결된다', () => {
    render(
      <TextareaField
        label="설명"
        value="abc"
        maxLength={200}
        error="에러입니다"
      />,
    );

    const textarea = screen.getByLabelText('설명');
    const describedBy = textarea.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('error');
    expect(describedBy).toContain('counter');
  });

  it('onChange를 호출한다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<TextareaField label="설명" value="" onChange={handleChange} />);

    await user.type(screen.getByLabelText('설명'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('rows prop을 textarea에 전달한다', () => {
    render(<TextareaField label="설명" rows={5} />);

    expect(screen.getByLabelText('설명')).toHaveAttribute('rows', '5');
  });

  it('기본 rows는 3이다', () => {
    render(<TextareaField label="설명" />);

    expect(screen.getByLabelText('설명')).toHaveAttribute('rows', '3');
  });

  it('resize="none"이면 resize-none 클래스가 적용된다', () => {
    render(<TextareaField label="설명" resize="none" />);

    expect(screen.getByLabelText('설명')).toHaveClass('resize-none');
  });

  it('autoResize가 true이면 resize-none 클래스가 강제된다', () => {
    render(<TextareaField label="설명" autoResize resize="vertical" />);

    expect(screen.getByLabelText('설명')).toHaveClass('resize-none');
  });

  it('라벨이 없으면 label 요소를 렌더링하지 않는다', () => {
    const { container } = render(<TextareaField placeholder="입력" />);

    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('외부 id를 textarea에 전달한다', () => {
    render(<TextareaField label="설명" id="custom-id" />);

    expect(screen.getByLabelText('설명')).toHaveAttribute('id', 'custom-id');
  });

  it('객체 ref를 전달하면 textarea 요소가 할당된다', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextareaField label="설명" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('콜백 ref를 전달하면 textarea 요소로 호출된다', () => {
    const callbackRef = vi.fn();
    render(<TextareaField label="설명" ref={callbackRef} />);

    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('className이 래퍼 div에 적용된다', () => {
    const { container } = render(
      <TextareaField label="설명" className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
