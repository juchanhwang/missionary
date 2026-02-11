import { useState } from 'react';

import { Switch } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Switch> = {
  component: Switch,
  title: 'Components/Switch',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

function DefaultSwitch() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
      label="Enable notifications"
    />
  );
}

export const Default: Story = {
  render: () => <DefaultSwitch />,
};

function CheckedSwitch() {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
      label="Dark mode"
    />
  );
}

export const Checked: Story = {
  render: () => <CheckedSwitch />,
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch checked={false} disabled label="Disabled off" />
      <Switch checked={true} disabled label="Disabled on" />
    </div>
  ),
};
