import { Tooltip } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'Components/Tooltip',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  render: () => (
    <Tooltip text="Tooltip on top" position="top">
      <span className="px-4 py-2 border rounded">Hover me (top)</span>
    </Tooltip>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Tooltip text="Tooltip on bottom" position="bottom">
      <span className="px-4 py-2 border rounded">Hover me (bottom)</span>
    </Tooltip>
  ),
};

export const Left: Story = {
  render: () => (
    <Tooltip text="Tooltip on left" position="left">
      <span className="px-4 py-2 border rounded">Hover me (left)</span>
    </Tooltip>
  ),
};

export const Right: Story = {
  render: () => (
    <Tooltip text="Tooltip on right" position="right">
      <span className="px-4 py-2 border rounded">Hover me (right)</span>
    </Tooltip>
  ),
};
