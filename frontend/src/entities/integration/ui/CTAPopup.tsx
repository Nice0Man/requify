import {
  Close,
  Star,
  CheckCircle,
  OpenInNew,
  GitHub as GitHubIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  Groups as GroupsIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  Modal,
  Fade,
  Box,
  IconButton,
  Typography,
  Chip,
  Divider,
  Button,
  SxProps,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Integration } from "../model";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const IntegrationIcon = ({
  integration,
  sx,
}: {
  integration: Integration;
  sx?: SxProps;
}) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    GitHub: GitHubIcon,
    Chat: ChatIcon,
    Assignment: AssignmentIcon,
    Api: ApiIcon,
    Security: SecurityIcon,
    CloudSync: CloudSyncIcon,
    Groups: GroupsIcon,
    Description: DescriptionIcon,
  };

  const IconComponent = iconMap[integration.icon] || ApiIcon;

  return <IconComponent sx={sx} />;
};

// CTA Modal для интеграций
interface IntegrationCTAModalProps {
  open: boolean;
  onClose: () => void;
  integration: Integration | null;
}

export const IntegrationCTAModal: React.FC<IntegrationCTAModalProps> = ({
  open,
  onClose,
  integration,
}) => {
  const theme = useTheme();

  if (!integration) return null;

  const handleConnectClick = () => {
    console.log("Connecting to integration:", integration.title);
    onClose();
  };

  const handleLearnMoreClick = () => {
    console.log("Learning more about:", integration.title);
    window.open(`/integrations/${integration.id}`, "_blank");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Fade in={open}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: "relative",
            maxWidth: { xs: "90vw", sm: "500px" },
            width: "100%",
            maxHeight: "90vh",
            bgcolor: "background",
            borderRadius: 4, // Увеличиваем как в других компонентах
            background: "rgba(255, 255, 255, 0.98)", // Делаем светлее
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.15)`, // Уменьшаем тень для светлого вида
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Декоративный blur элемент */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${integration.color}10 0%, transparent 70%)`, // Делаем светлее
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              zIndex: 1,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${integration.color}20 0%, ${integration.color}40 100%)`,
                  border: `1px solid ${integration.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                  flexShrink: 0,
                  boxShadow: `0 8px 20px ${integration.color}30`,
                }}
              >
                <IntegrationIcon
                  integration={integration}
                  sx={{ fontSize: 32, color: integration.color }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mr: 2, color: "text.primary" }}
                  >
                    {integration.title}
                  </Typography>
                  {integration.isPopular && (
                    <Chip
                      icon={<Star sx={{ fontSize: "16px !important" }} />}
                      label="Популярно"
                      size="small"
                      color="warning"
                      variant="filled"
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={400}
                >
                  {integration.description}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
              >
                Возможности
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={400}
                >
                  {integration.description}
                </Typography>
                {[
                  {
                    icon: <CheckCircle color="success" />,
                    text: "Простая настройка за 5 минут",
                  },
                  {
                    icon: <SecurityIcon color="primary" />,
                    text: "Безопасное подключение",
                  },
                  {
                    icon: <CloudSyncIcon color="info" />,
                    text: "Высокая скорость обработки данных",
                  },
                ].map((feature, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    {feature.icon}
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight={400}
                    >
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Connection Stats */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Статистика использования
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                {integration.connections}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={handleConnectClick}
                startIcon={<CheckCircle />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 3, // Как в AdvancedFeaturesSection
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}CC 100%)`,
                  boxShadow: `0 8px 25px ${integration.color}25`, // Делаем светлее
                  "&:hover": {
                    background: `linear-gradient(135deg, ${integration.color}DD 0%, ${integration.color}BB 100%)`,
                    boxShadow: `0 12px 35px ${integration.color}30`, // Делаем светлее
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Подключить интеграцию
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleLearnMoreClick}
                endIcon={<OpenInNew />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: integration.color,
                  color: integration.color,
                  "&:hover": {
                    borderColor: integration.color,
                    backgroundColor: `${integration.color}08`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Узнать больше
              </Button>
            </Box>

            {/* Trust Indicator */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.25", // Делаем светлее
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                🔒 Безопасное подключение • SSL шифрование • Соответствие GDPR
              </Typography>
            </Box>
          </Box>
        </MotionBox>
      </Fade>
    </Modal>
  );
};
