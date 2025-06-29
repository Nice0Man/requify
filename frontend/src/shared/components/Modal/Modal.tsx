import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableEscapeKeyDown?: boolean;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableEscapeKeyDown = false,
  hideCloseButton = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      {title && (
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            {!hideCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      <DialogContent>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Convenience component for confirmation dialogs
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'error';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info',
}) => {
  const getConfirmColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} color={getConfirmColor()} variant="contained">
            {confirmText}
          </Button>
        </>
      }
    >
      <Typography>{message}</Typography>
    </Modal>
  );
};

export default Modal; 