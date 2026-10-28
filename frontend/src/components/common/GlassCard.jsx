import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function GlassCard({ children, sx = {}, hover = true, onClick, glow = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Component {...motionProps}>
      <Box
        onClick={onClick}
        sx={{
          backgroundColor: 'rgba(17, 24, 39, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: glow
            ? '0 10px 40px -10px rgba(99, 102, 241, 0.25), 0 0 20px 0 rgba(99, 102, 241, 0.1)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          '&:hover': hover
            ? {
                borderColor: 'rgba(99, 102, 241, 0.35)',
                boxShadow: '0 16px 40px 0 rgba(0, 0, 0, 0.45)',
              }
            : {},
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    </Component>
  );
}
