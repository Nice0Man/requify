import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const DashboardStatsFC: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("dashboard.statsTitle")}</Typography>
      <Typography variant="body2">{t("dashboard.statsDescription")}</Typography>
    </Box>
  );
};

export { DashboardStatsFC };
