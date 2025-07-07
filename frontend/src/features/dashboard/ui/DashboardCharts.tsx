import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const DashboardCharts: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("dashboard.chartsTitle")}</Typography>
      <Typography variant="body2">
        {t("dashboard.chartsDescription")}
      </Typography>
    </Box>
  );
};

export { DashboardCharts };
