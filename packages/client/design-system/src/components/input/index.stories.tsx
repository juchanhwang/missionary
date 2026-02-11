import React, { useState } from 'react';

import { Input } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  component: Input,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

const DefaultStory = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onReset={() => setValue('')}
      placeholder="입력해주세요"
    />
  );
};

export const Default: Story = {
  render: () => <DefaultStory />,
};

const WithErrorStory = () => {
  const [value, setValue] = useState('잘못된 입력값');
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onReset={() => setValue('')}
      error="에러 메시지입니다"
    />
  );
};

export const WithError: Story = {
  render: () => <WithErrorStory />,
};

export const Disabled: Story = {
  render: () => <Input value="비활성화된 입력창" disabled onReset={() => {}} />,
};
