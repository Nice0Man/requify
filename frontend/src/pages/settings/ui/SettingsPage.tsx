import React from "react";
import { Box, Typography } from "@mui/material";
import { DashboardLayout } from "@/widgets/layout";
import { useTranslation } from "react-i18next";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t("settings.title")}
        </Typography>
        <Typography variant="body1">{t("settings.description")}</Typography>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
