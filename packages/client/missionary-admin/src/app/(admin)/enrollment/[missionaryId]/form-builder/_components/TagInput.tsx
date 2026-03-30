'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  values,
  onChange,
  placeholder = '선택지 입력 후 Enter',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !values.includes(trimmed)) {
        onChange([...values, trimmed]);
        setInputValue('');
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
          >
            {value}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="rounded-full p-0.5 hover:bg-gray-200"
              aria-label={`${value} 제거`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-50 focus:outline-none"
      />
    </div>
  );
}
