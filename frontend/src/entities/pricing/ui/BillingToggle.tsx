import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { BillingToggleProps } from "../model/types";

const MotionBox = motion(Box);

export const BillingToggle: React.FC<BillingToggleProps> = ({
  isYearly,
  onToggle,
  discountPercentage = 20,
}) => {
  const { t } = useTranslation();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        mb: { xs: 4, md: 5 },
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: !isYearly ? "text.primary" : "text.secondary",
          fontWeight: !isYearly ? 600 : 400,
          transition: "all 0.3s ease",
          fontSize: { xs: "0.9rem", md: "1rem" },
        }}
      >
        {t("landing.pricing.monthly", "Monthly")}
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={isYearly}
            onChange={onToggle}
            color="primary"
            size="medium"
          />
        }
        label=""
        sx={{ m: 0 }}
      />
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body1"
          sx={{
            color: isYearly ? "text.primary" : "text.secondary",
            fontWeight: isYearly ? 600 : 400,
            transition: "all 0.3s ease",
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          {t("landing.pricing.yearly", "Yearly")}
        </Typography>
        
        <Chip
          label={t("landing.pricing.save", `Save ${discountPercentage}%`)}
          size="small"
          sx={{
            backgroundColor: "success.main",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 600,
            height: 20,
          }}
        />
      </Box>
    </MotionBox>
  );
}; 