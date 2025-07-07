import React from "react";
import { Box, Typography } from "@mui/material";

export const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>
      <Typography variant="body1">
        Страница настроек в разработке
      </Typography>
    </Box>
  );
};

export default SettingsPage; 