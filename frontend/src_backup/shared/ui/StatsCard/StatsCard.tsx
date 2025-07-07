import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Skeleton,
} from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  change?: {
    value: number;
    period: string;
  };
  loading?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = "primary",
  change,
  loading,
  onClick,
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Skeleton animation="wave" height={20} width="60%" />
          <Skeleton animation="wave" height={40} width="40%" sx={{ mt: 1 }} />
          <Skeleton animation="wave" height={20} width="30%" sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4],
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography color="text.secondary" variant="body2" fontWeight={500}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: alpha(
                  (theme.palette[
                    color as keyof typeof theme.palette
                  ] as string) || color,
                  0.1
                ),
                color:
                  (theme.palette[
                    color as keyof typeof theme.palette
                  ] as string) || color,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: change ? 1 : 0,
            color:
              (theme.palette[color as keyof typeof theme.palette] as string) ||
              color,
          }}
        >
          {value}
        </Typography>

        {change && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color:
                  change.value > 0
                    ? "success.main"
                    : change.value < 0
                    ? "error.main"
                    : "text.secondary",
                fontWeight: 500,
              }}
            >
              {change.value > 0 ? "+" : ""}
              {change.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {change.period}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
