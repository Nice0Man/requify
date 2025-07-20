import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Refresh,
  BugReport,
  ExpandMore,
  ExpandLess,
  Dashboard,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error(
      "Dashboard Error Boundary caught an error:",
      error,
      errorInfo
    );

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error monitoring service if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      const hasChanged = resetOnPropsChange.some(
        (prop, index) => prop !== prevProps.resetOnPropsChange?.[index]
      );

      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleRetry = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // Reset after a small delay to allow for cleanup
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const t = i18n.t;

      return (
        <DashboardErrorFallback
          error={error}
          errorInfo={errorInfo}
          showDetails={showDetails}
          onToggleDetails={this.toggleDetails}
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

interface DashboardErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  onToggleDetails: () => void;
  onRetry: () => void;
}

const DashboardErrorFallback: React.FC<DashboardErrorFallbackProps> = ({
  error,
  errorInfo,
  showDetails,
  onToggleDetails,
  onRetry,
}) => {
  const t = i18n.t;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        minHeight: 300,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.02),
      }}
    >
      <Stack spacing={3} alignItems="center" maxWidth={600}>
        {/* Icon */}
        <Box
          sx={{
            p: 2,
            borderRadius: "50%",
            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.main",
          }}
        >
          <Dashboard sx={{ fontSize: 48 }} />
        </Box>

        {/* Error Message */}
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom color="error" fontWeight="600">
            {t("dashboard.error.title", "Ошибка в компоненте Dashboard")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              "dashboard.error.description",
              "Произошла неожиданная ошибка при отображении dashboard. Попробуйте обновить компонент."
            )}
          </Typography>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={onRetry}
            size="large"
          >
            {t("dashboard.error.retry", "Повторить")}
          </Button>

          <Button
            variant="outlined"
            startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
            onClick={onToggleDetails}
            size="large"
          >
            {t("dashboard.error.details", "Подробности")}
          </Button>
        </Stack>

        {/* Error Details */}
        <Collapse in={showDetails} sx={{ width: "100%" }}>
          <Alert
            severity="error"
            sx={{
              mt: 2,
              textAlign: "left",
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <AlertTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <BugReport fontSize="small" />
                {t("dashboard.error.technical", "Техническая информация")}
              </Box>
            </AlertTitle>

            <Typography variant="body2" component="div" sx={{ mb: 2 }}>
              <strong>
                {t("dashboard.error.message", "Сообщение об ошибке")}:
              </strong>
              <br />
              <code style={{ wordBreak: "break-all" }}>
                {error?.message ||
                  t("dashboard.error.unknown", "Неизвестная ошибка")}
              </code>
            </Typography>

            {error?.stack && (
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <strong>{t("dashboard.error.stack", "Стек вызовов")}:</strong>
                <br />
                <Box
                  component="pre"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: (theme) =>
                      alpha(theme.palette.background.paper, 0.7),
                    p: 1,
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: 200,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {error.stack}
                </Box>
              </Typography>
            )}

            {errorInfo?.componentStack && (
              <Typography variant="body2" component="div">
                <strong>{t("dashboard.error.component", "Компонент")}:</strong>
                <br />
                <Box
                  component="pre"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: (theme) =>
                      alpha(theme.palette.background.paper, 0.7),
                    p: 1,
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: 150,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {errorInfo.componentStack}
                </Box>
              </Typography>
            )}
          </Alert>
        </Collapse>
      </Stack>
    </Box>
  );
};
