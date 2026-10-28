import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Bolt,
  Person,
  Groups,
  AdminPanelSettings,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/common/GlassCard';

export default function AuthPage() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('CANDIDATE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  });

  const handleQuickFill = (roleType) => {
    setSelectedRole(roleType);
    if (roleType === 'CANDIDATE') {
      setForm({ ...form, email: 'candidate@jobflow.com', password: 'Candidate@123' });
    } else if (roleType === 'RECRUITER') {
      setForm({ ...form, email: 'recruiter@stripe.com', password: 'Stripe@123' });
    } else if (roleType === 'ADMIN') {
      setForm({ ...form, email: 'admin@jobflow.com', password: 'Admin@123' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const res = await login({ email: form.email, password: form.password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
      }
    } else {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        requestedRole: selectedRole,
        companyName: selectedRole === 'RECRUITER' ? form.companyName : null,
      };
      const res = await register(payload);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <GlassCard
        glow
        sx={{
          maxWidth: '520px',
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Logo */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={3} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Bolt sx={{ color: '#ffffff', fontSize: 26 }} />
          </Box>
          <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em" color="#ffffff">
            Job<span style={{ color: '#6366f1' }}>Flow</span>
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={800} textAlign="center" color="#ffffff" mb={0.5}>
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          {mode === 'login'
            ? 'Sign in to access your role-tailored command dashboard'
            : 'Join thousands of engineers and companies worldwide'}
        </Typography>

        {/* 1-Click Demo Quick Fill Tabs */}
        <Box mb={3} p={1.5} borderRadius="12px" bgcolor="rgba(15, 23, 42, 0.8)" border="1px solid rgba(255, 255, 255, 0.06)">
          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1} textTransform="uppercase" letterSpacing="0.05em">
            ⚡ Quick-Fill Demo Credentials:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="small"
                variant={selectedRole === 'CANDIDATE' ? 'contained' : 'outlined'}
                onClick={() => handleQuickFill('CANDIDATE')}
                sx={{ fontSize: '0.75rem', py: 0.75, borderRadius: '8px' }}
              >
                Candidate
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="small"
                variant={selectedRole === 'RECRUITER' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => handleQuickFill('RECRUITER')}
                sx={{ fontSize: '0.75rem', py: 0.75, borderRadius: '8px' }}
              >
                Recruiter (Stripe)
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="small"
                variant={selectedRole === 'ADMIN' ? 'contained' : 'outlined'}
                onClick={() => handleQuickFill('ADMIN')}
                sx={{
                  fontSize: '0.75rem',
                  py: 0.75,
                  borderRadius: '8px',
                  bgcolor: selectedRole === 'ADMIN' ? '#f59e0b' : 'transparent',
                  color: selectedRole === 'ADMIN' ? '#ffffff' : '#fbbf24',
                  borderColor: '#f59e0b',
                  '&:hover': { bgcolor: '#d97706' },
                }}
              >
                Admin
              </Button>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            {mode === 'register' && (
              <>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  required
                />
                {selectedRole === 'RECRUITER' && (
                  <TextField
                    label="Company Name"
                    fullWidth
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. Google, Uber, Stripe"
                    required
                  />
                )}
              </>
            )}

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              required
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                mt: 1,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              }}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              sx={{ ml: 1, color: '#818cf8', fontWeight: 700 }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Button>
          </Typography>
        </Box>
      </GlassCard>
    </Box>
  );
}
