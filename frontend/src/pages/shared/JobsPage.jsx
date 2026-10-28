import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Business,
  AttachMoney,
  Send,
  Work,
  FilterList,
  CheckCircle,
  Add,
  CloudUpload,
  PictureAsPdf,
  Bolt,
  CheckCircleOutline,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { jobsApi, companiesApi, applicationsApi, resumesApi, savedJobsApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import CustomDialog from '../../components/common/CustomDialog';

export default function JobsPage() {
  const { role, name, email, ROLES, companyId, companyName } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const cached = localStorage.getItem('jobflow_saved_job_ids');
      return cached ? new Set(JSON.parse(cached)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [postJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ phone: '', resumeUrl: 'resume.pdf', coverLetter: '' });
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    minSalary: '$140,000',
    maxSalary: '$200,000',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    requiredSkills: 'Java, Spring Boot, React, PostgreSQL',
    companyId: 1,
  });
  const [companies, setCompanies] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Parse query params if redirected from landing page
    const params = new URLSearchParams(location.search);
    if (params.get('search')) setSearchTerm(params.get('search'));
    if (params.get('location')) setLocationFilter(params.get('location'));
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, compsRes] = await Promise.allSettled([
        jobsApi.getAll(),
        companiesApi.getAll(),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
      if (compsRes.status === 'fulfilled') setCompanies(compsRes.value.data || []);

      if (role === ROLES.CANDIDATE) {
        try {
          const savedRes = await savedJobsApi.getAll();
          if (savedRes.data && Array.isArray(savedRes.data)) {
            const ids = new Set(savedRes.data.map((item) => Number(item.jobId || item.id)));
            setSavedJobIds(ids);
            localStorage.setItem('jobflow_saved_job_ids', JSON.stringify(Array.from(ids)));
          }
        } catch (sErr) {
          console.warn('Saved jobs backend fetch fallback:', sErr.message);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
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
      toast.success('Job bookmarked! View it under Saved Jobs.');
      try {
        await savedJobsApi.save(numericId);
      } catch (err) {
        console.warn('Save error:', err.message);
      }
    }
  };

  useEffect(() => {
    loadData();
    if (companyId && role === ROLES.RECRUITER) {
      setJobForm((prev) => ({ ...prev, companyId: Number(companyId) }));
    }
  }, [companyId, role]);

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setUploadedResume(null);
    setApplyDialogOpen(true);
  };

  // Real-time job search filter
  const handleSearchChange = (val) => {
    setSearchTerm(val);
  };

  // Modular Object Storage Resume Upload
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
      toast.success(`Resume PDF uploaded to object storage (version ${data.version || '1'})!`);
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
        lastName: name?.split(' ')[1] || 'Applicant',
        email: email || 'candidate@jobflow.com',
        phone: applyForm.phone || '+1 (555) 234-5678',
        resumeUrl: applyForm.resumeUrl,
        coverLetter: applyForm.coverLetter,
      };
      await applicationsApi.submit(payload);
      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      setApplyForm({ phone: '', resumeUrl: 'resume.pdf', coverLetter: '' });
    } catch (err) {
      console.error('Application submission error:', err);
      toast.error(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobsApi.create(jobForm);
      toast.success('Job listing published successfully!');
      setPostJobDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Job creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((item) => {
    const job = item.job || item;
    const comp = item.company || {};
    const matchesSearch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLoc =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' ||
      job.jobType?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesLoc && matchesType;
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#ffffff">
            Explore Engineering Opportunities
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover {jobs.length} verified positions at world-class companies
          </Typography>
        </Box>
        {(role === ROLES.RECRUITER || role === ROLES.ADMIN) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPostJobDialogOpen(true)}
            sx={{ borderRadius: '10px', px: 3 }}
          >
            Post New Opportunity
          </Button>
        )}
      </Box>

      {/* Filter Bar */}
      <GlassCard sx={{ p: 2.5, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, skill, or keyword..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: '#818cf8' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Location (e.g. Remote, San Francisco)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" sx={{ color: '#06b6d4' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Job Type</InputLabel>
              <Select
                value={typeFilter}
                label="Job Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Employment Types</MenuItem>
                <MenuItem value="Full-time">Full-Time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </GlassCard>

      {/* Job Listings Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} sx={{ color: '#6366f1' }} />
        </Box>
      ) : filteredJobs.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color="text.secondary">
            No engineering positions match your search criteria.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setLocationFilter('');
              setTypeFilter('ALL');
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredJobs.map((item) => {
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
                  }}
                >
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#ffffff">
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="#818cf8" fontWeight={600} mt={0.25}>
                          {company.name || 'Verified Employer'}
                        </Typography>
                      </Box>
                      <StatusBadge status={job.status || 'ACTIVE'} size="small" />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ my: 1.5, lineHeight: 1.6 }}>
                      {job.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1.5} mb={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn sx={{ color: '#06b6d4', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.location}
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

                    {job.requiredSkills && (
                      <Box display="flex" flexWrap="wrap" gap={0.75} mb={2}>
                        {job.requiredSkills.split(',').map((skill, i) => (
                          <Chip
                            key={i}
                            label={skill.trim()}
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

                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255, 255, 255, 0.06)">
                    <Typography variant="caption" color="text.disabled">
                      {job.postedDate ? `Posted on ${new Date(job.postedDate).toLocaleDateString()}` : 'Actively Recruiting'}
                    </Typography>
                    {role === ROLES.CANDIDATE ? (
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
                          sx={{ borderRadius: '8px' }}
                        >
                          Apply
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => toast.info(`Job #${job.id}: ${job.title} at ${company.name || 'Company'}`)}
                        sx={{ borderRadius: '8px' }}
                      >
                        View Details
                      </Button>
                    )}
                  </Box>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── APPLY MODAL ──────────────────────────────────────────────── */}
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
              placeholder="+1 (555) 234-5678"
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
                id="resume-pdf-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="resume-pdf-upload" style={{ cursor: 'pointer', display: 'block' }}>
                {uploadingResume ? (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={1}>
                    <CircularProgress size={28} sx={{ color: '#6366f1' }} />
                    <Typography variant="body2" color="#818cf8">
                      Uploading resume to modular Object Storage...
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
              placeholder="Highlight your key achievements and passion for this engineering role..."
              required
            />
            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setApplyDialogOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} startIcon={<Send />} sx={{ px: 3 }}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>

      {/* ── POST JOB MODAL (Recruiters / Admins) ───────────────────────── */}
      <CustomDialog
        open={postJobDialogOpen}
        onClose={() => setPostJobDialogOpen(false)}
        title="Post New Engineering Opportunity"
        subtitle="Publish to the global JobFlow network"
        maxWidth="md"
      >
        <form onSubmit={handleCreateJobSubmit}>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Job Title"
                fullWidth
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="e.g. Senior Distributed Systems Engineer"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>
                <Select
                  value={jobForm.companyId}
                  label="Company"
                  disabled={role === ROLES.RECRUITER && Boolean(companyId)}
                  onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                >
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {role === ROLES.RECRUITER && companyId && (
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
                label="Job Description & Responsibilities"
                multiline
                rows={4}
                fullWidth
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Describe team mission, technical stack, architecture challenges..."
                required
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
            <Button variant="text" onClick={() => setPostJobDialogOpen(false)} sx={{ color: 'text.secondary' }}>
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
