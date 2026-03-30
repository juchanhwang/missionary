import { render, screen } from 'test/test-utils';

import { FormFieldCard } from './FormFieldCard';

import type { LocalFormField } from './FormFieldSettings';

// DnD kit mock
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

vi.mock('@samilhero/design-system', () => {
  const SelectOption = ({ children }: { children: React.ReactNode }) => (
    <option>{children}</option>
  );
  const SelectOptions = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  );
  const Select = Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="select">{children}</div>
    ),
    { Trigger: SelectTrigger, Options: SelectOptions, Option: SelectOption },
  );

  return {
    overlay: { openAsync: vi.fn() },
    Select,
    Switch: ({
      checked,
      onChange,
    }: {
      checked?: boolean;
      onChange?: (v: boolean) => void;
    }) => (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    ),
  };
});

function createField(
  overrides: Partial<
    LocalFormField & { hasAnswers: boolean; isNew?: boolean }
  > = {},
): LocalFormField & { hasAnswers: boolean; isNew?: boolean } {
  return {
    id: 'field-1',
    fieldType: 'TEXT',
    label: '교회명',
    placeholder: null,
    isRequired: false,
    options: null,
    hasAnswers: false,
    ...overrides,
  };
}

describe('FormFieldCard', () => {
  const defaultProps = {
    isActive: false,
    onToggleActive: vi.fn(),
    onChange: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('View 모드', () => {
    it('필드 라벨과 타입 뱃지를 렌더링한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          field={createField({ label: '교회명' })}
        />,
      );

      expect(screen.getByText('교회명')).toBeInTheDocument();
      expect(screen.getByText('TEXT')).toBeInTheDocument();
    });

    it('필수 표시를 렌더링한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          field={createField({ isRequired: true })}
        />,
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('라벨이 비어있으면 "(라벨 없음)"을 표시한다', () => {
      render(
        <FormFieldCard {...defaultProps} field={createField({ label: '' })} />,
      );

      expect(screen.getByText('(라벨 없음)')).toBeInTheDocument();
    });

    it('설명이 있으면 표시한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          field={createField({ placeholder: '도움말 텍스트' })}
        />,
      );

      expect(screen.getByText('도움말 텍스트')).toBeInTheDocument();
    });

    it('응답이 없으면 "응답 없음 · 삭제 가능" 안내를 표시한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          field={createField({ hasAnswers: false, isNew: false })}
        />,
      );

      expect(screen.getByText(/응답 없음/)).toBeInTheDocument();
    });

    it('편집 버튼을 클릭하면 onToggleActive를 호출한다', async () => {
      const onToggleActive = vi.fn();
      const { user } = render(
        <FormFieldCard
          {...defaultProps}
          onToggleActive={onToggleActive}
          field={createField()}
        />,
      );

      await user.click(screen.getByLabelText('필드 편집'));

      expect(onToggleActive).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼을 클릭하면 onDelete를 호출한다 (응답 없는 필드)', async () => {
      const onDelete = vi.fn();
      const { user } = render(
        <FormFieldCard
          {...defaultProps}
          onDelete={onDelete}
          field={createField({ hasAnswers: false })}
        />,
      );

      await user.click(screen.getByLabelText('필드 삭제'));

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active 모드', () => {
    it('라벨 편집 input을 렌더링한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          isActive
          field={createField({ label: '교회명' })}
        />,
      );

      const input = screen.getByDisplayValue('교회명');
      expect(input.tagName).toBe('INPUT');
    });

    it('편집 버튼을 숨긴다 (active 상태)', () => {
      render(
        <FormFieldCard {...defaultProps} isActive field={createField()} />,
      );

      expect(screen.queryByLabelText('필드 편집')).not.toBeInTheDocument();
    });

    it('설명이 없을 때 "설명 추가" 버튼을 표시한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          isActive
          field={createField({ placeholder: null })}
        />,
      );

      expect(screen.getByText('설명 추가')).toBeInTheDocument();
    });

    it('"설명 추가" 클릭 시 onChange를 호출한다', async () => {
      const onChange = vi.fn();
      const { user } = render(
        <FormFieldCard
          {...defaultProps}
          isActive
          onChange={onChange}
          field={createField({ placeholder: null })}
        />,
      );

      await user.click(screen.getByText('설명 추가'));

      expect(onChange).toHaveBeenCalledWith({ placeholder: '' });
    });

    it('설명이 있을 때 설명 편집 input과 제거 버튼을 표시한다', () => {
      render(
        <FormFieldCard
          {...defaultProps}
          isActive
          field={createField({ placeholder: '안내 문구' })}
        />,
      );

      expect(screen.getByDisplayValue('안내 문구')).toBeInTheDocument();
      expect(screen.getByLabelText('설명 제거')).toBeInTheDocument();
    });

    it('설명 제거 버튼 클릭 시 onChange를 호출한다', async () => {
      const onChange = vi.fn();
      const { user } = render(
        <FormFieldCard
          {...defaultProps}
          isActive
          onChange={onChange}
          field={createField({ placeholder: '안내 문구' })}
        />,
      );

      await user.click(screen.getByLabelText('설명 제거'));

      expect(onChange).toHaveBeenCalledWith({ placeholder: null });
    });
  });
});
