import React from 'react';
import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = '#6366f1',
  trend,
  trendLabel = 'vs last month',
  subtitle,
  onClick,
}) {
  const isPositive = trend && !trend.startsWith('-');

  return (
    <GlassCard onClick={onClick} hover={!!onClick} sx={{ height: '100%' }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={0.5} sx={{ color: '#ffffff' }}>
            {value}
          </Typography>
        </Box>
        {Icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
              border: `1px solid ${color}44`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 26 }} />
          </Box>
        )}
      </Box>

      {trend && (
        <Box display="flex" alignItems="center" gap={0.75} mt={1}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              color: isPositive ? '#10b981' : '#f43f5e',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {isPositive ? <TrendingUp fontSize="small" sx={{ mr: 0.25 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.25 }} />}
            {trend}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {trendLabel}
          </Typography>
        </Box>
      )}

      {subtitle && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {subtitle}
        </Typography>
      )}
    </GlassCard>
  );
}
