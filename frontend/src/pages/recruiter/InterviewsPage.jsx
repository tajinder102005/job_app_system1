import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { CalendarMonth, Person, VideoCameraFront, AccessTime, Launch, Description } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function InterviewsPage() {
  const { companyId } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const res = companyId
          ? await applicationsApi.getByCompany(companyId)
          : await applicationsApi.getMyApplications();
        const scheduled = (res.data || []).filter(
          (a) => a.status === 'INTERVIEW_SCHEDULED' || a.interviewDate
        );
        setInterviews(scheduled);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [companyId]);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="#ffffff">
          Scheduled Interviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track upcoming technical rounds and candidate conversations
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} sx={{ color: '#6366f1' }} />
        </Box>
      ) : interviews.length === 0 ? (
        <GlassCard sx={{ p: 6, textAlign: 'center' }}>
          <CalendarMonth sx={{ fontSize: 48, color: '#06b6d4', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="#ffffff" mb={1}>
            No Upcoming Interviews Scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Go to the Applications page to shortlist candidates and schedule technical rounds.
          </Typography>
        </GlassCard>
      ) : (
        <Grid container spacing={3}>
          {interviews.map((app) => (
            <Grid item xs={12} md={6} key={app.id}>
              <GlassCard sx={{ p: 3, border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#ffffff">
                      {app.job?.title || 'Engineering Position'}
                    </Typography>
                    <Typography variant="body2" color="#22d3ee" fontWeight={600}>
                      Candidate: {app.firstName ? `${app.firstName} ${app.lastName}` : app.email}
                    </Typography>
                  </Box>
                  <StatusBadge status="INTERVIEW_SCHEDULED" size="small" />
                </Box>

                <Box display="flex" flexDirection="column" gap={1.5} my={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime sx={{ color: '#818cf8', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'TBD'} ({app.interviewTime || 'EST'})
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <VideoCameraFront sx={{ color: '#34d399', fontSize: 18 }} />
                    <Typography variant="body2" color="#34d399" sx={{ wordBreak: 'break-all' }}>
                      {app.interviewLocation || 'Google Meet'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mt={2} pt={1.5} borderTop="1px solid rgba(255,255,255,0.06)">
                  {app.interviewLocation && app.interviewLocation.startsWith('http') && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<Launch sx={{ fontSize: '14px !important' }} />}
                      onClick={() => window.open(app.interviewLocation, '_blank')}
                      sx={{ borderRadius: '8px', fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      Join Meeting
                    </Button>
                  )}
                  {app.resumeUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Description sx={{ fontSize: '14px !important' }} />}
                      onClick={() => {
                        const url = app.resumeUrl.startsWith('http')
                          ? app.resumeUrl
                          : `https://nhljemjccwxldmauivde.supabase.co/storage/v1/object/public/resumes/${app.resumeUrl.replace(/^\/resumes\//, '')}`;
                        window.open(url, '_blank');
                      }}
                      sx={{ borderRadius: '8px', fontSize: '0.75rem', textTransform: 'none', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                    >
                      View Resume
                    </Button>
                  )}
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
