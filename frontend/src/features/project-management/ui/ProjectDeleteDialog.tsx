import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const ProjectDeleteDialog: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">
        {t("projectManagement.deleteDialogTitle")}
      </Typography>
      <Typography variant="body2">
        {t("projectManagement.deleteDialogDescription")}
      </Typography>
    </Box>
  );
};

export { ProjectDeleteDialog };
