'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Circle, GripVertical, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SortableOptionItemProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  autoFocus?: boolean;
  onFocused?: () => void;
}

function SortableOptionItem({
  id,
  value,
  onChange,
  onRemove,
  autoFocus,
  onFocused,
}: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2"
    >
      {/* 드래그 핸들 */}
      <button
        type="button"
        className="shrink-0 p-0.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="순서 변경"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      {/* 라디오 프리뷰 */}
      <Circle size={16} className="shrink-0 text-gray-300" />

      {/* 인라인 편집 입력 */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none py-1 px-0.5 transition-colors"
        placeholder="옵션 입력"
      />

      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 p-1 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600 hover:bg-gray-100 transition-all"
        aria-label="옵션 삭제"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface SelectOptionsEditorProps {
  values: string[];
  onChange: (values: string[]) => void;
}

export function SelectOptionsEditor({
  values,
  onChange,
}: SelectOptionsEditorProps) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 각 옵션에 안정적인 ID 부여 (인덱스 기반으로 key 충돌 방지)
  const itemIds = values.map((_, i) => `opt-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    onChange(arrayMove(values, oldIndex, newIndex));
  };

  const handleOptionChange = (index: number, newValue: string) => {
    const updated = [...values];
    updated[index] = newValue;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setFocusIndex(values.length);
    onChange([...values, '']);
  };

  return (
    <div className="flex flex-col gap-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {values.map((value, index) => (
            <SortableOptionItem
              key={itemIds[index]}
              id={itemIds[index]}
              value={value}
              onChange={(v) => handleOptionChange(index, v)}
              onRemove={() => handleRemove(index)}
              autoFocus={focusIndex === index}
              onFocused={() => setFocusIndex(null)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* 옵션 추가 버튼 */}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 mt-1 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Circle size={16} className="text-gray-200" />
        <Plus size={14} />
        <span>옵션 추가</span>
      </button>
    </div>
  );
}
