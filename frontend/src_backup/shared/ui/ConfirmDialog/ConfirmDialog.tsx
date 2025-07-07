import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info' | 'success';
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const severityConfig = {
  warning: {
    icon: WarningIcon,
    color: 'warning.main',
    backgroundColor: 'warning.main',
  },
  error: {
    icon: ErrorIcon,
    color: 'error.main', 
    backgroundColor: 'error.main',
  },
  info: {
    icon: InfoIcon,
    color: 'info.main',
    backgroundColor: 'info.main',
  },
  success: {
    icon: SuccessIcon,
    color: 'success.main',
    backgroundColor: 'success.main',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  loading = false,
  maxWidth = 'sm',
}) => {
  const theme = useTheme();
  const config = severityConfig[severity];
  const SeverityIcon = config.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette[severity].main, 0.1),
              border: `1px solid ${alpha(theme.palette[severity].main, 0.2)}`,
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <SeverityIcon sx={{ color: config.color, mt: 0.5 }} />
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ color: config.color }}
                >
                  {severity === 'warning' && 'Warning'}
                  {severity === 'error' && 'Danger'}
                  {severity === 'info' && 'Information'}
                  {severity === 'success' && 'Success'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ borderRadius: 2 }}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={severity}
          variant="contained"
          sx={{ borderRadius: 2 }}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 