import { Search, Plus, Settings } from 'lucide-react';

import { IconButton, IconButtonProps } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['filled', 'ghost', 'outline'],
    },
    label: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: <Search size={20} />,
  },
};

export const WithLabel: Story = {
  args: {
    icon: <Plus size={20} />,
    label: 'Add Item',
  },
};

export const Sizes: Story = {
  render: (args: IconButtonProps) => (
    <div className="flex items-center gap-4">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
  args: {
    icon: <Settings size={20} />,
  },
};

export const Variants: Story = {
  render: (args: IconButtonProps) => (
    <div className="flex items-center gap-4 p-4 rounded">
      <IconButton {...args} variant="ghost" label="Ghost" />
      <IconButton {...args} variant="filled" label="Filled" />
      <IconButton {...args} variant="outline" label="Outline" />
    </div>
  ),
  args: {
    icon: <Search size={20} />,
  },
};

export const Filled: Story = {
  args: {
    icon: <Search size={20} />,
    variant: 'filled',
  },
};

export const Outline: Story = {
  args: {
    icon: <Search size={20} />,
    variant: 'outline',
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={<Search size={20} />} variant="ghost" disabled />
      <IconButton icon={<Search size={20} />} variant="filled" disabled />
      <IconButton icon={<Search size={20} />} variant="outline" disabled />
    </div>
  ),
};
