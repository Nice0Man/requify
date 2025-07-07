import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";

const ProjectCreateForm: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("projectManagement.createFormTitle")}</Typography>
      <Typography variant="body2">{t("projectManagement.createFormDescription")}</Typography>
    </Box>
  );
};

export { ProjectCreateForm }; 