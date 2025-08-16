import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { Check as CheckIcon } from "@mui/icons-material";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { PricingCardProps } from "../model/types";
import { calculatePrice } from "../model/data";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isYearly,
  isPopular,
  onSelectPlan,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const IconComponent = plan.icon;
  const price = calculatePrice(plan, isYearly);
  const popular = isPopular !== undefined ? isPopular : plan.popular;

  const handleSelectPlan = () => {
    onSelectPlan?.(plan.id);
  };

  return (
    <MotionCard
      whileHover={{
        y: -6,
        scale: 1.02,
        boxShadow: `0 16px 32px ${plan.color}20`,
      }}
      sx={{
        position: "relative",
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: popular ? `2px solid ${plan.color}` : "1px solid",
        borderColor: popular ? plan.color : "divider",
        backgroundColor: "background.paper",
        overflow: "visible",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: plan.color,
        },
      }}
    >
      {/* Popular Badge */}
      {popular && (
        <Chip
          label={t("landing.pricing.popular", "Most Popular")}
          sx={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: plan.color,
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 22,
            boxShadow: `0 3px 10px ${plan.color}40`,
          }}
        />
      )}

      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Plan Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 60, md: 70 },
              height: { xs: 60, md: 70 },
              borderRadius: "50%",
              backgroundColor: `${plan.color}15`,
              mb: 2,
            }}
          >
            <IconComponent sx={{ color: plan.color, fontSize: { xs: 28, md: 32 } }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
            }}
          >
            {t(plan.titleKey, plan.defaultTitle)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 2.5,
              fontSize: { xs: "0.8rem", md: "0.85rem" },
              minHeight: { xs: 32, md: 36 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {t(plan.subtitleKey, plan.defaultSubtitle)}
          </Typography>

          {/* Price */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: plan.color,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                ${price}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", md: "0.8rem" },
                }}
              >
                {price === 0
                  ? t("landing.pricing.forever", "forever")
                  : `/${
                      isYearly
                        ? t("landing.pricing.year", "year")
                        : t("landing.pricing.month", "month")
                    }`}
              </Typography>
            </Box>
            {isYearly && price > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  display: "block",
                  mt: 0.5,
                  fontSize: { xs: "0.65rem", md: "0.7rem" },
                }}
              >
                {t("landing.pricing.billedYearly", "Billed annually")}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Features List */}
        <List sx={{ py: 0, flex: 1 }}>
          {plan.features.map((feature, featureIndex) => (
            <ListItem
              key={featureIndex}
              sx={{
                p: 0,
                mb: 1,
                opacity: feature.included ? 1 : 0.4,
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon
                  sx={{
                    color: feature.included ? plan.color : "text.disabled",
                    fontSize: { xs: 16, md: 18 },
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t(feature.textKey, feature.defaultText)}
                primaryTypographyProps={{
                  fontSize: { xs: "0.8rem", md: "0.85rem" },
                  fontWeight: 500,
                  color: feature.included ? "text.primary" : "text.disabled",
                  lineHeight: 1.3,
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* CTA Button */}
        <MotionButton
          variant={popular ? "contained" : "outlined"}
          fullWidth
          size="large"
          onClick={handleSelectPlan}
          whileHover={{
            y: -2,
            boxShadow: popular ? `0 10px 25px ${plan.color}40` : "none",
          }}
          whileTap={{ scale: 0.98 }}
          sx={{
            py: { xs: 1.5, md: 1.8 },
            fontSize: { xs: "0.9rem", md: "0.95rem" },
            fontWeight: 700,
            borderRadius: 2.5,
            textTransform: "none",
            mt: 2,
            ...(popular
              ? {
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                  boxShadow: `0 6px 20px ${plan.color}40`,
                }
              : {
                  borderColor: plan.color,
                  color: plan.color,
                  "&:hover": {
                    borderColor: plan.color,
                    backgroundColor: `${plan.color}08`,
                  },
                }),
          }}
        >
          {price === 0
            ? t("landing.pricing.getStarted", "Get Started")
            : t("landing.pricing.startTrial", "Start Free Trial")}
        </MotionButton>
      </CardContent>
    </MotionCard>
  );
}; 