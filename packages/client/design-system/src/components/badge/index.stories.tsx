import { Badge } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'Components/Badge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Success: Story = {
  render: () => <Badge variant="success">입금완료</Badge>,
};

export const Warning: Story = {
  render: () => <Badge variant="warning">입금전 (D-1)</Badge>,
};

export const Info: Story = {
  render: () => <Badge variant="info">100,000₩</Badge>,
};

export const Default: Story = {
  render: () => <Badge variant="default">Default</Badge>,
};

export const Destructive: Story = {
  render: () => <Badge variant="destructive">Error</Badge>,
};

export const Outline: Story = {
  render: () => <Badge variant="outline">Outline</Badge>,
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="default">Default</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
