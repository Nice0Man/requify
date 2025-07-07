import React from "react";
import {
  Tooltip,
  TooltipProps,
  IconButton,
  Button,
  ButtonProps,
  IconButtonProps,
  Fab,
  FabProps,
} from "@mui/material";

// Типы для различных вариантов кнопок
interface BaseTooltipButtonProps {
  tooltip: string;
  disabled?: boolean;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
}

interface TooltipIconButtonProps extends BaseTooltipButtonProps {
  variant: "icon";
  buttonProps?: Omit<IconButtonProps, "disabled">;
  children: React.ReactNode;
}

interface TooltipRegularButtonProps extends BaseTooltipButtonProps {
  variant: "button";
  buttonProps?: Omit<ButtonProps, "disabled">;
  children: React.ReactNode;
}

interface TooltipFabProps extends BaseTooltipButtonProps {
  variant: "fab";
  buttonProps?: Omit<FabProps, "disabled">;
  children: React.ReactNode;
}

type TooltipButtonProps =
  | TooltipIconButtonProps
  | TooltipRegularButtonProps
  | TooltipFabProps;

/**
 * Компонент TooltipButton решает проблему MUI, когда disabled кнопка не может
 * получать события мыши для показа Tooltip.
 *
 * Решение: оборачиваем disabled кнопку в span, который может получать события.
 *
 * @example
 * // IconButton с tooltip
 * <TooltipButton
 *   variant="icon"
 *   tooltip="Обновить данные"
 *   disabled={isLoading}
 *   buttonProps={{ onClick: handleRefresh }}
 * >
 *   <RefreshIcon />
 * </TooltipButton>
 *
 * // Regular Button с tooltip
 * <TooltipButton
 *   variant="button"
 *   tooltip="Сохранить изменения"
 *   disabled={isPending}
 *   buttonProps={{ onClick: handleSave, variant: "contained" }}
 * >
 *   Сохранить
 * </TooltipButton>
 */
export const TooltipButton: React.FC<TooltipButtonProps> = ({
  tooltip,
  disabled = false,
  tooltipProps,
  variant,
  buttonProps,
  children,
}) => {
  const renderButton = () => {
    switch (variant) {
      case "icon":
        return (
          <IconButton {...(buttonProps as IconButtonProps)} disabled={disabled}>
            {children}
          </IconButton>
        );
      case "fab":
        return (
          <Fab {...(buttonProps as FabProps)} disabled={disabled}>
            {children}
          </Fab>
        );
      default:
        return (
          <Button {...(buttonProps as ButtonProps)} disabled={disabled}>
            {children}
          </Button>
        );
    }
  };

  // Если кнопка disabled, оборачиваем в span для правильной работы Tooltip
  const buttonElement = disabled ? (
    <span
      style={{
        display: "inline-block",
        cursor: "not-allowed",
      }}
    >
      {renderButton()}
    </span>
  ) : (
    renderButton()
  );

  return (
    <Tooltip
      title={disabled ? tooltip : tooltip}
      {...tooltipProps}
      // Важно: позволяем показывать Tooltip даже для disabled элементов
      disableHoverListener={false}
      disableFocusListener={false}
      disableTouchListener={false}
    >
      {buttonElement}
    </Tooltip>
  );
};
