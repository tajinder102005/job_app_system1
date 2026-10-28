import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, IconButton } from '@mui/material';
import { Business, Verified, CheckCircle, Close, OpenInNew } from '@mui/icons-material';
import { companiesApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';

export default function CompanyVerificationPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll();
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleVerify = async (company) => {
    try {
      const updated = { ...company, verified: true };
      await companiesApi.update(company.id, updated);
      toast.success(`${company.name} has been verified successfully!`);
      loadCompanies();
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Failed to verify company.');
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Company Name',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700} color="#ffffff">
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.industry || 'Technology'} • {row.location}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'website',
      label: 'Website',
      render: (row) => (
        <a
          href={row.website?.startsWith('http') ? row.website : `https://${row.website}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {row.website || 'https://example.com'} <OpenInNew sx={{ fontSize: 13 }} />
        </a>
      ),
    },
    {
      id: 'verified',
      label: 'Verification Status',
      render: (row) => (
        <StatusBadge status={row.verified ? 'VERIFIED' : 'PENDING'} size="small" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box display="flex" justifyContent="flex-end" gap={1}>
          {!row.verified && (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleVerify(row)}
              startIcon={<CheckCircle />}
              sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
            >
              Verify Company
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="#ffffff">
          Company Verification Desk
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review company credentials and issue verified employer badges
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        searchPlaceholder="Search companies by name or industry..."
        searchField="name"
        emptyMessage="No companies registered in database."
      />
    </Box>
  );
}
