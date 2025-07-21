import React from "react";
import { Box, Button, Typography, useTheme, alpha, Fade } from "@mui/material";
import { RestartAlt, Edit } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useSidebarStore } from "../model/store";
import { SIDEBAR_Z_INDEX } from "../model/config";

interface SidebarResetButtonProps {
  isVisible: boolean;
  onClose: () => void;
  onEnterEditMode?: () => void;
}

export const SidebarResetButton: React.FC<SidebarResetButtonProps> = ({
  isVisible,
  onClose,
  onEnterEditMode,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { resetToDefaultOrder } = useSidebarStore();

  const handleReset = () => {
    resetToDefaultOrder();
    onClose();
  };

  const handleEnterEditMode = () => {
    onEnterEditMode?.();
    onClose();
  };

  return (
    <Fade in={isVisible} timeout={300}>
      <Box
        sx={{
          position: "absolute",
          bottom: 80, // Выше админ кнопки
          left: 8,
          right: 8,
          zIndex: SIDEBAR_Z_INDEX.resetButton,
          display: isVisible ? "block" : "none",
        }}
      >
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            p: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 1.5,
              fontSize: "0.8rem",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {t("sidebar.editModeTitle")}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{
                flex: 1,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "none",
                minHeight: 32,
                py: 0.5,
                px: 1,
                borderColor: alpha(theme.palette.divider, 0.25),
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.action.hover, 0.04),
                },
              }}
            >
              {t("common.cancel")}
            </Button>

            {onEnterEditMode && (
              <Button
                variant="contained"
                size="small"
                onClick={handleEnterEditMode}
                startIcon={<Edit sx={{ fontSize: 14 }} />}
                sx={{
                  flex: 1,
                  borderRadius: 1,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  textTransform: "none",
                  minHeight: 32,
                  py: 0.5,
                  px: 1,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {t("sidebar.enterEditMode")}
              </Button>
            )}
          </Box>

          <Button
            variant="text"
            size="small"
            onClick={handleReset}
            startIcon={<RestartAlt sx={{ fontSize: "14px !important" }} />}
            sx={{
              width: "100%",
              borderRadius: 1,
              fontSize: "0.7rem",
              fontWeight: 500,
              minHeight: 32,
              py: 0.5,
              px: 1,
              textTransform: "none",
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              },
            }}
          >
            {t("sidebar.resetToDefault")}
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};
