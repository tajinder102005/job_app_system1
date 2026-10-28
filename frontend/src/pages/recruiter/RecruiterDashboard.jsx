import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Work,
  Assignment,
  CalendarMonth,
  Add,
  CheckCircle,
  Close,
  MoreVert,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsApi, applicationsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';

export default function RecruiterDashboard() {
  const { name, companyId, companyName } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.allSettled([
        companyId ? jobsApi.getByCompany(companyId) : jobsApi.getAll(),
        companyId ? applicationsApi.getByCompany(companyId) : applicationsApi.getMyApplications(),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data || []);
    } catch (err) {
      console.error('Error loading recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const interviews = applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED');
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED');

  const jobColumns = [
    {
      id: 'title',
      label: 'Job Title',
      render: (row) => {
        const job = row.job || row;
        return (
          <Box>
            <Typography variant="body2" fontWeight={700} color="#ffffff">
              {job.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {job.location} • {job.jobType || 'Full-time'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'salary',
      label: 'Compensation',
      render: (row) => {
        const job = row.job || row;
        return (
          <Typography variant="body2" color="#34d399" fontWeight={600}>
            {job.minSalary || '$130K'} - {job.maxSalary || '$190K'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => {
        const job = row.job || row;
        return <StatusBadge status={job.status || 'ACTIVE'} size="small" />;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        const job = row.job || row;
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/applications')}
            sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
          >
            Review Candidates
          </Button>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Typography variant="h4" fontWeight={800} color="#ffffff">
              Recruiter Talent Suite
            </Typography>
            <Chip
              label="RECRUITER"
              size="small"
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}
            />
            {companyName && (
              <Chip
                label={companyName}
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            Welcome back, <span style={{ color: '#ffffff', fontWeight: 600 }}>{name}</span>. Manage your engineering pipeline and review candidate submissions.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={() => navigate('/my-jobs')}
            sx={{ borderRadius: '10px', px: 2.5 }}
          >
            Post Job
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/applications')}
            startIcon={<Assignment />}
            sx={{ borderRadius: '10px' }}
          >
            Manage Applicants
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Listings"
            value={jobs.length}
            icon={Work}
            color="#10b981"
            trend="+2 this week"
            subtitle="Live in candidate search"
            onClick={() => navigate('/my-jobs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applicants"
            value={applications.length}
            icon={Assignment}
            color="#06b6d4"
            subtitle="Across all job postings"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Interviews Set"
            value={interviews.length}
            icon={CalendarMonth}
            color="#6366f1"
            subtitle="Scheduled interview rounds"
            onClick={() => navigate('/interviews')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shortlisted"
            value={shortlisted.length}
            icon={CheckCircle}
            color="#f59e0b"
            subtitle="Advancing to technical stage"
          />
        </Grid>
      </Grid>

      {/* Active Postings Table */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="#ffffff">
            Your Active Postings
          </Typography>
          <Button size="small" onClick={() => navigate('/my-jobs')} sx={{ color: '#34d399' }}>
            View Full Manager
          </Button>
        </Box>
        <DataTable
          columns={jobColumns}
          data={jobs}
          loading={loading}
          searchPlaceholder="Search active jobs..."
          searchField="title"
          emptyMessage="No jobs posted yet. Click 'Post Job' to publish an opening."
        />
      </Box>
    </Box>
  );
}
