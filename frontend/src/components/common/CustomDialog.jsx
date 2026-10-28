import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function CustomDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          p: 1,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(9, 13, 22, 0.8)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#ffffff">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ p: 2.5, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
