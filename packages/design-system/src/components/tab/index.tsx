'use client';

import React from 'react';

import { TabLayout, TabList } from './TabLayout';

interface TabProps {
  list: Array<{
    value: string;
    label: string;
  }>;
  selectedValue: string;
  onChange: (value: string) => void;
}

export const Tab = ({ list, selectedValue, onChange }: TabProps) => {
  return (
    <TabLayout>
      {list.map((category) => (
        <TabList
          key={category.value}
          active={category.value === selectedValue}
          onClick={() => onChange(category.value)}
        >
          {category.label}
        </TabList>
      ))}
    </TabLayout>
  );
};
