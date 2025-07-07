import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("navigation.sidebarTitle")}</Typography>
      <Typography variant="body2">
        {t("navigation.sidebarDescription")}
      </Typography>
    </Box>
  );
};

export { Sidebar };
