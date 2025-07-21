import { useCallback } from "react";
import { DropResult } from "@hello-pangea/dnd";

interface UseKanbanDragDropProps {
  onSuccess?: () => void;
  allowDragDrop?: boolean;
}

export const useKanbanDragDrop = ({
  onSuccess,
  allowDragDrop = true,
}: UseKanbanDragDropProps) => {
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      // If drag & drop is disabled, do nothing
      if (!allowDragDrop) return;

      const { destination, source } = result;

      // If dropped outside a droppable area
      if (!destination) return;

      // If dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // For now just call success
      onSuccess?.();
    },
    [allowDragDrop, onSuccess]
  );

  return {
    handleDragEnd,
  };
};

// Helper functions
export const validateDragOperation = () => true;
export const isValidStatusTransition = () => true;
