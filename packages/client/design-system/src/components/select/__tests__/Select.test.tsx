import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, Controller } from 'react-hook-form';

import { Select } from '../index';

describe('Select RHF Integration', () => {
  it('Controller {...field} spread로 렌더링이 정상적으로 된다', () => {
    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { category: undefined as string | undefined },
      });

      return (
        <form>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select {...field}>
                <Select.Trigger>Select Option</Select.Trigger>
                <Select.Options>
                  <Select.Option item="option1">Option 1</Select.Option>
                  <Select.Option item="option2">Option 2</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
        </form>
      );
    };

    render(<TestForm />);

    expect(screen.getByText('Select Option')).toBeTruthy();
  });

  it('옵션 선택 시 field.onChange가 호출되어 폼 값이 업데이트된다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { control, getValues } = useForm({
        defaultValues: { category: undefined as string | undefined },
      });

      return (
        <form>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select {...field}>
                <Select.Trigger>Select Option</Select.Trigger>
                <Select.Options>
                  <Select.Option item="option1">Option 1</Select.Option>
                  <Select.Option item="option2">Option 2</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
          <button
            type="button"
            onClick={() => {
              const values = getValues();
              document
                .querySelector('[data-testid="result"]')
                ?.setAttribute('data-value', values.category || 'undefined');
            }}
          >
            Check Value
          </button>
          <div data-testid="result" />
        </form>
      );
    };

    render(<TestForm />);

    const trigger = screen.getByText('Select Option');
    const checkButton = screen.getByRole('button', { name: 'Check Value' });

    await user.click(checkButton);
    const resultDiv = screen.getByTestId('result');
    expect(resultDiv.getAttribute('data-value')).toBe('undefined');

    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    await user.click(checkButton);
    expect(resultDiv.getAttribute('data-value')).toBe('option1');
  });

  it('single-select 모드에서 옵션 선택 시 드롭다운이 닫히고 onBlur가 호출된다', async () => {
    const user = userEvent.setup();
    let blurCallCount = 0;

    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { category: undefined as string | undefined },
      });

      return (
        <form>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                onBlur={() => {
                  blurCallCount++;
                  document
                    .querySelector('[data-testid="blur-count"]')
                    ?.setAttribute('data-value', String(blurCallCount));
                }}
              >
                <Select.Trigger>Select Option</Select.Trigger>
                <Select.Options>
                  <Select.Option item="option1">Option 1</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
          <div data-testid="blur-count" />
        </form>
      );
    };

    render(<TestForm />);

    const trigger = screen.getByText('Select Option');
    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    const blurCountDiv = screen.getByTestId('blur-count');
    expect(blurCountDiv.getAttribute('data-value')).toBe('1');
  });

  it('드롭다운 외부 클릭 시 드롭다운이 닫히고 onBlur가 호출된다', async () => {
    const user = userEvent.setup();
    let blurCallCount = 0;

    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { category: undefined as string | undefined },
      });

      return (
        <form>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                onBlur={() => {
                  blurCallCount++;
                  document
                    .querySelector('[data-testid="blur-count"]')
                    ?.setAttribute('data-value', String(blurCallCount));
                }}
              >
                <Select.Trigger>Select Option</Select.Trigger>
                <Select.Options>
                  <Select.Option item="option1">Option 1</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
          <div data-testid="outside">Outside</div>
          <div data-testid="blur-count" />
        </form>
      );
    };

    render(<TestForm />);

    const trigger = screen.getByText('Select Option');
    await user.click(trigger);

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    const blurCountDiv = screen.getByTestId('blur-count');
    expect(blurCountDiv.getAttribute('data-value')).toBe('1');
  });

  it('multi-select 모드에서는 옵션 선택 후에도 드롭다운이 열린 상태를 유지한다', async () => {
    const user = userEvent.setup();

    const TestForm = () => {
      const { control } = useForm({
        defaultValues: { categories: [] as string[] },
      });

      return (
        <form>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <Select {...field} multiple>
                <Select.Trigger>Select Options</Select.Trigger>
                <Select.Options>
                  <Select.Option item="option1">Option 1</Select.Option>
                  <Select.Option item="option2">Option 2</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
        </form>
      );
    };

    render(<TestForm />);

    const trigger = screen.getByText('Select Options');
    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    const option2 = screen.getByText('Option 2');
    expect(option2).toBeTruthy();
  });
});
