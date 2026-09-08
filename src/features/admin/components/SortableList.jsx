import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * One drag-and-drop primitive, used by both the DPP block canvas and the
 * dashboard widget grid.
 *
 * Order is the array index in both cases, so reordering is a single
 * arrayMove() and the payload sent to the server is just the new array.
 *
 * The keyboard sensor is not optional: an admin panel that can only be
 * rearranged with a mouse is unusable for anyone who does not use one.
 */
function SortableItem({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // `handleProps` lets the caller decide what is grabbable — dragging from
  // anywhere would swallow clicks on the buttons inside each card.
  return children({
    ref: setNodeRef,
    style,
    isDragging,
    handleProps: { ...attributes, ...listeners },
  });
}

function SortableList({
  items,
  getId = (item) => item.key,
  onReorder,
  renderItem,
  layout = "vertical",
  className = "",
  disabled = false,
}) {
  const sensors = useSensors(
    // A small distance threshold keeps a click on a card button from being
    // interpreted as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map(getId);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={
          layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={getId(item)} id={getId(item)} disabled={disabled}>
              {(sortableProps) => renderItem(item, index, sortableProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;
