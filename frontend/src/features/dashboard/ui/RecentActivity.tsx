import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const RecentActivity: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t("dashboard.recentActivityTitle")}</Typography>
      <Typography variant="body2">
        {t("dashboard.recentActivityDescription")}
      </Typography>
    </Box>
  );
};

export { RecentActivity };
