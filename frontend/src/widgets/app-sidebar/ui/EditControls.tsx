import React from "react";
import { Box, Button, Typography, Fade, Divider } from "@mui/material";
import { Check, Close, Edit } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

interface EditControlsProps {
  onApprove: () => void;
  onDecline: () => void;
  hasUnsavedChanges?: boolean;
}

/**
 * Компонент управления режимом редактирования
 */
export const EditControls: React.FC<EditControlsProps> = ({
  onApprove,
  onDecline,
  hasUnsavedChanges = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: "relative",
          padding: 1,
          marginTop: 0.5,
          marginBottom: 0.5,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        {/* Заголовок */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: 1,
          }}
        >
          <Edit
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: "0.825rem",
            }}
          >
            {t("sidebar.editMode")}
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: alpha(theme.palette.divider, 0.1),
            marginBottom: 1,
          }}
        />

        {/* Подсказка */} 
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: "block",
            marginBottom: 1.5,
            lineHeight: 1.4,
            fontSize: "0.75rem",
          }}
        >
          {t("sidebar.dragInstructions")}
        </Typography>

        {/* Кнопки управления */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<Check sx={{ fontSize: 14 }} />}
            onClick={onApprove}
            sx={{
              flex: 1,
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              fontWeight: 500,
              fontSize: "0.7rem",
              padding: "4px 8px",
              minHeight: 32,
              borderRadius: 1,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
                boxShadow: "none",
              },
            }}
          >
            {t("sidebar.applyChanges")}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<Close sx={{ fontSize: 14 }} />}
            onClick={onDecline}
            sx={{
              flex: 1,
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              fontWeight: 500,
              fontSize: "0.7rem",
              padding: "4px 8px",
              minHeight: 32,
              borderRadius: 1,
              textTransform: "none",
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                borderColor: theme.palette.error.main,
              },
            }}
          >
            {t("sidebar.cancelChanges")}
          </Button>
        </Box>

        {/* Индикатор несохраненных изменений */}
        {hasUnsavedChanges && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: theme.palette.warning.main,
            }}
          />
        )}
      </Box>
    </Fade>
  );
};
