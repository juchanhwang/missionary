import { cn } from '@lib/utils';
import { useState } from 'react';

import { Radio } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Radio> = {
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof Radio>;

const RadioComponent = ({
  args,
}: {
  args: React.ComponentProps<typeof Radio>;
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex">
      <Radio
        {...args}
        value="value1"
        onChange={(e) => setChecked(e.target.checked)}
        className={cn(
          'flex items-center w-[200px] cursor-pointer',
          args.disabled && 'cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'relative inline-block w-4 h-4 mr-2 border border-black rounded-full',
            checked &&
              "after:content-['v'] after:text-base after:font-bold after:w-4 after:h-4 after:text-center after:absolute after:left-0 after:top-0",
          )}
        />
        Radio
      </Radio>
    </div>
  );
};

export const Primary: Story = {
  render: (args) => <RadioComponent args={args} />,
  args: {
    disabled: false,
  },
};
