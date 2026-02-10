import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { Checkbox } from '../index';

describe('Checkbox RHF Integration', () => {
  it('register() spread로 폼 통합 시 클릭하면 값이 true로 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { agree: false },
      });

      return (
        <form>
          <Checkbox {...register('agree')} data-testid="checkbox">
            <span>동의</span>
          </Checkbox>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.agree));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const checkboxDiv = screen.getByText('동의').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('false');

    if (checkboxDiv) await user.click(checkboxDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('true');
  });

  it('register() spread로 폼 통합 시 다시 클릭하면 값이 false로 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { agree: false },
      });

      return (
        <form>
          <Checkbox {...register('agree')} data-testid="checkbox">
            <span>동의</span>
          </Checkbox>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.agree));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const checkboxDiv = screen.getByText('동의').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    if (checkboxDiv) await user.click(checkboxDiv);
    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('true');

    if (checkboxDiv) await user.click(checkboxDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('false');
  });

  it('disabled 상태에서는 클릭해도 값이 변경되지 않는다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { agree: false },
      });

      return (
        <form>
          <Checkbox {...register('agree')} disabled data-testid="checkbox">
            <span>동의</span>
          </Checkbox>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.agree));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const checkboxDiv = screen.getByText('동의').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('false');

    if (checkboxDiv) await user.click(checkboxDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('false');
  });

  it('uncontrolled 모드에서 defaultChecked로 내부 상태가 토글된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      return (
        <form>
          <Checkbox defaultChecked={false} data-testid="checkbox">
            <span>동의</span>
          </Checkbox>
        </form>
      );
    };

    render(<TestForm />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    const checkboxDiv = screen.getByText('동의').parentElement;

    expect(checkbox.checked).toBe(false);

    if (checkboxDiv) await user.click(checkboxDiv);
    expect(checkbox.checked).toBe(true);

    if (checkboxDiv) await user.click(checkboxDiv);
    expect(checkbox.checked).toBe(false);
  });
});
