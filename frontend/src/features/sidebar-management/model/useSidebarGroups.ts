import { useState, useCallback } from "react";
import type { User } from "@/entities/user";

export interface GroupsState {
  expandedGroups: Record<string, boolean>;
}

export interface GroupsActions {
  handleToggleGroup: (groupId: string) => void;
  setExpandedGroups: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  isGroupExpanded: (groupId: string) => boolean;
}

export interface UseSidebarGroupsReturn {
  state: GroupsState;
  actions: GroupsActions;
}

/**
 * Хук для управления состоянием групп в сайдбаре
 * Выделен из AppSidebarWidget согласно FSD принципам [[cite](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)]
 */
export const useSidebarGroups = (
  user?: User,
  onGroupToggle?: (groupId: string, isExpanded: boolean) => void
): UseSidebarGroupsReturn => {
  // Локальное состояние для групп
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      main: true,
      admin: user?.role === "admin",
      profile: false,
      bottom: false,
    }
  );

  // Переключение состояния группы
  const handleToggleGroup = useCallback(
    (groupId: string) => {
      setExpandedGroups((prev) => {
        const newExpanded = !prev[groupId];
        const newState = {
          ...prev,
          [groupId]: newExpanded,
        };

        onGroupToggle?.(groupId, newExpanded);
        return newState;
      });
    },
    [onGroupToggle]
  );

  // Проверка, расширена ли группа
  const isGroupExpanded = useCallback(
    (groupId: string) => {
      return expandedGroups[groupId] || false;
    },
    [expandedGroups]
  );

  return {
    state: {
      expandedGroups,
    },
    actions: {
      handleToggleGroup,
      setExpandedGroups,
      isGroupExpanded,
    },
  };
};
