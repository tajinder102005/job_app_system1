import React from 'react';
import { Box, Typography } from '@mui/material';

const STATUS_CONFIGS = {
  // Application statuses
  APPLIED: { label: 'Applied', bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', dot: '#6366f1' },
  UNDER_REVIEW: { label: 'In Review', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
  INTERVIEW_SCHEDULED: { label: 'Interview', bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)', dot: '#06b6d4' },
  REJECTED: { label: 'Rejected', bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)', dot: '#f43f5e' },
  OFFER_EXTENDED: { label: 'Offer', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', dot: '#a855f7' },
  
  // User / Job statuses
  ACTIVE: { label: 'Active', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
  PENDING: { label: 'Pending', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
  SUSPENDED: { label: 'Suspended', bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)', dot: '#f43f5e' },
  CLOSED: { label: 'Closed', bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', dot: '#64748b' },
  VERIFIED: { label: 'Verified', bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)', dot: '#06b6d4' },
};

export default function StatusBadge({ status = 'ACTIVE', size = 'medium', customLabel }) {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIGS[normalized] || {
    label: customLabel || status,
    bg: 'rgba(255, 255, 255, 0.1)',
    text: '#f8fafc',
    border: 'rgba(255, 255, 255, 0.2)',
    dot: '#ffffff',
  };

  const isSmall = size === 'small';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: isSmall ? 1 : 1.5,
        py: isSmall ? 0.25 : 0.5,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        width: 'fit-content',
      }}
    >
      <Box
        sx={{
          width: isSmall ? 5 : 6,
          height: isSmall ? 5 : 6,
          borderRadius: '50%',
          backgroundColor: config.dot,
          boxShadow: `0 0 8px ${config.dot}`,
        }}
      />
      <Typography
        sx={{
          color: config.text,
          fontSize: isSmall ? '0.7rem' : '0.775rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {customLabel || config.label}
      </Typography>
    </Box>
  );
}
