import React from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  alpha,
  Fade,
  Divider,
} from '@mui/material';
import { RestartAlt, Edit, Check, Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '../model/store';

interface SidebarEditControlsProps {
  isVisible: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEnterEditMode: () => void;
  onApplyChanges: () => void;
  onCancelChanges: () => void;
  hasUnsavedChanges?: boolean;
}

export const SidebarEditControls: React.FC<SidebarEditControlsProps> = ({
  isVisible,
  isEditMode,
  onClose,
  onEnterEditMode,
  onApplyChanges,
  onCancelChanges,
  hasUnsavedChanges = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { resetToDefaultOrder } = useSidebarStore();

  const handleReset = () => {
    resetToDefaultOrder();
    onClose();
  };

  const handleEnterEditMode = () => {
    onEnterEditMode();
    onClose();
  };

  const handleApplyChanges = () => {
    onApplyChanges();
    onClose();
  };

  const handleCancelChanges = () => {
    onCancelChanges();
    onClose();
  };

  // Режим выбора действий (не в режиме редактирования)
  if (!isEditMode) {
    return (
      <Fade in={isVisible} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            left: 8,
            right: 8,
            zIndex: 1000,
            display: isVisible ? 'block' : 'none',
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.background.default, 0.98)} 100%)`,
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              p: 2,
              animation: 'slideUp 0.3s ease-out',
              '@keyframes slideUp': {
                '0%': {
                  transform: 'translateY(20px)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 1.5,
                fontSize: '0.8rem',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {t('sidebar.editModeTitle')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onClose}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '8px 16px',
                  borderColor: alpha(theme.palette.divider, 0.4),
                  color: theme.palette.text.secondary,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: alpha(theme.palette.divider, 0.6),
                    backgroundColor: alpha(theme.palette.action.hover, 0.08),
                  },
                }}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                variant="contained"
                size="small"
                onClick={handleEnterEditMode}
                startIcon={<Edit sx={{ fontSize: '16px !important' }} />}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '8px 16px',
                  background: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  boxShadow: `0 2px 4px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': {
                    background: theme.palette.secondary.dark,
                    boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {t('sidebar.enterEditMode')}
              </Button>
            </Box>
            
            <Button
              variant="text"
              size="small"
              onClick={handleReset}
              startIcon={<RestartAlt sx={{ fontSize: '16px !important' }} />}
              sx={{
                width: '100%',
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'none',
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                },
              }}
            >
              {t('sidebar.resetToDefault')}
            </Button>
          </Box>
        </Box>
      </Fade>
    );
  }

  // Режим редактирования
  return (
    <Fade in={isVisible} timeout={300}>
      <Box
        sx={{
          position: 'relative',
          padding: 1.5,
          marginTop: 1,
          marginBottom: 1,
          borderRadius: 2,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.default, 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        {/* Заголовок */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            marginBottom: 1,
          }}
        >
          <Edit
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {t('sidebar.editMode')}
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: alpha(theme.palette.divider, 0.2),
            marginBottom: 1,
          }}
        />

        {/* Подсказка */}
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            marginBottom: 1.5,
            lineHeight: 1.4,
            fontSize: '0.75rem',
          }}
        >
          {t('sidebar.editModeDescription')}
        </Typography>

        {/* Кнопки управления */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<Check sx={{ fontSize: 14 }} />}
            onClick={handleApplyChanges}
            sx={{
              flex: 1,
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              fontWeight: 500,
              fontSize: '0.75rem',
              padding: '6px 12px',
              borderRadius: 1,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
                boxShadow: 'none',
              },
              '&:active': {
                backgroundColor: theme.palette.success.dark,
              },
            }}
          >
            {t('sidebar.applyChanges')}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<Close sx={{ fontSize: 14 }} />}
            onClick={handleCancelChanges}
            sx={{
              flex: 1,
              backgroundColor: 'transparent',
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              fontWeight: 500,
              fontSize: '0.75rem',
              padding: '6px 12px',
              borderRadius: 1,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
              },
              '&:active': {
                backgroundColor: theme.palette.error.dark,
                borderColor: theme.palette.error.dark,
              },
            }}
          >
            {t('sidebar.cancelChanges')}
          </Button>
        </Box>

        {/* Индикатор несохраненных изменений */}
        {hasUnsavedChanges && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: theme.palette.warning.main,
              boxShadow: `0 0 4px ${alpha(theme.palette.warning.main, 0.5)}`,
            }}
          />
        )}
      </Box>
    </Fade>
  );
}; 