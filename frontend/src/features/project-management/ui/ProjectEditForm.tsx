import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const ProjectEditForm: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">
        {t("projectManagement.editFormTitle")}
      </Typography>
      <Typography variant="body2">
        {t("projectManagement.editFormDescription")}
      </Typography>
    </Box>
  );
};

export { ProjectEditForm };
