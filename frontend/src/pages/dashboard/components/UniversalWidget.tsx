import React, {
  memo,
  forwardRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
  ReactNode,
} from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Skeleton,
  Collapse,
  Fade,
  Tooltip,
  Alert,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { useDashboard, useDashboardWidgets } from "../context/DashboardContext";
import {
  useWidgetStyles,
  type WidgetStyleConfig,
} from "../styles/DashboardWidgetStyles";

// Local DashboardWidget interface
interface DashboardWidget {
  id: string;
  component: React.ComponentType<any>;
  priority: number;
  size: "small" | "medium" | "large";
  props: Record<string, any>;
  gridSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  visible: {
    minimal: boolean;
    compact: boolean;
    detailed: boolean;
    fullscreen: boolean;
  };
}

/**
 * Пропсы универсального виджета
 */
interface UniversalWidgetProps {
  /** Конфигурация виджета */
  widget: DashboardWidget;

  /** Дополнительные пропсы для компонента виджета */
  componentProps?: Record<string, any>;

  /** Обработчик клика по виджету */
  onClick?: (widget: DashboardWidget) => void;

  /** Обработчик обновления виджета */
  onRefresh?: (widget: DashboardWidget) => void;

  /** Пользовательские действия */
  actions?: ReactNode;

  /** Показать ли элементы управления */
  showControls?: boolean;

  /** Класс CSS */
  className?: string;

  /** Дополнительные стили */
  sx?: any;
}

/**
 * Компонент загрузки виджета
 */
const WidgetLoadingSkeleton = memo<{
  mode: string;
  size: string;
}>(({ mode, size }) => {
  const isCompact = mode === "minimal" || mode === "compact";
  const height = size === "small" ? 120 : size === "large" ? 300 : 200;

  return (
    <Box sx={{ p: 2, height }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ ml: 2, flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          {!isCompact && <Skeleton variant="text" width="40%" height={16} />}
        </Box>
      </Box>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={height - 100}
        sx={{ borderRadius: 1 }}
      />
    </Box>
  );
});

WidgetLoadingSkeleton.displayName = "WidgetLoadingSkeleton";

/**
 * Компонент ошибки виджета
 */
const WidgetErrorState = memo<{
  error: Error | string;
  onRetry?: () => void;
}>(({ error, onRetry }) => (
  <Alert
    severity="error"
    icon={<ErrorIcon />}
    action={
      onRetry && (
        <IconButton size="small" onClick={onRetry}>
          <RefreshIcon />
        </IconButton>
      )
    }
    sx={{ m: 2 }}
  >
    <Typography variant="body2">
      {typeof error === "string" ? error : error.message}
    </Typography>
  </Alert>
));

WidgetErrorState.displayName = "WidgetErrorState";

/**
 * Универсальный компонент виджета
 */
export const UniversalWidget = memo(
  forwardRef<HTMLDivElement, UniversalWidgetProps>(
    (
      {
        widget,
        componentProps = {},
        onClick,
        onRefresh,
        actions,
        showControls = true,
        className,
        sx,
      },
      ref
    ) => {
      const theme = useTheme();
      const { state } = useDashboard();
      const {
        isWidgetFavorite,
        isWidgetCollapsed,
        toggleWidgetFavorite,
        toggleWidgetCollapsed,
      } = useDashboardWidgets();

      // Локальное состояние
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<Error | string | null>(null);

      // Вычисляем состояния виджета
      const isFavorite = isWidgetFavorite(widget.id);
      const isCollapsed = isWidgetCollapsed(widget.id);
      const isInteractive = !!onClick;

      // Конфигурация стилей
      const styleConfig: WidgetStyleConfig = {
        mode: state.mode,
        layout: state.layout,
        density: state.density,
        size:
          widget.size === "small"
            ? "small"
            : widget.size === "large"
            ? "large"
            : "medium",
        variant: "default",
        state: error ? "error" : isLoading ? "loading" : "default",
        interactive: isInteractive,
        collapsible: true,
      };

      const { widgetStyles } = useWidgetStyles(styleConfig);

      // Обработчики
      const handleClick = useCallback(() => {
        if (onClick && !isLoading && !error) {
          onClick(widget);
        }
      }, [onClick, widget, isLoading, error]);

      const handleRefresh = useCallback(async () => {
        if (onRefresh) {
          setIsLoading(true);
          setError(null);

          try {
            await onRefresh(widget);
          } catch (err) {
            setError(err instanceof Error ? err : "Ошибка обновления виджета");
          } finally {
            setIsLoading(false);
          }
        }
      }, [onRefresh, widget]);

      const handleToggleFavorite = useCallback(() => {
        toggleWidgetFavorite(widget.id);
      }, [toggleWidgetFavorite, widget.id]);

      const handleToggleCollapse = useCallback(() => {
        toggleWidgetCollapsed(widget.id);
      }, [toggleWidgetCollapsed, widget.id]);

      // Определяем заголовок виджета
      const widgetTitle =
        widget.props.customTitle || widget.props.title || `Widget ${widget.id}`;

      // Получаем компонент виджета
      const WidgetComponent = widget.component;

      if (!WidgetComponent) {
        return (
          <Card ref={ref} className={className} sx={{ ...widgetStyles, ...sx }}>
            <WidgetErrorState
              error="Компонент виджета не найден"
              onRetry={handleRefresh}
            />
          </Card>
        );
      }

      // Проверяем видимость виджета
      if (!widget.visible[state.mode as keyof typeof widget.visible]) {
        return null;
      }

      return (
        <Card
          ref={ref}
          className={className}
          onClick={handleClick}
          sx={{
            ...widgetStyles,
            ...sx,
            // Дополнительные стили для интерактивности
            ...(isInteractive && {
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[8],
              },
            }),
          }}
        >
          {/* Заголовок виджета */}
          <CardHeader
            avatar={
              widget.props.customIcon || (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {widget.id.charAt(0).toUpperCase()}
                </Box>
              )
            }
            title={
              <Typography
                variant={state.density === "dense" ? "body1" : "h6"}
                fontWeight={600}
                className="widget-header"
              >
                {widgetTitle}
              </Typography>
            }
            subheader={
              !isCollapsed &&
              widget.props.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {widget.props.subtitle}
                </Typography>
              )
            }
            action={
              showControls && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {/* Избранное */}
                  <Tooltip
                    title={
                      isFavorite
                        ? "Убрать из избранного"
                        : "Добавить в избранное"
                    }
                  >
                    <IconButton size="small" onClick={handleToggleFavorite}>
                      {isFavorite ? (
                        <StarIcon sx={{ color: "warning.main" }} />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* Обновление */}
                  {onRefresh && (
                    <Tooltip title="Обновить">
                      <IconButton
                        size="small"
                        onClick={handleRefresh}
                        disabled={isLoading}
                      >
                        <RefreshIcon
                          sx={{
                            ...(isLoading && {
                              animation: "spin 1s linear infinite",
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }),
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Свернуть/развернуть */}
                  <Tooltip title={isCollapsed ? "Развернуть" : "Свернуть"}>
                    <IconButton
                      size="small"
                      onClick={handleToggleCollapse}
                      sx={{
                        transform: isCollapsed
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Дополнительные действия */}
                  {actions && (
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>
              )
            }
          />

          {/* Содержимое виджета */}
          <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
            <CardContent className="widget-content" sx={{ pt: 0 }}>
              {error ? (
                <WidgetErrorState error={error} onRetry={handleRefresh} />
              ) : (
                <Suspense
                  fallback={
                    <WidgetLoadingSkeleton
                      mode={state.mode}
                      size={widget.size}
                    />
                  }
                >
                  <Fade in={!isLoading} timeout={300}>
                    <Box>
                      <WidgetComponent
                        {...widget.props}
                        {...componentProps}
                        mode={state.mode}
                        layout={state.layout}
                        density={state.density}
                        isLoading={isLoading}
                        onError={setError}
                      />
                    </Box>
                  </Fade>
                </Suspense>
              )}
            </CardContent>
          </Collapse>

          {/* Действия виджета */}
          {actions && !isCollapsed && <CardActions>{actions}</CardActions>}
        </Card>
      );
    }
  )
);

UniversalWidget.displayName = "UniversalWidget";

export default UniversalWidget;
