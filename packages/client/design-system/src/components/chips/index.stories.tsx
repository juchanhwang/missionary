import { Chips } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Chips> = {
  component: Chips,
  title: 'Components/Chips',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Chips>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Chips>태그1</Chips>
      <Chips>태그2</Chips>
      <Chips>필터</Chips>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chips variant="default">Default</Chips>
      <Chips variant="accent">Accent</Chips>
      <Chips variant="outline">Outline</Chips>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Chips size="sm">Small</Chips>
      <Chips size="md">Medium</Chips>
    </div>
  ),
};

export const WithDismiss: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Chips onDismiss={() => alert('Dismissed!')}>Dismissible</Chips>
      <Chips variant="accent" onDismiss={() => alert('Dismissed!')}>
        Accent
      </Chips>
      <Chips variant="outline" size="sm" onDismiss={() => alert('Dismissed!')}>
        Small Outline
      </Chips>
    </div>
  ),
};
