import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { Radio } from '../index';

describe('Radio RHF Integration', () => {
  it('register() spread로 폼 통합 시 value="a" 클릭하면 form 값이 "a"로 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { option: '' },
      });

      return (
        <form>
          <Radio {...register('option')} value="a">
            <span>Option A</span>
          </Radio>
          <Radio {...register('option')} value="b">
            <span>Option B</span>
          </Radio>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.option));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const radioADiv = screen.getByText('Option A').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('');

    if (radioADiv) await user.click(radioADiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('a');
  });

  it('register() spread로 폼 통합 시 다른 Radio 클릭하면 값이 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { option: 'a' },
      });

      return (
        <form>
          <Radio {...register('option')} value="a">
            <span>Option A</span>
          </Radio>
          <Radio {...register('option')} value="b">
            <span>Option B</span>
          </Radio>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.option));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const radioBDiv = screen.getByText('Option B').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('a');

    if (radioBDiv) await user.click(radioBDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('b');
  });

  it('disabled 상태에서는 클릭해도 값이 변경되지 않는다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { option: '' },
      });

      return (
        <form>
          <Radio {...register('option')} value="a" disabled>
            <span>Option A</span>
          </Radio>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.option));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const radioDiv = screen.getByText('Option A').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('');

    if (radioDiv) await user.click(radioDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('');
  });

  it('uncontrolled 모드에서 defaultChecked로 내부 상태가 관리된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      return (
        <form>
          <Radio defaultChecked={false} value="a">
            <span>Option A</span>
          </Radio>
          <Radio defaultChecked={true} value="b">
            <span>Option B</span>
          </Radio>
        </form>
      );
    };

    render(<TestForm />);

    const radioA = screen.getAllByRole('radio')[0] as HTMLInputElement;
    const radioB = screen.getAllByRole('radio')[1] as HTMLInputElement;
    const radioBDiv = screen.getByText('Option B').parentElement;

    expect(radioA.checked).toBe(false);
    expect(radioB.checked).toBe(true);

    if (radioBDiv) await user.click(radioBDiv);
    expect(radioB.checked).toBe(true);
  });
});
