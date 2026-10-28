import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Assignment, Business, CalendarMonth, Work, ArrowForward, Launch, VideoCameraFront } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';

const PIPELINE_STEPS = ['Applied', 'Under Review', 'Interview', 'Decision'];

function getStepIndex(status) {
  switch (status) {
    case 'APPLIED':
      return 0;
    case 'UNDER_REVIEW':
      return 1;
    case 'INTERVIEW_SCHEDULED':
      return 2;
    case 'SHORTLISTED':
    case 'OFFER_EXTENDED':
    case 'REJECTED':
      return 3;
    default:
      return 0;
  }
}

export default function MyApplicationsPage() {
  const { email } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await applicationsApi.getMyApplications(email);
        setApplications(res.data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [email]);

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#ffffff">
            My Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your active interviews and submission timelines in real time
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/jobs')}
          startIcon={<Work />}
          sx={{ borderRadius: '10px' }}
        >
          Browse More Jobs
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} sx={{ color: '#6366f1' }} />
        </Box>
      ) : applications.length === 0 ? (
        <GlassCard sx={{ p: 6, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: '#818cf8', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="#ffffff" mb={1}>
            No Applications Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} maxWidth="480px" mx="auto">
            You haven't applied to any roles yet. Explore verified engineering listings and submit with 1-click.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/jobs')} sx={{ borderRadius: '10px' }}>
            Discover Open Positions
          </Button>
        </GlassCard>
      ) : (
        <Grid container spacing={3}>
          {applications.map((app) => {
            const stepIdx = getStepIndex(app.status);
            return (
              <Grid item xs={12} key={app.id}>
                <GlassCard sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#ffffff">
                        {app.job?.title || 'Senior Software Engineer'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Business sx={{ color: '#818cf8', fontSize: 16 }} />
                        <Typography variant="body2" color="#818cf8" fontWeight={600}>
                          {app.job?.company?.name || 'Verified Company'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {app.job?.location || 'Remote'}
                        </Typography>
                      </Box>
                    </Box>
                    <StatusBadge status={app.status} />
                  </Box>

                  {/* Visual Progress Stepper */}
                  <Box sx={{ my: 3, px: { xs: 0, sm: 2 } }}>
                    <Stepper activeStep={stepIdx} alternativeLabel>
                      {PIPELINE_STEPS.map((label, index) => (
                        <Step key={label} completed={index < stepIdx}>
                          <StepLabel
                            StepIconProps={{
                              sx: {
                                '&.Mui-active': { color: '#6366f1' },
                                '&.Mui-completed': { color: '#10b981' },
                              },
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} color={index <= stepIdx ? '#f8fafc' : 'text.secondary'}>
                              {label}
                            </Typography>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  {/* Interview Alert if scheduled */}
                  {app.interviewDate && (
                    <Box
                      p={2}
                      borderRadius="12px"
                      sx={{
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarMonth sx={{ color: '#22d3ee' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="#22d3ee">
                            Interview Confirmed: {app.interviewDate} at {app.interviewTime || '10:00 AM EST'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <VideoCameraFront sx={{ fontSize: 14, color: '#38bdf8' }} />
                            <span>Location / Meeting: {app.interviewLocation || 'Online meeting link sent to email'}</span>
                          </Typography>
                        </Box>
                      </Box>
                      {app.interviewLocation && app.interviewLocation.startsWith('http') && (
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          startIcon={<Launch sx={{ fontSize: '13px !important' }} />}
                          onClick={() => window.open(app.interviewLocation, '_blank')}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                        >
                          Join Meeting
                        </Button>
                      )}
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255, 255, 255, 0.06)">
                    <Typography variant="caption" color="text.disabled">
                      Application Reference ID: #{app.id}
                    </Typography>
                    {app.notes && (
                      <Typography variant="caption" color="#fbbf24">
                        Note: {app.notes}
                      </Typography>
                    )}
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
