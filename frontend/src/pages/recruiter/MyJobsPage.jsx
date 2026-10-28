import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Work, Delete, Lock, LockOpen } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobsApi, companiesApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import CustomDialog from '../../components/common/CustomDialog';
import DataTable from '../../components/common/DataTable';

export default function MyJobsPage() {
  const { companyId, companyName } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    minSalary: '$140,000',
    maxSalary: '$210,000',
    location: 'San Francisco, CA (Hybrid)',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    requiredSkills: 'Java, Spring Boot, React, PostgreSQL',
    companyId: companyId ? Number(companyId) : 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, compsRes] = await Promise.allSettled([
        companyId ? jobsApi.getByCompany(companyId) : jobsApi.getAll(),
        companiesApi.getAll(),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
      if (compsRes.status === 'fulfilled') setCompanies(compsRes.value.data || []);
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (companyId) {
      setJobForm((prev) => ({ ...prev, companyId: Number(companyId) }));
    }
  }, [companyId]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobsApi.create(jobForm);
      toast.success('Job listing published successfully!');
      setOpenModal(false);
      setJobForm({
        title: '',
        description: '',
        minSalary: '$140,000',
        maxSalary: '$210,000',
        location: 'San Francisco, CA (Hybrid)',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        requiredSkills: 'Java, Spring Boot, React, PostgreSQL',
        companyId: 1,
      });
      loadData();
    } catch (err) {
      console.error('Failed to create job:', err);
      toast.error(err.response?.data?.message || 'Error creating job.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleClose = async (id, currentStatus) => {
    try {
      if (currentStatus === 'CLOSED') {
        await jobsApi.open(id);
        toast.success('Job reopened successfully');
      } else {
        await jobsApi.close(id);
        toast.info('Job closed');
      }
      loadData();
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Failed to update job status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await jobsApi.delete(id);
      toast.success('Job deleted successfully');
      loadData();
    } catch (err) {
      console.error('Failed to delete job:', err);
      toast.error('Failed to delete job.');
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Role Title',
      render: (row) => {
        const job = row.job || row;
        return (
          <Box>
            <Typography variant="body2" fontWeight={700} color="#ffffff">
              {job.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {job.location} • {job.jobType}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'company',
      label: 'Organization',
      render: (row) => {
        const comp = row.company || {};
        return (
          <Typography variant="body2" color="#818cf8" fontWeight={600}>
            {comp.name || 'Company ID #' + (row.companyId || 1)}
          </Typography>
        );
      },
    },
    {
      id: 'salary',
      label: 'Salary Bracket',
      render: (row) => {
        const job = row.job || row;
        return (
          <Typography variant="body2" color="#34d399" fontWeight={600}>
            {job.minSalary} - {job.maxSalary}
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
        const isClosed = job.status === 'CLOSED';
        return (
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleToggleClose(job.id, job.status)}
              sx={{ color: isClosed ? '#10b981' : '#fbbf24' }}
              title={isClosed ? 'Reopen Job' : 'Close Job'}
            >
              {isClosed ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(job.id)}
              sx={{ color: '#f43f5e' }}
              title="Delete Job"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#ffffff">
            Job Posting Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Publish, edit, and manage live engineering opportunities
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: '10px', px: 3 }}
        >
          Create New Position
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={jobs}
        loading={loading}
        searchPlaceholder="Filter your postings..."
        searchField="title"
        emptyMessage="No job postings found. Click 'Create New Position' to begin."
      />

      {/* ── CREATE JOB MODAL ─────────────────────────────────────────── */}
      <CustomDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Post New Engineering Role"
        subtitle="Make your opening live to thousands of engineers"
        maxWidth="md"
      >
        <form onSubmit={handleCreateJob}>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Job Title"
                fullWidth
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Hiring Organization</InputLabel>
                <Select
                  value={jobForm.companyId}
                  label="Hiring Organization"
                  disabled={Boolean(companyId)}
                  onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                >
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {companyId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Locked to your company: {companyName || 'Assigned Tenant'}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (Hybrid)"
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Min Salary"
                fullWidth
                value={jobForm.minSalary}
                onChange={(e) => setJobForm({ ...jobForm, minSalary: e.target.value })}
                placeholder="$140,000"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Max Salary"
                fullWidth
                value={jobForm.maxSalary}
                onChange={(e) => setJobForm({ ...jobForm, maxSalary: e.target.value })}
                placeholder="$210,000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Required Skills (comma-separated)"
                fullWidth
                value={jobForm.requiredSkills}
                onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                placeholder="Java, Spring Boot, React, Kafka"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={jobForm.jobType}
                  label="Employment Type"
                  onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                multiline
                rows={4}
                fullWidth
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Detail the technical responsibilities and requirements..."
                required
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
            <Button variant="text" onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={<Add />} sx={{ px: 3 }}>
              {submitting ? 'Publishing...' : 'Publish Job'}
            </Button>
          </Box>
        </form>
      </CustomDialog>
    </Box>
  );
}
