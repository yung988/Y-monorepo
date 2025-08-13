"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageItem {
  id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
}

interface SortableImageProps {
  image: ImageItem;
  index: number;
  isMain: boolean;
  onDelete: (id: string, url: string) => void;
  onSetMain: (index: number) => void;
}

function SortableImage({ image, index, isMain, onDelete, onSetMain }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square group">
      <Image
        src={image.url}
        alt={image.alt_text || "Product image"}
        fill
        className="rounded-md object-cover"
      />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Action buttons */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={() => onSetMain(index)}
          title="Nastavit jako hlavní"
        >
          <Star className={`h-4 w-4 ${isMain ? "fill-yellow-500 text-yellow-500" : ""}`} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={() => onDelete(image.id, image.url)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isMain && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Hlavní
        </div>
      )}
    </div>
  );
}

interface SortableImageGridProps {
  images: ImageItem[];
  onReorder: (images: ImageItem[]) => void;
  onDelete: (id: string, url: string) => void;
  productName: string;
}

export function SortableImageGrid({
  images,
  onReorder,
  onDelete,
  productName,
}: SortableImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over?.id);

      const newImages = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
        ...img,
        sort_order: idx,
      }));

      onReorder(newImages);
    }
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return; // Already main

    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);

    // Update sort_order
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));

    onReorder(reorderedImages);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <SortableImage
              key={image.id}
              image={image}
              index={index}
              isMain={index === 0}
              onDelete={onDelete}
              onSetMain={handleSetMain}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
