import React from "react";
import { Box, Typography } from "@mui/material";
import i18n from "@/shared/lib/i18n";

const DashboardCharts: React.FC = () => {
  const t = i18n.t;
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
