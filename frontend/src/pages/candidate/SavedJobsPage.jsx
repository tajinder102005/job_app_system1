import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, CircularProgress, IconButton, Tooltip, Chip } from '@mui/material';
import { Bookmark, Work, LocationOn, Business, DeleteOutline, Send, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobsApi, savedJobsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import { useToast } from '../../context/ToastContext';

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [allJobs, setAllJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const cached = localStorage.getItem('jobflow_saved_job_ids');
      return cached ? new Set(JSON.parse(cached)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSavedAndAllJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, savedRes] = await Promise.allSettled([
        jobsApi.getAll(),
        savedJobsApi.getAll(),
      ]);

      const loadedJobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.data || []) : [];
      setAllJobs(loadedJobs);

      if (savedRes.status === 'fulfilled' && savedRes.value.data && Array.isArray(savedRes.value.data)) {
        const remoteIds = new Set(savedRes.value.data.map((item) => Number(item.jobId || item.id)));
        setSavedJobIds(remoteIds);
        localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(remoteIds)));
      }
    } catch (err) {
      console.error('Error fetching saved jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAndAllJobs();
  }, []);

  const handleRemoveSavedJob = async (jobId) => {
    const numericId = Number(jobId);
    const nextIds = new Set(savedJobIds);
    nextIds.delete(numericId);
    setSavedJobIds(nextIds);
    localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(nextIds)));
    toast.info('Job removed from Saved Opportunities.');

    try {
      await savedJobsApi.unsave(numericId);
    } catch (err) {
      console.warn('Unsave error:', err.message);
    }
  };

  // Filter only jobs that are saved
  const savedJobs = allJobs.filter((item) => {
    const job = item.job || item;
    return savedJobIds.has(Number(job.id));
  });

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight={800} color="#ffffff">
              Saved Opportunities
            </Typography>
            <Chip
              label={`${savedJobs.length} Saved`}
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Review bookmarked roles and submit applications whenever you are ready
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/jobs')}
          startIcon={<Work />}
          sx={{ borderRadius: '10px' }}
        >
          Explore All Jobs
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} sx={{ color: '#6366f1' }} />
        </Box>
      ) : savedJobs.length === 0 ? (
        <GlassCard sx={{ p: 6, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Bookmark sx={{ fontSize: 36, color: '#f59e0b' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#ffffff" mb={1}>
            No Saved Opportunities Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.6}>
            Click the bookmark icon on any job card in <strong>Explore Jobs</strong> to save positions you are interested in.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/jobs')}
            sx={{ borderRadius: '10px', px: 3 }}
          >
            Discover Engineering Jobs
          </Button>
        </GlassCard>
      ) : (
        <Grid container spacing={3}>
          {savedJobs.map((item) => {
            const job = item.job || item;
            const company = item.company || {};
            return (
              <Grid item xs={12} md={6} key={job.id}>
                <GlassCard
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '&:hover': {
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                    },
                  }}
                >
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#ffffff">
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="#818cf8" fontWeight={600} mt={0.25}>
                          {company.name || 'Verified Company'}
                        </Typography>
                      </Box>
                      <Tooltip title="Remove from Saved">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSavedJob(job.id)}
                          sx={{
                            color: '#f59e0b',
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' },
                          }}
                        >
                          <Bookmark fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      my={1.5}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {job.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1.5} my={1.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn sx={{ color: '#06b6d4', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.location || 'Remote'}
                        </Typography>
                      </Box>
                      {(job.minSalary || job.maxSalary) && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AttachMoney sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600 }}>
                            {job.minSalary} - {job.maxSalary}
                          </Typography>
                        </Box>
                      )}
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Work sx={{ color: '#fbbf24', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.jobType || 'Full-time'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255, 255, 255, 0.06)">
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={() => handleRemoveSavedJob(job.id)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Send />}
                      onClick={() => navigate('/jobs')}
                      sx={{ borderRadius: '8px' }}
                    >
                      Apply Now
                    </Button>
                  </Box>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
