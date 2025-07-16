import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useDndMonitor } from "@dnd-kit/core";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import { useSidebarItems } from "../model";

interface AccessibilityAnnouncerProps {
  children: React.ReactNode;
}

export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
  children,
}) => {
  const { t } = useTranslation();
  const items = useSidebarItems();
  const [announcement, setAnnouncement] = useState<string>("");

  // Функция для получения названия элемента по ID
  const getItemLabel = (id: UniqueIdentifier): string => {
    const item = items.find((item) => item.id === id);
    return item?.label || String(id);
  };

  // Мониторинг DND событий для объявлений
  useDndMonitor({
    onDragStart: ({ active }) => {
      const itemLabel = getItemLabel(active.id);
      const message = t("accessibility.dragStart", {
        item: itemLabel,
        defaultValue: `Начато перетаскивание элемента ${itemLabel}`,
      });
      setAnnouncement(message);
    },
    
    onDragOver: ({ active, over }) => {
      if (over && active.id !== over.id) {
        const activeLabel = getItemLabel(active.id);
        const overLabel = getItemLabel(over.id);
        const message = t("accessibility.dragOver", {
          activeItem: activeLabel,
          overItem: overLabel,
          defaultValue: `${activeLabel} находится над ${overLabel}`,
        });
        setAnnouncement(message);
      }
    },
    
    onDragEnd: ({ active, over }) => {
      const activeLabel = getItemLabel(active.id);
      
      if (over && active.id !== over.id) {
        const overLabel = getItemLabel(over.id);
        const message = t("accessibility.dragEnd", {
          activeItem: activeLabel,
          overItem: overLabel,
          defaultValue: `${activeLabel} перемещен и размещен над ${overLabel}`,
        });
        setAnnouncement(message);
      } else {
        const message = t("accessibility.dragEndNoChange", {
          item: activeLabel,
          defaultValue: `Перетаскивание ${activeLabel} завершено без изменений`,
        });
        setAnnouncement(message);
      }
    },
    
    onDragCancel: ({ active }) => {
      const activeLabel = getItemLabel(active.id);
      const message = t("accessibility.dragCancel", {
        item: activeLabel,
        defaultValue: `Перетаскивание ${activeLabel} отменено`,
      });
      setAnnouncement(message);
    },
  });

  // Очистка сообщения через некоторое время
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return (
    <>
      {children}
      
      {/* Live region для screen readers */}
      <Box
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        sx={{
          position: "absolute",
          left: -10000,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {announcement}
      </Box>
      
      {/* Альтернативная live region для дублирования важных сообщений */}
      <Box
        role="log"
        aria-live="polite"
        aria-atomic="false"
        sx={{
          position: "absolute",
          left: -10000,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {announcement && (
          <div key={Date.now()}>
            {announcement}
          </div>
        )}
      </Box>
    </>
  );
}; 