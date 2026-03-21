import { useState } from 'react';

import { TextareaField } from './index';

import type { FormSize } from '../form-size';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextareaField> = {
  component: TextareaField,
};

export default meta;
type Story = StoryObj<typeof TextareaField>;

function DefaultStory() {
  const [value, setValue] = useState('');

  return (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="라벨"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="플레이스홀더 텍스트"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultStory />,
};

function SizesStory() {
  const sizes: FormSize[] = ['sm', 'md', 'lg'];

  return (
    <div
      style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {sizes.map((size) => (
        <TextareaField
          key={size}
          label={`Size: ${size}`}
          size={size}
          placeholder={`${size} 사이즈 텍스트에어리어`}
        />
      ))}
    </div>
  );
}

export const Sizes: Story = {
  render: () => <SizesStory />,
};

function WithCounterStory() {
  const [value, setValue] = useState('');

  return (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="글자 수 카운터"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={200}
        placeholder="최대 200자까지 입력 가능합니다"
      />
    </div>
  );
}

export const WithCounter: Story = {
  render: () => <WithCounterStory />,
};

function WithErrorStory() {
  const [value, setValue] = useState('잘못된 입력');

  return (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="라벨"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={200}
        error="에러 메시지입니다"
      />
    </div>
  );
}

export const WithError: Story = {
  render: () => <WithErrorStory />,
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="라벨"
        value="비활성 상태"
        placeholder="비활성 상태"
        disabled
      />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TextareaField label="라벨" value="읽기 전용 텍스트" readOnly />
    </div>
  ),
};

function AutoResizeStory() {
  const [value, setValue] = useState('');

  return (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="자동 높이 조절"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoResize
        placeholder="내용을 입력하면 높이가 자동으로 조절됩니다"
      />
    </div>
  );
}

export const AutoResize: Story = {
  render: () => <AutoResizeStory />,
};

function ShowCountOnlyStory() {
  const [value, setValue] = useState('');

  return (
    <div style={{ width: '400px' }}>
      <TextareaField
        label="글자 수만 표시"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        showCount
        placeholder="maxLength 없이 현재 글자 수만 표시"
      />
    </div>
  );
}

export const ShowCountOnly: Story = {
  render: () => <ShowCountOnlyStory />,
};
