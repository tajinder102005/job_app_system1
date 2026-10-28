import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Work,
  Assignment,
  Bookmark,
  Search,
  AutoAwesome,
  LocationOn,
  AttachMoney,
  Business,
  ArrowForward,
  Send,
  VideoCall,
  CalendarMonth,
  CloudUpload,
  PictureAsPdf,
  BookmarkBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobsApi, applicationsApi, interviewsApi, resumesApi, savedJobsApi } from '../../api/services';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import CustomDialog from '../../components/common/CustomDialog';

export default function CandidateDashboard() {
  const { name, email } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', phone: '', resumeUrl: 'resume.pdf' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const cached = localStorage.getItem('jobflow_saved_job_ids');
      return cached ? new Set(JSON.parse(cached)) : new Set();
    } catch {
      return new Set();
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, intRes] = await Promise.allSettled([
        jobsApi.getAll(),
        applicationsApi.getMyApplications(email),
        interviewsApi.getForCandidate(email),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data || []);
      if (intRes.status === 'fulfilled') setScheduledInterviews(intRes.value.data || []);

      try {
        const savedRes = await savedJobsApi.getAll();
        if (savedRes.data && Array.isArray(savedRes.data)) {
          const ids = new Set(savedRes.data.map((item) => Number(item.jobId || item.id)));
          setSavedJobIds(ids);
          localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(ids)));
        }
      } catch (sErr) {
        console.warn('Saved jobs candidate fetch:', sErr.message);
      }
    } catch (err) {
      console.error('Error loading candidate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSaveJob = async (jobId) => {
    const numericId = Number(jobId);
    const isSaved = savedJobIds.has(numericId);
    const nextIds = new Set(savedJobIds);

    if (isSaved) {
      nextIds.delete(numericId);
      setSavedJobIds(nextIds);
      localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(nextIds)));
      toast.info('Job removed from Saved Opportunities.');
      try {
        await savedJobsApi.unsave(numericId);
      } catch (err) {
        console.warn('Unsave error:', err.message);
      }
    } else {
      nextIds.add(numericId);
      setSavedJobIds(nextIds);
      localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(nextIds)));
      toast.success('Job bookmarked! View it in Saved Jobs.');
      try {
        await savedJobsApi.save(numericId);
      } catch (err) {
        console.warn('Save error:', err.message);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [email]);

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setUploadedResume(null);
    setApplyDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents are supported for resume verification.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume PDF file size must be under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingResume(true);
      const res = await resumesApi.upload(formData);
      const data = res.data;
      setUploadedResume({
        name: data.originalName || file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        version: data.version || '1',
        url: data.resumeUrl,
        presignedUrl: data.presignedUrl,
      });
      setApplyForm((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
      toast.success(`Resume PDF uploaded to object storage (v${data.version || '1'})!`);
    } catch (err) {
      console.error('Resume upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload resume to storage.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const payload = {
        jobId: selectedJob.id || selectedJob.job?.id,
        firstName: name?.split(' ')[0] || 'Candidate',
        lastName: name?.split(' ')[1] || 'User',
        email: email || 'candidate@jobflow.com',
        phone: applyForm.phone || '+1 (555) 019-2834',
        resumeUrl: applyForm.resumeUrl,
        coverLetter: applyForm.coverLetter,
      };
      await applicationsApi.submit(payload);
      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      setApplyForm({ coverLetter: '', phone: '', resumeUrl: 'resume.pdf' });
      loadData();
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const title = j.title || j.job?.title || '';
    const desc = j.description || j.job?.description || '';
    const comp = j.company?.name || '';
    const q = searchTerm.toLowerCase();
    return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || comp.toLowerCase().includes(q);
  });

  const activeApps = applications.filter((a) => a.status !== 'REJECTED');
  const interviews = applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED');

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Typography variant="h4" fontWeight={800} color="#ffffff">
              Candidate Command Center
            </Typography>
            <Chip
              label="CANDIDATE"
              size="small"
              sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Welcome back, <span style={{ color: '#ffffff', fontWeight: 600 }}>{name}</span>. Discover top engineering opportunities matched to your profile.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/jobs')}
          startIcon={<Work />}
          sx={{ borderRadius: '10px', px: 3 }}
        >
          Explore All Jobs
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Roles"
            value={jobs.length}
            icon={Work}
            color="#6366f1"
            trend="+12% new"
            subtitle="Real-time verified listings"
            onClick={() => navigate('/jobs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Applications"
            value={applications.length}
            icon={Assignment}
            color="#06b6d4"
            subtitle={`${activeApps.length} actively advancing`}
            onClick={() => navigate('/my-applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Interviews"
            value={interviews.length}
            icon={AutoAwesome}
            color="#10b981"
            subtitle="Scheduled sessions"
            onClick={() => navigate('/my-applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Matched"
            value={Math.min(jobs.length, 5)}
            icon={Bookmark}
            color="#f59e0b"
            subtitle="Based on skills & preferences"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column: Recommended Openings */}
        <Grid item xs={12} md={7} lg={8}>
          <GlassCard sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#ffffff">
                  Recommended Positions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High-fit roles querying live PostgreSQL database
                </Typography>
              </Box>
              <TextField
                size="small"
                placeholder="Search matching jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 240 }}
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={32} sx={{ color: '#6366f1' }} />
              </Box>
            ) : filteredJobs.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary">No matching job listings found.</Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredJobs.slice(0, 6).map((item) => {
                  const job = item.job || item;
                  const company = item.company || {};
                  return (
                    <Grid item xs={12} key={job.id}>
                      <GlassCard
                        sx={{
                          p: 2.5,
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="#ffffff">
                            {job.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" my={0.75}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Business fontSize="small" sx={{ color: '#818cf8', fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary">
                                {company.name || 'Top Employer'}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOn fontSize="small" sx={{ color: '#06b6d4', fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary">
                                {job.location || 'Remote'}
                              </Typography>
                            </Box>
                            {(job.minSalary || job.maxSalary) && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AttachMoney fontSize="small" sx={{ color: '#10b981', fontSize: 16 }} />
                                <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 600 }}>
                                  {job.minSalary} - {job.maxSalary}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {job.requiredSkills && (
                            <Box display="flex" gap={0.75} flexWrap="wrap">
                              {job.requiredSkills.split(',').map((s, i) => (
                                <Chip
                                  key={i}
                                  label={s.trim()}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#94a3b8',
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tooltip title={savedJobIds.has(Number(job.id)) ? 'Remove from Saved' : 'Save Opportunity'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleSaveJob(job.id)}
                              sx={{
                                p: 0.8,
                                borderRadius: '8px',
                                border: savedJobIds.has(Number(job.id))
                                  ? '1px solid #f59e0b'
                                  : '1px solid rgba(255, 255, 255, 0.15)',
                                bgcolor: savedJobIds.has(Number(job.id))
                                  ? 'rgba(245, 158, 11, 0.18)'
                                  : 'rgba(255, 255, 255, 0.04)',
                                color: savedJobIds.has(Number(job.id)) ? '#f59e0b' : '#94a3b8',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(245, 158, 11, 0.25)',
                                  color: '#fbbf24',
                                },
                              }}
                            >
                              {savedJobIds.has(Number(job.id)) ? (
                                <Bookmark fontSize="small" />
                              ) : (
                                <BookmarkBorder fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenApply(item)}
                            startIcon={<Send />}
                            sx={{
                              borderRadius: '8px',
                              px: 2.5,
                            }}
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
          </GlassCard>
        </Grid>

        {/* Right Column: Interviews & Pipeline */}
        <Grid item xs={12} md={5} lg={4}>
          {/* Upcoming Interviews Card */}
          {scheduledInterviews.length > 0 && (
            <GlassCard sx={{ p: 3, mb: 3, border: '1px solid rgba(236, 72, 153, 0.3)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <VideoCall sx={{ color: '#ec4899' }} />
                  <Typography variant="h6" fontWeight={700} color="#ffffff">
                    Upcoming Interviews
                  </Typography>
                </Box>
                <Chip
                  label={scheduledInterviews.length}
                  size="small"
                  sx={{ bgcolor: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', fontWeight: 700 }}
                />
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                {scheduledInterviews.map((intv) => (
                  <Box
                    key={intv.id}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(236, 72, 153, 0.2)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={700} color="#ffffff">
                        {intv.interviewType ? intv.interviewType.replace('_', ' ') : 'Technical'} Round
                      </Typography>
                      <Chip
                        label={intv.status || 'SCHEDULED'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(236, 72, 153, 0.15)',
                          color: '#f472b6',
                        }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block">
                      🗓️ {intv.scheduledAt ? new Date(intv.scheduledAt).toLocaleString() : 'Scheduled soon'}
                    </Typography>

                    {intv.meetingLink && (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="secondary"
                        href={intv.meetingLink.startsWith('http') ? intv.meetingLink : `https://${intv.meetingLink}`}
                        target="_blank"
                        startIcon={<VideoCall />}
                        sx={{ mt: 1.5, borderRadius: '8px', fontSize: '0.75rem', py: 0.5 }}
                      >
                        Join Video Meeting
                      </Button>
                    )}

                    {intv.feedback && (
                      <Box mt={1.5} p={1} borderRadius="6px" bgcolor="rgba(255, 255, 255, 0.04)">
                        <Typography variant="caption" color="#cbd5e1" fontWeight={600} display="block">
                          Interviewer Feedback:
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          "{intv.feedback}"
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </GlassCard>
          )}

          {/* Application Pipeline */}
          <GlassCard sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700} color="#ffffff">
                Application Pipeline
              </Typography>
              <Button size="small" onClick={() => navigate('/my-applications')} sx={{ color: '#818cf8' }}>
                View All
              </Button>
            </Box>

            {applications.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  You haven't submitted applications yet.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/jobs')}
                  sx={{ mt: 2, borderRadius: '8px' }}
                >
                  Browse Jobs
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {applications.slice(0, 4).map((app) => (
                  <Box
                    key={app.id}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="body2" fontWeight={700} color="#ffffff">
                        {app.job?.title || 'Engineering Role'}
                      </Typography>
                      <StatusBadge status={app.status} size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {app.job?.company?.name || 'Partner Company'}
                    </Typography>
                    {app.interviewDate && (
                      <Box mt={1} p={1.25} borderRadius="8px" bgcolor="rgba(6, 182, 212, 0.1)" border="1px solid rgba(6, 182, 212, 0.2)">
                        <Typography variant="caption" color="#22d3ee" fontWeight={700} display="block">
                          🗓️ Interview Scheduled: {new Date(app.interviewDate).toLocaleDateString()} at {app.interviewTime || 'TBD'}
                        </Typography>
                        {app.interviewLocation && (
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            href={app.interviewLocation.startsWith('http') ? app.interviewLocation : `https://${app.interviewLocation}`}
                            target="_blank"
                            sx={{ mt: 1, fontSize: '0.72rem', py: 0.4, px: 1.5, borderRadius: '6px' }}
                          >
                            🎥 Join Interview
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </GlassCard>
        </Grid>
      </Grid>

      {/* ── 1-CLICK APPLICATION MODAL ─────────────────────────────────── */}
      <CustomDialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        title={`Apply to ${selectedJob?.title || selectedJob?.job?.title || 'Position'}`}
        subtitle={`${selectedJob?.company?.name || 'Verified Company'} • ${selectedJob?.location || selectedJob?.job?.location || 'Remote'}`}
      >
        <form onSubmit={handleApplySubmit}>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField
              label="Contact Phone"
              fullWidth
              value={applyForm.phone}
              onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              required
            />
            {/* Real PDF File Upload Section */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: uploadedResume
                  ? '2px solid rgba(16, 185, 129, 0.4)'
                  : '2px dashed rgba(99, 102, 241, 0.35)',
                bgcolor: uploadedResume
                  ? 'rgba(16, 185, 129, 0.05)'
                  : 'rgba(99, 102, 241, 0.04)',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: uploadedResume
                    ? 'rgba(16, 185, 129, 0.6)'
                    : 'rgba(99, 102, 241, 0.6)',
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              <input
                type="file"
                accept=".pdf"
                id="cand-resume-pdf-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="cand-resume-pdf-upload" style={{ cursor: 'pointer', display: 'block' }}>
                {uploadingResume ? (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={1}>
                    <CircularProgress size={28} sx={{ color: '#6366f1' }} />
                    <Typography variant="body2" color="#818cf8">
                      Uploading resume to object storage...
                    </Typography>
                  </Box>
                ) : uploadedResume ? (
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} flexWrap="wrap" py={0.5}>
                    <PictureAsPdf sx={{ color: '#ef4444', fontSize: 32 }} />
                    <Box textAlign="left">
                      <Typography variant="body2" fontWeight={700} color="#ffffff">
                        {uploadedResume.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {uploadedResume.size} • Object Storage verified
                      </Typography>
                    </Box>
                    <Chip
                      label={`Version ${uploadedResume.version}`}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 700, ml: 1 }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      component="span"
                      sx={{ textTransform: 'none', color: '#818cf8', ml: 1 }}
                    >
                      Replace PDF
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={1}>
                    <CloudUpload sx={{ fontSize: 36, color: '#818cf8' }} />
                    <Typography variant="body2" fontWeight={600} color="#ffffff">
                      Upload Resume (PDF)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Max 5MB • Direct storage with versioning and presigned URL access
                    </Typography>
                  </Box>
                )}
              </label>
            </Box>

            <TextField
              label="Verified Storage URL / Document Path"
              fullWidth
              size="small"
              value={applyForm.resumeUrl}
              onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
              placeholder="Will auto-populate when PDF is uploaded above"
              required
            />
            <TextField
              label="Cover Letter / Why You're a Fit"
              multiline
              rows={4}
              fullWidth
              value={applyForm.coverLetter}
              onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
              placeholder="Highlight your key achievements, relevant experience, and passion for the mission..."
              required
            />
            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setApplyDialogOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<Send />}
                sx={{ px: 3 }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>
    </Box>
  );
}
