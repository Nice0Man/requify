import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const MainNavigation: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("navigation.mainTitle")}</Typography>
      <Typography variant="body2">{t("navigation.mainDescription")}</Typography>
    </Box>
  );
};

export { MainNavigation };
