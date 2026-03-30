import { createMockFormFieldDefinition } from 'test/mocks/data';
import { render, screen } from 'test/test-utils';

import { CustomFieldInput } from './CustomFieldInput';

vi.mock('@samilhero/design-system', () => ({
  InputField: ({
    label,
    value,
    onChange,
    placeholder,
    type,
    ...rest
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input
        type={type ?? 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  ),
  Select: Object.assign(
    ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
      onChange?: (v: string | null) => void;
    }) => (
      <div data-testid="select" data-value={value}>
        {children}
      </div>
    ),
    {
      Trigger: ({ children }: { children: React.ReactNode }) => (
        <button type="button" data-testid="select-trigger">
          {children}
        </button>
      ),
      Options: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-options">{children}</div>
      ),
      Option: ({
        children,
        item,
      }: {
        children: React.ReactNode;
        item: string;
      }) => <div data-value={item}>{children}</div>,
    },
  ),
  Switch: ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={onChange}
    />
  ),
}));

describe('CustomFieldInput', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readOnly 모드', () => {
    it('라벨과 값을 텍스트로 표시한다', () => {
      const field = createMockFormFieldDefinition({ label: '교회명' });

      render(
        <CustomFieldInput
          field={field}
          value="서울교회"
          onChange={onChange}
          readOnly
        />,
      );

      expect(screen.getByText('교회명')).toBeInTheDocument();
      expect(screen.getByText('서울교회')).toBeInTheDocument();
    });

    it('값이 없으면 "미입력"을 표시한다', () => {
      const field = createMockFormFieldDefinition();

      render(
        <CustomFieldInput
          field={field}
          value=""
          onChange={onChange}
          readOnly
        />,
      );

      expect(screen.getByText('미입력')).toBeInTheDocument();
    });

    it('필수 표시(*)를 렌더링한다', () => {
      const field = createMockFormFieldDefinition({ isRequired: true });

      render(
        <CustomFieldInput
          field={field}
          value="값"
          onChange={onChange}
          readOnly
        />,
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('편집 모드 - TEXT', () => {
    it('텍스트 입력 필드를 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'TEXT',
        label: '교회명',
      });

      render(
        <CustomFieldInput field={field} value="서울교회" onChange={onChange} />,
      );

      expect(screen.getByText('교회명')).toBeInTheDocument();
      expect(screen.getByDisplayValue('서울교회')).toBeInTheDocument();
    });
  });

  describe('편집 모드 - TEXTAREA', () => {
    it('텍스트 영역을 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'TEXTAREA',
        label: '비고',
      });

      render(
        <CustomFieldInput field={field} value="메모" onChange={onChange} />,
      );

      expect(screen.getByText('비고')).toBeInTheDocument();
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('메모');
    });
  });

  describe('편집 모드 - NUMBER', () => {
    it('숫자 입력 필드를 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'NUMBER',
        label: '나이',
      });

      render(<CustomFieldInput field={field} value="25" onChange={onChange} />);

      expect(screen.getByText('나이')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });
  });

  describe('편집 모드 - BOOLEAN', () => {
    it('스위치를 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'BOOLEAN',
        label: '동의 여부',
      });

      render(
        <CustomFieldInput field={field} value="true" onChange={onChange} />,
      );

      expect(screen.getByText('동의 여부')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('false 값일 때 체크 해제된다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'BOOLEAN',
        label: '동의 여부',
      });

      render(
        <CustomFieldInput field={field} value="false" onChange={onChange} />,
      );

      expect(screen.getByRole('switch')).not.toBeChecked();
    });
  });

  describe('편집 모드 - SELECT', () => {
    it('셀렉트 트리거와 옵션을 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'SELECT',
        label: '크기',
        options: ['S', 'M', 'L'],
      });

      render(<CustomFieldInput field={field} value="" onChange={onChange} />);

      expect(screen.getByText('크기')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });
  });

  describe('편집 모드 - DATE', () => {
    it('날짜 입력 필드를 렌더링한다', () => {
      const field = createMockFormFieldDefinition({
        fieldType: 'DATE',
        label: '생년월일',
      });

      render(
        <CustomFieldInput
          field={field}
          value="2000-01-01"
          onChange={onChange}
        />,
      );

      expect(screen.getByText('생년월일')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2000-01-01')).toBeInTheDocument();
    });
  });
});
