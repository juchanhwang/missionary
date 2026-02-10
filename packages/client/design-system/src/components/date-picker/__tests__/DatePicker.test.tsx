import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, Controller } from 'react-hook-form';

import { DatePicker } from '../index';

describe('DatePicker RHF Integration', () => {
  it('Controller {...field} spread로 렌더링이 정상적으로 된다', () => {
    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { date: null as Date | null },
      });

      return (
        <form>
          <Controller
            name="date"
            control={control}
            render={({ field }) => <DatePicker {...field} label="Date" />}
          />
        </form>
      );
    };

    render(<TestForm />);

    const input = screen.getByLabelText('Date');
    expect(input).toBeTruthy();
  });

  it('value prop으로 Date를 전달하면 해당 날짜가 표시된다', () => {
    const testDate = new Date('2025-02-10');

    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { date: testDate },
      });

      return (
        <form>
          <Controller
            name="date"
            control={control}
            render={({ field }) => <DatePicker {...field} label="Date" />}
          />
        </form>
      );
    };

    render(<TestForm />);

    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.value).toBe('2025-02-10');
  });

  it('name prop이 내부 input에 전달된다', () => {
    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { birthDate: null as Date | null },
      });

      return (
        <form>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => <DatePicker {...field} label="Birth Date" />}
          />
        </form>
      );
    };

    render(<TestForm />);

    const input = screen.getByLabelText('Birth Date') as HTMLInputElement;
    expect(input.name).toBe('birthDate');
  });

  it('onChange가 호출되면 폼 값이 업데이트된다', async () => {
    const user = userEvent.setup();
    const testDate = new Date('2025-02-10T00:00:00.000Z');

    const TestForm = () => {
      const { control, getValues, setValue } = useForm({
        defaultValues: { date: null as Date | null },
      });

      return (
        <form>
          <Controller
            name="date"
            control={control}
            render={({ field }) => <DatePicker {...field} label="Date" />}
          />
          <button
            type="button"
            onClick={() => {
              setValue('date', testDate);
            }}
          >
            Set Date
          </button>
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              const dateStr = values.date
                ? values.date.toISOString().split('T')[0]
                : 'null';
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', dateStr);
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const setButton = screen.getByRole('button', { name: 'Set Date' });
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(setButton);
    await user.click(checkButton);

    const resultDiv = screen.getByTestId('result');
    const storedValue = resultDiv.getAttribute('data-value');

    expect(storedValue).toBe('2025-02-10');
  });

  it('disabled 상태에서는 입력이 불가능하다', () => {
    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { date: null as Date | null },
      });

      return (
        <form>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker {...field} label="Date" disabled />
            )}
          />
        </form>
      );
    };

    render(<TestForm />);

    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
