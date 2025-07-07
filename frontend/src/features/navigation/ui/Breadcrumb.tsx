import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Breadcrumb: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("navigation.breadcrumbTitle")}</Typography>
      <Typography variant="body2">
        {t("navigation.breadcrumbDescription")}
      </Typography>
    </Box>
  );
};

export { Breadcrumb };
