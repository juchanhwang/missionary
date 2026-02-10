import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { Switch } from '../index';

describe('Switch RHF Integration', () => {
  it('register() spread로 폼 통합 시 클릭하면 값이 true로 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { toggle: false },
      });

      return (
        <form>
          <Switch {...register('toggle')} data-testid="switch">
            <span>Toggle</span>
          </Switch>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.toggle));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const switchDiv = screen.getByText('Toggle').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('false');

    if (switchDiv) await user.click(switchDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('true');
  });

  it('register() spread로 폼 통합 시 다시 클릭하면 값이 false로 변경된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { toggle: false },
      });

      return (
        <form>
          <Switch {...register('toggle')} data-testid="switch">
            <span>Toggle</span>
          </Switch>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.toggle));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const switchDiv = screen.getByText('Toggle').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    if (switchDiv) await user.click(switchDiv);
    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('true');

    if (switchDiv) await user.click(switchDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('false');
  });

  it('disabled 상태에서는 클릭해도 값이 변경되지 않는다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { register, getValues } = useForm({
        defaultValues: { toggle: false },
      });

      return (
        <form>
          <Switch {...register('toggle')} disabled data-testid="switch">
            <span>Toggle</span>
          </Switch>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', String(values.toggle));
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const switchDiv = screen.getByText('Toggle').parentElement;
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('false');

    if (switchDiv) await user.click(switchDiv);
    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('false');
  });

  it('uncontrolled 모드에서 defaultChecked로 내부 상태가 토글된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      return (
        <form>
          <Switch defaultChecked={false} data-testid="switch">
            <span>Toggle</span>
          </Switch>
        </form>
      );
    };

    render(<TestForm />);

    const switchInput = screen.getByRole('switch') as HTMLInputElement;
    const switchDiv = screen.getByText('Toggle').parentElement;

    expect(switchInput.checked).toBe(false);

    if (switchDiv) await user.click(switchDiv);
    expect(switchInput.checked).toBe(true);

    if (switchDiv) await user.click(switchDiv);
    expect(switchInput.checked).toBe(false);
  });
});
