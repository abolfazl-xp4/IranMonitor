"use client";

import * as React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      {/* Drag handle overlay */}
      <button
        className="absolute -top-2 left-2 z-30 grid h-6 w-6 cursor-grab place-items-center rounded-full border border-border/60 bg-card/90 text-muted-foreground opacity-0 shadow-md backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        title="جابجایی"
        aria-label="جابجایی"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}

interface SortableGridProps {
  ids: string[];
  onReorder: (next: string[]) => void;
  className?: string;
  children: React.ReactNode;
}

export function SortableGrid({ ids, onReorder, className, children }: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      onReorder(arrayMove(ids, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids}>
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}
