import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  Work,
  CheckCircle,
  LinkedIn,
  GitHub,
  Language,
  OpenInNew,
  Save,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function ProfilePage() {
  const { name, email, role, status, userId } = useAuth();
  const toast = useToast();

  const storageKey = `jobflow_profile_${email || 'default'}`;

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Profile cache read error:', e);
    }
    return {
      name: name || '',
      email: email || '',
      title: 'Senior Software Engineer',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      currentCompany: 'Innovatech Labs',
      experienceYears: '4+ Years',
      linkedinUrl: 'https://linkedin.com/in/tajinder-singh',
      githubUrl: 'https://github.com/tajinder102005',
      portfolioUrl: 'https://tajinder.dev',
      skills: 'Java, Spring Boot, React, PostgreSQL, Docker, Kubernetes, AWS',
      bio: 'Passionate full-stack engineer specialized in distributed systems, event-driven microservices architectures, and modern reactive user interfaces.',
    };
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (name && (!form.name || form.name === '')) {
      setForm((prev) => ({ ...prev, name }));
    }
    if (email && (!form.email || form.email === '')) {
      setForm((prev) => ({ ...prev, email }));
    }
  }, [name, email]);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(storageKey, JSON.stringify(form));
      setSaved(true);
      toast.success('Professional profile updated successfully!');
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile settings.');
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="#ffffff">
          Professional Profile & Identity
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal details, developer links, contact information, and career summary
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Quick Profile Card */}
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3.5, textAlign: 'center', position: 'sticky', top: 90 }}>
            <Avatar
              sx={{
                width: 96,
                height: 96,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontSize: 38,
                fontWeight: 800,
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.45)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {form.name ? form.name[0].toUpperCase() : 'U'}
            </Avatar>

            <Typography variant="h6" fontWeight={800} color="#ffffff">
              {form.name || 'User Profile'}
            </Typography>

            <Typography variant="body2" color="#818cf8" fontWeight={600} mt={0.25}>
              {form.title}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              {form.email}
            </Typography>

            <Box display="flex" justifyContent="center" gap={1} mb={2.5}>
              <Chip
                label={role || 'CANDIDATE'}
                size="small"
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  fontWeight: 700,
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              />
              <StatusBadge status={status || 'ACTIVE'} size="small" />
            </Box>

            {/* Social / Developer Links */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1.5}
              p={1.5}
              borderRadius="12px"
              bgcolor="rgba(255, 255, 255, 0.03)"
              border="1px solid rgba(255, 255, 255, 0.06)"
              mb={2.5}
            >
              {form.linkedinUrl && (
                <Tooltip title="View LinkedIn Profile">
                  <IconButton
                    component="a"
                    href={form.linkedinUrl.startsWith('http') ? form.linkedinUrl : `https://${form.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(10, 102, 194, 0.15)',
                      color: '#0a66c2',
                      border: '1px solid rgba(10, 102, 194, 0.3)',
                      '&:hover': { bgcolor: 'rgba(10, 102, 194, 0.3)' },
                    }}
                  >
                    <LinkedIn fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {form.githubUrl && (
                <Tooltip title="View GitHub Profile">
                  <IconButton
                    component="a"
                    href={form.githubUrl.startsWith('http') ? form.githubUrl : `https://${form.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' },
                    }}
                  >
                    <GitHub fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {form.portfolioUrl && (
                <Tooltip title="View Portfolio Website">
                  <IconButton
                    component="a"
                    href={form.portfolioUrl.startsWith('http') ? form.portfolioUrl : `https://${form.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(6, 182, 212, 0.15)',
                      color: '#06b6d4',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.3)' },
                    }}
                  >
                    <Language fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Clean Professional Metadata (No DB/Auth debugging text) */}
            <Box textAlign="left" display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">Candidate ID:</Typography>
                <Typography variant="caption" fontWeight={700} color="#f8fafc">#{userId || '1'}</Typography>
              </Box>
              {form.location && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">Location:</Typography>
                  <Typography variant="caption" fontWeight={600} color="#cbd5e1">{form.location}</Typography>
                </Box>
              )}
              {form.phone && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">Phone:</Typography>
                  <Typography variant="caption" fontWeight={600} color="#cbd5e1">{form.phone}</Typography>
                </Box>
              )}
              {form.experienceYears && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">Experience:</Typography>
                  <Typography variant="caption" fontWeight={600} color="#34d399">{form.experienceYears}</Typography>
                </Box>
              )}
            </Box>
          </GlassCard>
        </Grid>

        {/* Right Column: Editable Profile Information */}
        <Grid item xs={12} md={8}>
          <GlassCard sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} color="#ffffff" mb={1}>
              Profile Information & Professional Links
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Recruiters view this information when screening your applications and scheduling interview rounds.
            </Typography>

            <form onSubmit={handleSave}>
              <Grid container spacing={2.5}>
                {/* Basic Identity */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address (Account ID)"
                    fullWidth
                    disabled
                    value={form.email}
                    helperText="Primary email used for application notifications"
                  />
                </Grid>

                {/* Professional Headline & Experience */}
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Professional Headline / Current Role"
                    fullWidth
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer | Distributed Systems"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Experience"
                    fullWidth
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    placeholder="e.g. 5+ Years"
                  />
                </Grid>

                {/* Contact & Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location (City, Country)"
                    fullWidth
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA or Remote"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#06b6d4', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Standard Professional URLs */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="LinkedIn Profile URL"
                    fullWidth
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkedIn sx={{ color: '#0a66c2', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GitHub Profile URL"
                    fullWidth
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GitHub sx={{ color: '#e2e8f0', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Personal Website / Portfolio URL"
                    fullWidth
                    value={form.portfolioUrl}
                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.dev"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Language sx={{ color: '#38bdf8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Skills */}
                <Grid item xs={12}>
                  <TextField
                    label="Skills / Core Competencies"
                    fullWidth
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. Java, Spring Boot, React, Docker, Kubernetes, AWS"
                    helperText="Separate multiple skills with commas to improve recruiter search matching"
                  />
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <TextField
                    label="Professional Summary / Bio"
                    multiline
                    rows={4}
                    fullWidth
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Share your technical background, projects you're proud of, and what you're looking for in your next role..."
                  />
                </Grid>
              </Grid>

              {saved && (
                <Box
                  mt={3}
                  p={1.75}
                  borderRadius="10px"
                  bgcolor="rgba(16, 185, 129, 0.15)"
                  border="1px solid rgba(16, 185, 129, 0.3)"
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                >
                  <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" color="#6ee7b7" fontWeight={700}>
                    Profile preferences and professional links saved successfully!
                  </Typography>
                </Box>
              )}

              <Box display="flex" justifyContent="flex-end" mt={3.5}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ px: 4, py: 1.2, borderRadius: '10px', fontWeight: 700 }}
                >
                  Save Changes
                </Button>
              </Box>
            </form>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
