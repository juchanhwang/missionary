import { useState } from 'react';

import { Radio } from '../radio';

import { RadioGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const dataList = ['짜장면', '짬뽕', '탕수육'];

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  title: 'Components/RadioGroup',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

function DefaultRadioGroup() {
  const [selected, setSelected] = useState<string>(dataList[1]);
  return (
    <RadioGroup value={selected} onChange={(newValue) => setSelected(newValue)}>
      <div className="flex flex-col gap-3">
        {dataList.map((data) => (
          <Radio key={data} value={data} label={data} />
        ))}
      </div>
    </RadioGroup>
  );
}

export const Default: Story = {
  render: () => <DefaultRadioGroup />,
};
