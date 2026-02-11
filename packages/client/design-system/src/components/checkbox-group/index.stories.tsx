import { useState } from 'react';

import { CheckboxGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  title: 'Components/CheckboxGroup',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

function DefaultCheckboxGroup() {
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <CheckboxGroup
      checkedValues={checked}
      onChange={(newChecked) => setChecked(newChecked)}
    >
      <div className="flex flex-col gap-3">
        <CheckboxGroup.Item value="value1" label="Option 1" />
        <CheckboxGroup.Item value="value2" label="Option 2" />
        <CheckboxGroup.Item value="value3" label="Option 3" />
      </div>
    </CheckboxGroup>
  );
}

export const Default: Story = {
  render: () => <DefaultCheckboxGroup />,
};
