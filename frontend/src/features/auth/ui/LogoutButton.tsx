import React from "react";
import { Button } from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { useAuth } from "../model/hooks";
import { useTranslation } from "react-i18next";

const LogoutButton: React.FC = () => {
  const { t } = useTranslation();
  const { logout, isPending } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      startIcon={<LogoutOutlined />}
      variant="outlined"
      color="error"
    >
      {t("common.logout")}
    </Button>
  );
};

export { LogoutButton };
