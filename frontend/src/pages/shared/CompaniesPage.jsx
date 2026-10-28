import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Business, Search, Star, LocationOn, OpenInNew, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import CustomDialog from '../../components/common/CustomDialog';

export default function CompaniesPage() {
  const { role, ROLES } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    industry: 'Technology',
  });

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll();
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await companiesApi.create(form);
      toast.success('Company added successfully!');
      setModalOpen(false);
      setForm({ name: '', description: '', location: '', website: '', industry: 'Technology' });
      loadCompanies();
    } catch (err) {
      console.error('Failed to create company:', err);
      toast.error('Error adding company.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = companies.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#ffffff">
            Verified Employers & Organizations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover top tech companies and review ratings
          </Typography>
        </Box>
        {(role === ROLES.RECRUITER || role === ROLES.ADMIN) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: '10px' }}
          >
            Register Organization
          </Button>
        )}
      </Box>

      <GlassCard sx={{ p: 2.5, mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by company name, industry, or headquarters location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: '#818cf8' }} />
              </InputAdornment>
            ),
          }}
        />
      </GlassCard>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} sx={{ color: '#6366f1' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">No companies found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((company) => (
            <Grid item xs={12} md={6} lg={4} key={company.id}>
              <GlassCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#ffffff">
                        {company.name}
                      </Typography>
                      <Chip
                        label={company.industry || 'Technology'}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
                      />
                    </Box>
                    <StatusBadge status={company.verified ? 'VERIFIED' : 'PENDING'} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" my={2} sx={{ lineHeight: 1.6 }}>
                    {company.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn sx={{ color: '#06b6d4', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        {company.location || 'HQ Location'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={700} color="#f8fafc">
                        {company.averageRating ? company.averageRating.toFixed(1) : '4.8'} ({company.reviewCount || 120} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid rgba(255, 255, 255, 0.06)">
                  <a
                    href={company.website?.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#818cf8', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Website <OpenInNew sx={{ fontSize: 12 }} />
                  </a>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/jobs?search=${encodeURIComponent(company.name)}`)}
                    sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
                  >
                    View Openings
                  </Button>
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Register Company Modal */}
      <CustomDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Organization"
        subtitle="Add company to the verified JobFlow directory"
      >
        <form onSubmit={handleCreateCompany}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Company Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Headquarters Location"
              fullWidth
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <TextField
              label="Website URL"
              fullWidth
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://company.com"
              required
            />
            <TextField
              label="Industry"
              fullWidth
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
            <TextField
              label="Description & Mission"
              multiline
              rows={3}
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setModalOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Company'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>
    </Box>
  );
}
