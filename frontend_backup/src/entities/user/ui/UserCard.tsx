import React from "react";
import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import { User } from "../model/types";
import { useTranslation } from "react-i18next";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { t } = useTranslation();
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{user.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2">
          {t("user.role")}: {user.role}
        </Typography>
      </CardContent>
    </Card>
  );
};

export { UserCard };
