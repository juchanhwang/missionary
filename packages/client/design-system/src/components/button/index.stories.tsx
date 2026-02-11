import { Button } from '.';

import type { ButtonProps } from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<ButtonProps> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['filled', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xlg', 'xxlg'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'neutral'],
    },
    width: {
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Filled: Story = {
  args: {
    variant: 'filled',
    size: 'md',
    color: 'primary',
    children: 'Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    children: 'Button',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'filled',
    size: 'md',
    color: 'neutral',
    children: 'Button',
  },
};

export const NeutralOutline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    color: 'neutral',
    children: 'Button',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xlg">XLarge</Button>
      <Button size="xxlg">XXLarge</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: {
    variant: 'filled',
    size: 'lg',
    width: '100%',
    children: 'Full Width Button',
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>Filled</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
    </div>
  ),
};
