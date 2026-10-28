import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Rating,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle,
  Close,
  CalendarMonth,
  Person,
  Email,
  Phone,
  Description,
  ViewKanban,
  TableRows,
  RateReview,
  ArrowForward,
  Work,
  Star,
  EventAvailable,
  Link as LinkIcon,
  VideoCall,
  Launch,
  Apartment,
  AutoAwesome,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationsApi, interviewsApi, jobsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import CustomDialog from '../../components/common/CustomDialog';
import DataTable from '../../components/common/DataTable';

const KANBAN_COLUMNS = [
  { id: 'APPLIED', label: 'Applied', color: '#6366f1', count: 0 },
  { id: 'UNDER_REVIEW', label: 'Under Review', color: '#38bdf8', count: 0 },
  { id: 'SHORTLISTED', label: 'Shortlisted', color: '#fbbf24', count: 0 },
  { id: 'INTERVIEW_SCHEDULED', label: 'Interviewing', color: '#ec4899', count: 0 },
  { id: 'OFFER_EXTENDED', label: 'Offer Extended', color: '#a855f7', count: 0 },
  { id: 'ACCEPTED', label: 'Hired', color: '#22c55e', count: 0 },
];

const ALL_STAGES = ['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'ACCEPTED', 'REJECTED'];

export default function ApplicationsPage() {
  const { companyId, companyName, id: currentUserId } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [activeStage, setActiveStage] = useState('ALL');
  const [selectedJobId, setSelectedJobId] = useState(queryJobId || 'ALL');
  const [companyJobs, setCompanyJobs] = useState([]);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: '',
    interviewTime: '10:00 AM - 11:00 AM EST',
    interviewType: 'TECHNICAL',
    meetingOption: 'MANUAL', // 'MANUAL' | 'AUTOGEN' | 'IN_PERSON'
    manualLink: '',
    inPersonLocation: '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 8,
    feedback: '',
    internalNotes: '',
    decision: 'OFFER_EXTENDED',
  });

  const [rejectForm, setRejectForm] = useState({
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      let res;
      if (companyId) {
        res = await applicationsApi.getByCompany(companyId);
      } else {
        res = await applicationsApi.getMyApplications();
      }
      setApplications(res.data || []);

      // Also load company jobs for the profile filter dropdown
      try {
        const jRes = companyId ? await jobsApi.getByCompany(companyId) : await jobsApi.getAll();
        setCompanyJobs(jRes.data || []);
      } catch (e) {
        console.warn('Could not fetch jobs for filter dropdown:', e);
      }
    } catch (err) {
      console.error('Error fetching recruiter applications:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Application advanced to ${status.replace('_', ' ')}`);
      loadData();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleShortlist = async (id) => {
    try {
      await applicationsApi.shortlist(id);
      toast.success('Candidate shortlisted for interviews!');
      loadData();
    } catch (err) {
      console.error('Shortlist error:', err);
      toast.error('Failed to shortlist application.');
    }
  };

  const handleOpenReject = (app) => {
    setActiveApp(app);
    setRejectForm({ notes: '' });
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      await applicationsApi.reject(activeApp.id, rejectForm.notes);
      toast.info('Candidate application marked as rejected.');
      setRejectModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to reject application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSchedule = (app) => {
    setActiveApp(app);
    // Suggest tomorrow at 10:00 AM local
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const defaultDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setScheduleForm({
      interviewDate: defaultDate,
      interviewTime: '10:00 AM - 11:00 AM EST',
      interviewType: 'TECHNICAL',
      meetingOption: 'MANUAL', // Default to manual link option
      manualLink: '',
      inPersonLocation: '',
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;

    let finalMeetingLocation = '';
    if (scheduleForm.meetingOption === 'MANUAL') {
      finalMeetingLocation = scheduleForm.manualLink.trim();
      if (!finalMeetingLocation) {
        toast.error('Please enter the manual meeting link (e.g. Google Meet or Zoom link).');
        return;
      }
      if (!finalMeetingLocation.startsWith('http://') && !finalMeetingLocation.startsWith('https://')) {
        finalMeetingLocation = 'https://' + finalMeetingLocation;
      }
    } else if (scheduleForm.meetingOption === 'AUTOGEN') {
      const room = `jobflow-${activeApp.id || 'room'}-${Math.random().toString(36).substring(2, 7)}`;
      finalMeetingLocation = `https://meet.jit.si/${room}`;
    } else {
      finalMeetingLocation = scheduleForm.inPersonLocation.trim() || 'On-site Office';
    }

    setSubmitting(true);
    try {
      // Create Interview record
      await interviewsApi.schedule({
        applicationId: activeApp.id,
        jobId: activeApp.jobId || activeApp.job?.id,
        candidateEmail: activeApp.email,
        recruiterId: currentUserId || 1,
        scheduledAt: scheduleForm.interviewDate,
        interviewType: scheduleForm.interviewType,
        meetingLink: finalMeetingLocation,
      });

      // Advance Application status to INTERVIEW_SCHEDULED
      await applicationsApi.scheduleInterview(activeApp.id, {
        interviewDate: scheduleForm.interviewDate,
        interviewTime: scheduleForm.interviewTime,
        interviewLocation: finalMeetingLocation,
      });

      toast.success('Interview scheduled! Meeting link attached and invitation sent.');
      setScheduleModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Schedule interview error:', err);
      toast.error('Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFeedback = (app) => {
    setActiveApp(app);
    setFeedbackForm({
      rating: 8,
      feedback: '',
      internalNotes: '',
      decision: 'OFFER_EXTENDED',
    });
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      // Find interviews for this application
      try {
        const intRes = await interviewsApi.getByApplication(activeApp.id);
        const interviews = intRes.data || [];
        if (interviews.length > 0) {
          const latestInt = interviews[interviews.length - 1];
          await interviewsApi.submitFeedback(latestInt.id, {
            rating: feedbackForm.rating,
            feedback: feedbackForm.feedback,
            internalNotes: feedbackForm.internalNotes,
          });
        }
      } catch (err) {
        console.warn('Could not post interview feedback directly to interview entity', err);
      }

      // Advance application according to recruiter's decision
      if (feedbackForm.decision === 'OFFER_EXTENDED') {
        await applicationsApi.updateStatus(activeApp.id, 'OFFER_EXTENDED');
        toast.success('Interview feedback saved. Offer Extended!');
      } else if (feedbackForm.decision === 'REJECTED') {
        await applicationsApi.reject(activeApp.id, feedbackForm.feedback || 'Did not meet requirements');
        toast.info('Interview completed. Candidate rejected.');
      } else {
        toast.success('Interview feedback recorded successfully.');
      }

      setFeedbackModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error('Failed to record feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick reject notes options
  const quickRejectNotes = [
    'Skills mismatch with role seniority',
    'Position filled with earlier applicant',
    'Candidate compensation expectations mismatch',
    'Role requirements changed',
  ];

  const columns = [
    {
      id: 'candidate',
      label: 'Candidate',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700} color="#ffffff">
            {row.firstName && row.lastName ? `${row.firstName} ${row.lastName}` : row.email || 'Applicant'}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
            <Email sx={{ color: 'text.secondary', fontSize: 13 }} />
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'job',
      label: 'Target Position',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="#818cf8">
            {row.jobTitle || row.job?.title || `Job #${row.jobId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.jobLocation || row.job?.location || companyName || 'Company'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'resume',
      label: 'Resume & Cover',
      render: (row) => (
        <Box>
          {row.resumeUrl ? (
            <Button
              size="small"
              variant="text"
              startIcon={<Description sx={{ fontSize: '14px !important' }} />}
              onClick={() => {
                const url = row.resumeUrl.startsWith('http')
                  ? row.resumeUrl
                  : `https://nhljemjccwxldmauivde.supabase.co/storage/v1/object/public/resumes/${row.resumeUrl.replace(/^\/resumes\//, '')}`;
                window.open(url, '_blank');
              }}
              sx={{
                p: 0,
                fontSize: '0.75rem',
                color: '#38bdf8',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
              }}
            >
              View Resume {row.resumeVersion ? `(v${row.resumeVersion})` : ''}
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No resume
            </Typography>
          )}
          {row.coverLetter && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
              "{row.coverLetter}"
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Pipeline Stage',
      render: (row) => <StatusBadge status={row.status || 'APPLIED'} size="small" />,
    },
    {
      id: 'actions',
      label: 'Pipeline Actions',
      align: 'right',
      render: (row) => {
        const s = row.status || 'APPLIED';
        return (
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            {s === 'APPLIED' && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleUpdateStatus(row.id, 'UNDER_REVIEW')}
                sx={{ borderRadius: '6px', fontSize: '0.72rem', px: 1 }}
              >
                Review
              </Button>
            )}
            {(s === 'APPLIED' || s === 'UNDER_REVIEW') && (
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleShortlist(row.id)}
                startIcon={<CheckCircle />}
                sx={{ borderRadius: '6px', fontSize: '0.72rem', px: 1 }}
              >
                Shortlist
              </Button>
            )}
            {s === 'SHORTLISTED' && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => handleOpenSchedule(row)}
                startIcon={<CalendarMonth />}
                sx={{ borderRadius: '6px', fontSize: '0.72rem', px: 1.5 }}
              >
                Schedule
              </Button>
            )}
            {s === 'INTERVIEW_SCHEDULED' && (
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => handleOpenFeedback(row)}
                startIcon={<RateReview />}
                sx={{ borderRadius: '6px', fontSize: '0.72rem', px: 1.5 }}
              >
                Feedback
              </Button>
            )}
            {s === 'OFFER_EXTENDED' && (
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleUpdateStatus(row.id, 'ACCEPTED')}
                startIcon={<CheckCircle />}
                sx={{ borderRadius: '6px', fontSize: '0.72rem', px: 1.5 }}
              >
                Hire
              </Button>
            )}
            {s !== 'REJECTED' && s !== 'ACCEPTED' && (
              <IconButton size="small" title="Reject Candidate" onClick={() => handleOpenReject(row)} sx={{ color: '#f43f5e' }}>
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];

  // Combine jobs from API and any distinct jobs present in applications
  const availableJobs = React.useMemo(() => {
    const map = new Map();
    companyJobs.forEach((j) => {
      map.set(String(j.id), { id: String(j.id), title: j.title });
    });
    applications.forEach((a) => {
      const jId = String(a.jobId || a.job?.id || '');
      const jTitle = a.jobTitle || a.job?.title || (jId ? `Job #${jId}` : '');
      if (jId && !map.has(jId)) {
        map.set(jId, { id: jId, title: jTitle });
      }
    });
    return Array.from(map.values());
  }, [companyJobs, applications]);

  // Filter applications by selected job profile (if specified)
  const filteredApplications = applications.filter((app) => {
    if (selectedJobId && selectedJobId !== 'ALL') {
      const appId = String(app.jobId || app.job?.id || '');
      if (appId !== String(selectedJobId)) return false;
    }
    return true;
  });

  const displayedApplications = activeStage === 'ALL'
    ? filteredApplications
    : filteredApplications.filter((a) => (a.status || 'APPLIED') === activeStage);

  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Typography variant="h4" fontWeight={800} color="#ffffff">
              Candidate Applications Pipeline
            </Typography>
            {companyName && (
              <Chip
                label={companyName}
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            Visual recruitment pipeline: review talent, move applicants across stages, schedule interviews & record evaluation feedback.
          </Typography>
        </Box>

        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, next) => next && setViewMode(next)}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              color: '#94a3b8',
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: 'rgba(99, 102, 241, 0.3)',
              },
            },
          }}
        >
          <ToggleButton value="kanban">
            <ViewKanban sx={{ mr: 1, fontSize: 18 }} /> Kanban Board
          </ToggleButton>
          <ToggleButton value="table">
            <TableRows sx={{ mr: 1, fontSize: 18 }} /> Table View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── FILTER TOOLBAR (JOB PROFILE & STAGES) ─────────────────────── */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left: Job Profile Selector */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="job-filter-label" sx={{ color: '#94a3b8' }}>Filter by Job Profile</InputLabel>
            <Select
              labelId="job-filter-label"
              value={selectedJobId}
              label="Filter by Job Profile"
              onChange={(e) => setSelectedJobId(e.target.value)}
              sx={{
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#818cf8' },
              }}
            >
              <MenuItem value="ALL">
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Work sx={{ fontSize: 16, color: '#818cf8' }} />
                  <span>All Job Openings</span>
                  <Chip
                    label={applications.length}
                    size="small"
                    sx={{ height: 18, fontSize: '0.68rem', bgcolor: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', ml: 'auto' }}
                  />
                </Box>
              </MenuItem>
              {availableJobs.map((job) => {
                const count = applications.filter((a) => String(a.jobId || a.job?.id) === job.id).length;
                return (
                  <MenuItem key={job.id} value={job.id}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" gap={2}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 320, color: '#f1f5f9' }}>
                        {job.title}
                      </Typography>
                      <Chip
                        label={count}
                        size="small"
                        sx={{ height: 18, fontSize: '0.68rem', bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedJobId !== 'ALL' && (
            <Chip
              icon={<Clear sx={{ fontSize: '14px !important' }} />}
              label="Clear Job Filter"
              size="small"
              clickable
              onClick={() => setSelectedJobId('ALL')}
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600,
              }}
            />
          )}

          <Typography variant="caption" color="text.secondary">
            Showing <strong>{filteredApplications.length}</strong> candidate{filteredApplications.length === 1 ? '' : 's'}
          </Typography>
        </Box>

        {/* Right: Stage Filters (for Table View) */}
        {viewMode === 'table' && (
          <Box display="flex" gap={1} flexWrap="wrap">
            {ALL_STAGES.map((st) => (
              <Chip
                key={st}
                label={`${st.replace('_', ' ')} (${st === 'ALL' ? filteredApplications.length : filteredApplications.filter((a) => (a.status || 'APPLIED') === st).length})`}
                clickable
                onClick={() => setActiveStage(st)}
                size="small"
                sx={{
                  bgcolor: activeStage === st ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeStage === st ? '#a5b4fc' : '#94a3b8',
                  fontWeight: activeStage === st ? 700 : 500,
                  border: activeStage === st ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ── KANBAN BOARD VIEW ─────────────────────────────────────────── */}
      {viewMode === 'kanban' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2.5,
            alignItems: 'stretch',
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 2.5,
            pt: 0.5,
            px: 0.5,
            /* High visibility horizontal scrollbar so recruiters can smoothly scroll */
            '&::-webkit-scrollbar': {
              height: 10,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(99, 102, 241, 0.4)',
              borderRadius: 8,
              border: '2px solid rgba(15, 23, 42, 0.6)',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.7)',
              },
            },
          }}
        >
          {KANBAN_COLUMNS.map((col) => {
            const columnApps = filteredApplications.filter((a) => (a.status || 'APPLIED') === col.id);
            const KANBAN_MAX_VISIBLE = 50;
            const hasMore = columnApps.length > KANBAN_MAX_VISIBLE;
            const visibleApps = hasMore ? columnApps.slice(0, KANBAN_MAX_VISIBLE) : columnApps;
            const remainingCount = columnApps.length - KANBAN_MAX_VISIBLE;

            return (
              <Box
                key={col.id}
                sx={{
                  /* FIXED UNIFORM COLUMN SIZE - ALWAYS 320PX, NO SHRINKING OR EXPANDING */
                  width: 320,
                  minWidth: 320,
                  maxWidth: 320,
                  flexShrink: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 240px)',
                  minHeight: 520,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Column Header */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pb={1.5}
                  mb={1.5}
                  borderBottom="1px solid rgba(255, 255, 255, 0.08)"
                >
                  <Box display="flex" alignItems="center" gap={1.25}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: col.color,
                        boxShadow: `0 0 10px ${col.color}`,
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={700} color="#e2e8f0" letterSpacing={0.2}>
                      {col.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={columnApps.length}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </Box>

                {/* Cards Container */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    flexGrow: 1,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: 4,
                    },
                  }}
                >
                  {columnApps.length === 0 ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height={180}
                      border="1px dashed rgba(255, 255, 255, 0.1)"
                      borderRadius={2}
                      bgcolor="rgba(255, 255, 255, 0.01)"
                      gap={1}
                    >
                      <Person sx={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.2)' }} />
                      <Typography variant="caption" color="text.secondary">
                        No candidates in this stage
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {visibleApps.map((app) => (
                        <Card
                          key={app.id}
                          sx={{
                            bgcolor: 'rgba(30, 41, 59, 0.75)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 2,
                            transition: 'all 0.18s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              borderColor: col.color,
                              boxShadow: `0 4px 14px rgba(0, 0, 0, 0.3), 0 0 10px ${col.color}20`,
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            {/* Candidate Header */}
                            <Box display="flex" alignItems="center" gap={1.25} mb={1}>
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  fontSize: '0.82rem',
                                  bgcolor: col.color,
                                  fontWeight: 700,
                                }}
                              >
                                {(app.firstName?.[0] || app.email?.[0] || 'C').toUpperCase()}
                              </Avatar>
                              <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" fontWeight={700} color="#f8fafc" noWrap>
                                  {app.firstName && app.lastName ? `${app.firstName} ${app.lastName}` : app.email?.split('@')[0]}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                  {app.email}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Role Applied */}
                            <Box mb={1.25} bgcolor="rgba(0, 0, 0, 0.25)" p={1} borderRadius={1.5} border="1px solid rgba(255, 255, 255, 0.04)">
                              <Typography variant="caption" fontWeight={600} color="#818cf8" display="block" noWrap>
                                {app.jobTitle || app.job?.title || `Job #${app.jobId}`}
                              </Typography>
                              {app.resumeUrl ? (
                                <Button
                                  size="small"
                                  variant="text"
                                  startIcon={<Description sx={{ fontSize: '13px !important' }} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = app.resumeUrl.startsWith('http')
                                      ? app.resumeUrl
                                      : `https://nhljemjccwxldmauivde.supabase.co/storage/v1/object/public/resumes/${app.resumeUrl.replace(/^\/resumes\//, '')}`;
                                    window.open(url, '_blank');
                                  }}
                                  sx={{
                                    p: 0,
                                    mt: 0.25,
                                    fontSize: '0.7rem',
                                    color: '#38bdf8',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
                                  }}
                                >
                                  View Resume {app.resumeVersion ? `(v${app.resumeVersion})` : ''}
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.25, display: 'block' }}>
                                  No resume attached
                                </Typography>
                              )}
                            </Box>

                            {/* Action Buttons based on stage */}
                            <Box display="flex" gap={0.5} justifyContent="space-between" alignItems="center" mt={1}>
                              {col.id === 'APPLIED' && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleUpdateStatus(app.id, 'UNDER_REVIEW')}
                                  sx={{ fontSize: '0.7rem', py: 0.35, borderRadius: 1 }}
                                >
                                  Review
                                </Button>
                              )}

                              {col.id === 'UNDER_REVIEW' && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleShortlist(app.id)}
                                  sx={{ fontSize: '0.7rem', py: 0.35, borderRadius: 1 }}
                                >
                                  Shortlist
                                </Button>
                              )}

                              {col.id === 'SHORTLISTED' && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleOpenSchedule(app)}
                                  startIcon={<CalendarMonth sx={{ fontSize: '14px !important' }} />}
                                  sx={{ fontSize: '0.7rem', py: 0.35, borderRadius: 1 }}
                                >
                                  Schedule
                                </Button>
                              )}

                              {col.id === 'INTERVIEW_SCHEDULED' && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="contained"
                                  color="info"
                                  onClick={() => handleOpenFeedback(app)}
                                  startIcon={<RateReview sx={{ fontSize: '14px !important' }} />}
                                  sx={{ fontSize: '0.7rem', py: 0.35, borderRadius: 1 }}
                                >
                                  Feedback
                                </Button>
                              )}

                              {col.id === 'OFFER_EXTENDED' && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                                  startIcon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                  sx={{ fontSize: '0.7rem', py: 0.35, borderRadius: 1 }}
                                >
                                  Confirm Hire
                                </Button>
                              )}

                              {col.id === 'ACCEPTED' && (
                                <Chip
                                  label="Hired ✓"
                                  size="small"
                                  color="success"
                                  sx={{ width: '100%', fontWeight: 700, fontSize: '0.72rem' }}
                                />
                              )}

                              {col.id !== 'ACCEPTED' && (
                                <Tooltip title="Reject candidate">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenReject(app)}
                                    sx={{ color: '#f43f5e', p: 0.5 }}
                                  >
                                    <Close sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}

                      {/* ── 50+ CANDIDATES OVERFLOW OPTION ─────────────────── */}
                      {hasMore && (
                        <Box
                          onClick={() => {
                            setActiveStage(col.id);
                            setViewMode('table');
                            toast.info(`Switched to Table View for stage "${col.label}" (${columnApps.length} total candidates)`);
                          }}
                          sx={{
                            mt: 1,
                            p: 2,
                            bgcolor: 'rgba(99, 102, 241, 0.12)',
                            border: '1px dashed rgba(99, 102, 241, 0.5)',
                            borderRadius: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.22)',
                              borderColor: '#818cf8',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={0.5}>
                            <TableRows sx={{ fontSize: 18, color: '#818cf8' }} />
                            <Typography variant="subtitle2" fontWeight={700} color="#e0e7ff">
                              +{remainingCount} More Candidates
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="#cbd5e1" display="block">
                            Showing first 50. Click here to see remaining candidates in Table View →
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── TABLE VIEW ───────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={displayedApplications}
          loading={loading}
          searchPlaceholder="Filter applicants by name, email, or role..."
          searchField="email"
          emptyMessage="No candidate applications received yet."
        />
      )}

      {/* ── SCHEDULE INTERVIEW MODAL ─────────────────────────────────── */}
      <CustomDialog
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Technical Interview"
        subtitle={`Candidate: ${activeApp?.firstName || activeApp?.email || 'Applicant'}`}
      >
        <form onSubmit={handleScheduleSubmit}>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField
              label="Interview Date & Time"
              type="datetime-local"
              fullWidth
              value={scheduleForm.interviewDate}
              onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Timezone / Display Time"
              fullWidth
              value={scheduleForm.interviewTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })}
              placeholder="e.g. 2:00 PM - 3:00 PM EST"
              required
            />
            <TextField
              select
              label="Interview Format"
              fullWidth
              value={scheduleForm.interviewType}
              onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="TECHNICAL">Technical Coding & System Architecture</option>
              <option value="BEHAVIORAL">Behavioral & Cultural Leadership</option>
              <option value="SYSTEM_DESIGN">System Design & Cloud Infrastructure</option>
              <option value="HR">HR & Culture Fit</option>
            </TextField>
            {/* Meeting Link & Location Mode Selector */}
            <Box>
              <Typography variant="body2" color="#e2e8f0" fontWeight={600} mb={1}>
                Interview Meeting Link & Location Mode
              </Typography>
              <ToggleButtonGroup
                value={scheduleForm.meetingOption}
                exclusive
                onChange={(e, val) => {
                  if (val) setScheduleForm({ ...scheduleForm, meetingOption: val });
                }}
                fullWidth
                size="small"
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: 'text.secondary',
                    py: 1,
                    '&.Mui-selected': {
                      color: '#ffffff',
                      bgcolor: 'rgba(99, 102, 241, 0.25)',
                      borderColor: '#6366f1',
                    },
                  },
                }}
              >
                <ToggleButton value="MANUAL">
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
                    <span>Manually Add Link</span>
                  </Box>
                </ToggleButton>
                <ToggleButton value="AUTOGEN">
                  <Box display="flex" alignItems="center" gap={1}>
                    <VideoCall sx={{ fontSize: 18, color: '#34d399' }} />
                    <span>Auto-Generate Link</span>
                  </Box>
                </ToggleButton>
                <ToggleButton value="IN_PERSON">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Apartment sx={{ fontSize: 18, color: '#fbbf24' }} />
                    <span>In-Person Office</span>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Option 1: Manual Meeting Link */}
            {scheduleForm.meetingOption === 'MANUAL' && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  bgcolor: 'rgba(56, 189, 248, 0.05)',
                }}
              >
                <Typography variant="caption" color="#7dd3fc" fontWeight={700} display="block" mb={1}>
                  ENTER CUSTOM MEETING LINK (Google Meet, Zoom, Teams, Webex)
                </Typography>
                <TextField
                  label="Manual Meeting URL"
                  fullWidth
                  value={scheduleForm.manualLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, manualLink: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                  required
                  helperText="Paste your custom video call link here. It will be emailed directly to the candidate."
                />

                {/* Quick helper shortcuts */}
                <Box display="flex" alignItems="center" gap={1} mt={1.5} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary">
                    Quick Insert:
                  </Typography>
                  <Chip
                    label="Google Meet"
                    size="small"
                    clickable
                    onClick={() => {
                      window.open('https://meet.google.com/new', '_blank');
                      if (!scheduleForm.manualLink) {
                        setScheduleForm({ ...scheduleForm, manualLink: 'https://meet.google.com/' });
                      }
                    }}
                    icon={<Launch sx={{ fontSize: '12px !important' }} />}
                    sx={{ bgcolor: 'rgba(66, 133, 244, 0.2)', color: '#93c5fd', borderColor: '#3b82f6', border: '1px solid' }}
                  />
                  <Chip
                    label="Zoom"
                    size="small"
                    clickable
                    onClick={() => {
                      if (!scheduleForm.manualLink) {
                        setScheduleForm({ ...scheduleForm, manualLink: 'https://zoom.us/j/' });
                      }
                    }}
                    sx={{ bgcolor: 'rgba(45, 140, 255, 0.2)', color: '#93c5fd', borderColor: '#2563eb', border: '1px solid' }}
                  />
                  <Chip
                    label="MS Teams"
                    size="small"
                    clickable
                    onClick={() => {
                      if (!scheduleForm.manualLink) {
                        setScheduleForm({ ...scheduleForm, manualLink: 'https://teams.microsoft.com/' });
                      }
                    }}
                    sx={{ bgcolor: 'rgba(98, 100, 167, 0.2)', color: '#c7d2fe', borderColor: '#6366f1', border: '1px solid' }}
                  />
                </Box>
              </Box>
            )}

            {/* Option 2: Auto-Generated Room */}
            {scheduleForm.meetingOption === 'AUTOGEN' && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  bgcolor: 'rgba(52, 211, 153, 0.05)',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <AutoAwesome sx={{ color: '#34d399', fontSize: 18 }} />
                  <Typography variant="body2" color="#6ee7b7" fontWeight={700}>
                    JobFlow 1-Click Encrypted Video Room
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  A dedicated browser-based video meeting link will be created automatically upon confirming. No software download required for candidate or recruiter.
                </Typography>
              </Box>
            )}

            {/* Option 3: In-Person Office */}
            {scheduleForm.meetingOption === 'IN_PERSON' && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  bgcolor: 'rgba(251, 191, 36, 0.05)',
                }}
              >
                <TextField
                  label="Office Address & Conference Room"
                  fullWidth
                  value={scheduleForm.inPersonLocation}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, inPersonLocation: e.target.value })}
                  placeholder="e.g. Headquarters Tower 2, Conference Room 4B, 100 Innovation Way"
                  required
                />
              </Box>
            )}
            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setScheduleModalOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} startIcon={<CalendarMonth />}>
                {submitting ? 'Confirming...' : 'Schedule Interview'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>

      {/* ── INTERVIEW FEEDBACK MODAL ─────────────────────────────────── */}
      <CustomDialog
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Submit Interview Evaluation"
        subtitle={`Candidate: ${activeApp?.firstName || activeApp?.email || 'Applicant'}`}
      >
        <form onSubmit={handleFeedbackSubmit}>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <Box>
              <Typography variant="body2" color="#e2e8f0" fontWeight={600} mb={1}>
                Technical & Competency Score: {feedbackForm.rating}/10
              </Typography>
              <Rating
                max={10}
                value={feedbackForm.rating}
                onChange={(e, val) => setFeedbackForm({ ...feedbackForm, rating: val || 5 })}
                sx={{ color: '#fbbf24' }}
              />
            </Box>

            <TextField
              select
              label="Recommendation Decision"
              fullWidth
              value={feedbackForm.decision}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, decision: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="OFFER_EXTENDED">Pass — Extend Job Offer</option>
              <option value="KEEP_IN_INTERVIEW">Needs Additional Follow-up Round</option>
              <option value="REJECTED">Reject — Candidate does not meet requirements</option>
            </TextField>

            <TextField
              label="Evaluation Feedback (Visible to Candidate)"
              multiline
              rows={3}
              fullWidth
              placeholder="Candidate demonstrated strong knowledge of Java, microservices, and distributed transactions..."
              value={feedbackForm.feedback}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
            />

            <TextField
              label="Internal Hiring Notes (Recruiter Only)"
              multiline
              rows={2}
              fullWidth
              placeholder="Strictly internal: Salary expectation is $165k, available immediately in 2 weeks notice."
              value={feedbackForm.internalNotes}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, internalNotes: e.target.value })}
            />

            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setFeedbackModalOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} startIcon={<RateReview />}>
                {submitting ? 'Saving...' : 'Submit Evaluation'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>

      {/* ── REJECTION REASON MODAL ────────────────────────────────────── */}
      <CustomDialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Candidate Application"
        subtitle={`Candidate: ${activeApp?.firstName || activeApp?.email || 'Applicant'}`}
      >
        <form onSubmit={handleRejectSubmit}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Select or provide a rejection reason. This will update the application status and audit log.
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {quickRejectNotes.map((note) => (
                <Chip
                  key={note}
                  label={note}
                  clickable
                  size="small"
                  onClick={() => setRejectForm({ notes: note })}
                  sx={{
                    bgcolor: rejectForm.notes === note ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: rejectForm.notes === note ? '#f43f5e' : '#94a3b8',
                    border: rejectForm.notes === note ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              ))}
            </Box>

            <TextField
              label="Feedback / Reason Notes"
              multiline
              rows={3}
              fullWidth
              value={rejectForm.notes}
              onChange={(e) => setRejectForm({ notes: e.target.value })}
              placeholder="e.g. While candidate has strong fundamentals, we are currently seeking candidates with deeper Kubernetes production experience."
              required
            />

            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setRejectModalOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="error" disabled={submitting} startIcon={<Close />}>
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>
    </Box>
  );
}
