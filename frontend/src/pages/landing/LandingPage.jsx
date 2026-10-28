import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Tab,
  Tabs,
  Stack,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Bolt,
  Work,
  Business,
  TrendingUp,
  Security,
  Speed,
  AutoAwesome,
  CheckCircle,
  ArrowForward,
  Groups,
  AdminPanelSettings,
  Person,
  Star,
  East,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { jobsApi, companiesApi } from '../../api/services';

const PARTNERS = [
  { name: 'Google', logo: '🌐', roles: '14 Open Positions', tag: 'Tech Titan', rating: 4.8 },
  { name: 'Uber Technologies', logo: '🚗', roles: '9 Open Positions', tag: 'Mobility & AI', rating: 4.6 },
  { name: 'Stripe', logo: '💳', roles: '12 Open Positions', tag: 'FinTech Cloud', rating: 4.9 },
  { name: 'Microsoft', logo: '💻', roles: '22 Open Positions', tag: 'Enterprise Cloud', rating: 4.7 },
  { name: 'Tesla', logo: '⚡', roles: '8 Open Positions', tag: 'Autonomous AI', rating: 4.5 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getAll();
        setFeaturedJobs(res.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching jobs for landing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleQuickDemo = async (roleType) => {
    const creds = {
      CANDIDATE: { email: 'candidate@jobflow.com', password: 'Candidate@123' },
      RECRUITER: { email: 'recruiter@jobflow.com', password: 'Recruiter@123' },
      ADMIN: { email: 'admin@jobflow.com', password: 'Admin@123' },
    }[roleType];

    if (creds) {
      const res = await login(creds);
      if (res.success) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', overflowX: 'hidden' }}>
      {/* Dynamic Background Glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 80%)',
          filter: 'blur(90px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── TOP FLOATING NAVBAR ────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'sticky',
          top: 16,
          zIndex: 100,
          maxWidth: '1240px',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            px: 3,
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo */}
          <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
              }}
            >
              <Bolt sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
              Job<span style={{ color: '#6366f1' }}>Flow</span>
            </Typography>
            <Chip
              label="v2.0"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            />
          </Box>

          {/* Center Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: '#ffffff' } }}
              onClick={() => navigate('/jobs')}
            >
              Explore Jobs
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: '#ffffff' } }}
              onClick={() => navigate('/companies')}
            >
              Companies
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: '#ffffff' } }}
              onClick={() => navigate('/reviews')}
            >
              Reviews
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" gap={1.5}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                endIcon={<ArrowForward />}
                sx={{ borderRadius: '9999px', px: 2.5 }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => navigate('/auth')}
                  sx={{ color: '#f8fafc', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/auth')}
                  sx={{
                    borderRadius: '9999px',
                    px: 2.5,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" maxWidth="880px" mx="auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                mb: 3,
              }}
            >
              <AutoAwesome sx={{ color: '#818cf8', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#c7d2fe', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Next-Gen Distributed Hiring Architecture
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.75rem', md: '4.5rem' },
                fontWeight: 900,
                color: '#ffffff',
                mb: 2.5,
                lineHeight: 1.08,
              }}
            >
              Where Top Engineers Meet{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Big Tech Careers
              </span>
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '1.05rem', md: '1.25rem' }, mb: 4, maxWidth: '680px', mx: 'auto' }}>
              Accelerate your engineering journey with real-time matching, transparent salary metrics, verified employer badges, and instant interview pipelines.
            </Typography>
          </motion.div>

          {/* Search Bar Pod */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <GlassCard
              sx={{
                p: 1.5,
                borderRadius: '20px',
                maxWidth: '780px',
                mx: 'auto',
                boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 30px 0 rgba(99, 102, 241, 0.15)',
              }}
            >
              <form onSubmit={handleSearchSubmit}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      placeholder="Role, skill, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: '#818cf8' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      placeholder="Location (e.g. San Francisco, Remote)"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ color: '#06b6d4' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        py: 1.8,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      }}
                    >
                      Search Jobs
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </GlassCard>
          </motion.div>

          {/* 1-Click Interactive Demo Buttons */}
          <Box mt={4} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1.5} letterSpacing="0.05em" textTransform="uppercase">
              ⚡ Instant 1-Click Role Sandbox:
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Person sx={{ color: '#818cf8' }} />}
                onClick={() => handleQuickDemo('CANDIDATE')}
                sx={{
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  color: '#c7d2fe',
                  borderRadius: '10px',
                  '&:hover': { borderColor: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.15)' },
                }}
              >
                Candidate Sandbox
              </Button>
              <Button
                variant="outlined"
                startIcon={<Groups sx={{ color: '#34d399' }} />}
                onClick={() => handleQuickDemo('RECRUITER')}
                sx={{
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  color: '#a7f3d0',
                  borderRadius: '10px',
                  '&:hover': { borderColor: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                }}
              >
                Recruiter Portal
              </Button>
              <Button
                variant="outlined"
                startIcon={<AdminPanelSettings sx={{ color: '#fbbf24' }} />}
                onClick={() => handleQuickDemo('ADMIN')}
                sx={{
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  color: '#fde68a',
                  borderRadius: '10px',
                  '&:hover': { borderColor: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                }}
              >
                Admin Control Room
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* ── METRICS STRIP ────────────────────────────────────────────── */}
      <Box sx={{ borderY: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(15, 23, 42, 0.5)', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center" textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight={800} color="#818cf8">150K+</Typography>
              <Typography variant="body2" color="text.secondary">Active Tech Positions</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight={800} color="#34d399">4,800+</Typography>
              <Typography variant="body2" color="text.secondary">Verified Companies</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight={800} color="#22d3ee">99.4%</Typography>
              <Typography variant="body2" color="text.secondary">Fast Match Rate</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight={800} color="#fbbf24">&lt; 48h</Typography>
              <Typography variant="body2" color="text.secondary">Interview Turnaround</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── INTERACTIVE ROLE SHOWCASE ─────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={800} mb={1.5}>
            Tailored Experiences for Every Stakeholder
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
            Engineered with strict Role-Based Access Control and purpose-built dashboards.
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            centered
            sx={{
              mt: 4,
              '& .MuiTabs-indicator': { backgroundColor: '#6366f1', height: 3, borderRadius: 2 },
              '& .MuiTab-root': { color: '#94a3b8', fontWeight: 700, fontSize: '0.95rem', px: 3 },
              '& .Mui-selected': { color: '#818cf8' },
            }}
          >
            <Tab icon={<Person fontSize="small" />} iconPosition="start" label="For Candidates" />
            <Tab icon={<Groups fontSize="small" />} iconPosition="start" label="For Recruiters" />
            <Tab icon={<AdminPanelSettings fontSize="small" />} iconPosition="start" label="For Platform Admins" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} mb={2}>
                Land High-Impact Roles with Zero Friction
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Explore real verified listings, bookmark roles, submit 1-click applications with customized cover letters, and track interview progress in real-time.
              </Typography>
              <Stack spacing={2}>
                {[
                  'Live application status timeline (Applied ➔ In Review ➔ Interview ➔ Offer)',
                  'Direct salary transparency with verified pay ranges',
                  'Saved job synchronizations and recommendation algorithms',
                  'Peer company reviews and rating insights',
                ].map((text, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1.5}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" color="text.primary" fontWeight={500}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained"
                onClick={() => handleQuickDemo('CANDIDATE')}
                endIcon={<ArrowForward />}
                sx={{ mt: 4, borderRadius: '10px', px: 3 }}
              >
                Launch Candidate Portal
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <GlassCard glow sx={{ p: 3, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Typography variant="subtitle2" color="#818cf8" mb={2}>CANDIDATE INTELLIGENCE PREVIEW</Typography>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Senior Full-Stack Architect</Typography>
                  <Typography variant="body2" color="text.secondary">Google • Mountain View, CA (Hybrid)</Typography>
                  <Box display="flex" gap={1} mt={1.5}>
                    <Chip size="small" label="$160K - $230K" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }} />
                    <Chip size="small" label="Full-Time" sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }} />
                  </Box>
                </Box>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <Typography variant="body2" fontWeight={600}>Application Status Tracker:</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Chip size="small" label="Interview Scheduled" sx={{ bgcolor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }} />
                    <Typography variant="caption" color="text.secondary">Thursday, 2:00 PM EST</Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} mb={2}>
                Scale Your Engineering Pipeline
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Publish engineering roles, manage candidates across dynamic hiring funnels, shortlist applicants, and schedule automated interview invites.
              </Typography>
              <Stack spacing={2}>
                {[
                  'Instant job posting and lifecycle management (Open / Close / Edit)',
                  'One-click candidate shortlisting and rejection workflows',
                  'Automated email notifications on interview scheduling',
                  'Dedicated applicant portfolio and resume viewers',
                ].map((text, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1.5}>
                    <CheckCircle sx={{ color: '#06b6d4', fontSize: 20 }} />
                    <Typography variant="body2" color="text.primary" fontWeight={500}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleQuickDemo('RECRUITER')}
                endIcon={<ArrowForward />}
                sx={{ mt: 4, borderRadius: '10px', px: 3 }}
              >
                Launch Recruiter Portal
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <GlassCard glow sx={{ p: 3, border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <Typography variant="subtitle2" color="#22d3ee" mb={2}>RECRUITER PIPELINE PREVIEW</Typography>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)', mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={700}>Candidate: Alex Mercer</Typography>
                    <Chip size="small" label="Shortlisted" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">Role: Staff Distributed Systems Engineer</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <Typography variant="body2" fontWeight={700}>Active Job Openings: 8</Typography>
                  <Typography variant="caption" color="text.secondary">45 Total Applicants • 12 Interviews Scheduled</Typography>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} mb={2}>
                Enterprise Governance & System Auditing
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Full platform oversight: approve pending recruiters, verify company profiles, manage user authorizations, and monitor microservices performance.
              </Typography>
              <Stack spacing={2}>
                {[
                  'Live user management with status controls (Active / Suspended / Delete)',
                  'Pending recruiter approval queue with KYC verification',
                  'Platform analytics and microservices telemetry overview',
                  'Comprehensive audit logs for security compliance',
                ].map((text, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1.5}>
                    <CheckCircle sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="body2" color="text.primary" fontWeight={500}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained"
                onClick={() => handleQuickDemo('ADMIN')}
                endIcon={<ArrowForward />}
                sx={{
                  mt: 4,
                  borderRadius: '10px',
                  px: 3,
                  backgroundColor: '#f59e0b',
                  '&:hover': { backgroundColor: '#d97706' },
                }}
              >
                Launch Admin Control Room
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <GlassCard glow sx={{ p: 3, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Typography variant="subtitle2" color="#fbbf24" mb={2}>ADMIN CONTROL SUITE PREVIEW</Typography>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)', mb: 2 }}>
                  <Typography variant="body2" fontWeight={700}>Platform Health: 100% Operational</Typography>
                  <Typography variant="caption" color="text.secondary">5 Microservices Healthy • RabbitMQ Connected • PostgreSQL Synced</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                  <Typography variant="body2" fontWeight={700}>Pending Approvals: 5 Recruiters</Typography>
                  <Typography variant="caption" color="text.secondary">1,247 Total Registered Users</Typography>
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* ── TOP HIRING COMPANIES ──────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4}>
          <Box>
            <Typography variant="caption" color="#818cf8" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em">
              Featured Partners
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Hiring on JobFlow
            </Typography>
          </Box>
          <Button endIcon={<East />} onClick={() => navigate('/companies')} sx={{ color: '#818cf8' }}>
            View All Companies
          </Button>
        </Box>

        <Grid container spacing={3}>
          {PARTNERS.map((p, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <GlassCard sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Typography variant="h3" mb={1}>{p.logo}</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{p.name}</Typography>
                <Chip size="small" label={p.tag} sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }} />
                <Typography variant="caption" display="block" color="#818cf8" fontWeight={600}>
                  {p.roles}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={1}>
                  <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={700}>{p.rating}</Typography>
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', py: 6, mt: 8, backgroundColor: '#060911' }}>
        <Container maxWidth="lg">
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={3}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bolt sx={{ color: '#ffffff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>JobFlow</Typography>
              <Typography variant="caption" color="text.secondary" ml={2}>
                © {new Date().getFullYear()} JobFlow Enterprise Inc. All rights reserved.
              </Typography>
            </Box>

            <Box display="flex" gap={3}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/jobs')}>
                Jobs
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/companies')}>
                Companies
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/reviews')}>
                Reviews
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/auth')}>
                Sign In
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
