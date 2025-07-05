import React from "react";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";

interface LoadingBackdropProps {
  open: boolean;
  message?: string;
  onClose?: () => void;
  disableEscapeKeyDown?: boolean;
  className?: string;
}

/**
 * LoadingBackdrop - компонент для отображения полноэкранной загрузки
 * Блокирует интерфейс пока выполняется операция
 */
export const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({
  open,
  message = "Loading...",
  onClose,
  disableEscapeKeyDown = false,
  className,
}) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      open={open}
      onClick={onClose}
      onKeyDown={
        disableEscapeKeyDown
          ? undefined
          : (e) => {
              if (e.key === "Escape" && onClose) {
                onClose();
              }
            }
      }
      className={className}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CircularProgress color="inherit" size={60} thickness={4} />
        {message && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              textAlign: "center",
              fontWeight: 400,
              opacity: 0.9,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};
