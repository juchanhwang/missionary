import { useState } from 'react';

import { Radio } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Components/Radio',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Radio>;

function DefaultRadio() {
  const [selected, setSelected] = useState('a');
  return (
    <div className="flex flex-col gap-3">
      <Radio
        value="a"
        checked={selected === 'a'}
        onChange={() => setSelected('a')}
        label="Option A"
      />
      <Radio
        value="b"
        checked={selected === 'b'}
        onChange={() => setSelected('b')}
        label="Option B"
      />
      <Radio
        value="c"
        checked={selected === 'c'}
        onChange={() => setSelected('c')}
        label="Option C"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultRadio />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Radio value="a" checked={false} disabled label="Disabled unchecked" />
      <Radio value="b" checked={true} disabled label="Disabled checked" />
    </div>
  ),
};
