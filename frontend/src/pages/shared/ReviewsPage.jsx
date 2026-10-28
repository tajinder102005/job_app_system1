import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Star, RateReview, Business } from '@mui/icons-material';
import { companiesApi, reviewsApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import CustomDialog from '../../components/common/CustomDialog';

export default function ReviewsPage() {
  const { name, role, ROLES } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    rating: 5,
    companyId: 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [compsRes, reviewsRes] = await Promise.allSettled([
        companiesApi.getAll(),
        reviewsApi.getByCompany(1),
      ]);
      if (compsRes.status === 'fulfilled') setCompanies(compsRes.value.data || []);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!form.companyId) {
      toast.error('Please select a company to review.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        companyId: Number(form.companyId),
        title: form.title.trim(),
        description: form.description.trim(),
        reviewText: `${form.title ? form.title + ' - ' : ''}${form.description}`,
        rating: Number(form.rating) || 5,
        reviewerName: name || 'Tajinder',
        reviewerEmail: email || 'tajinder.swe@gmail.com',
      };
      await reviewsApi.create(payload);
      toast.success('Review posted successfully!');
      setModalOpen(false);
      setForm({ title: '', description: '', rating: 5, companyId: companies[0]?.id || 1 });
      loadData();
    } catch (err) {
      console.error('Error adding review:', err);
      toast.error(err.response?.data?.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#ffffff">
            Company Culture & Reviews
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verified workplace insights, culture ratings, and compensation transparency
          </Typography>
        </Box>
        {role === ROLES.CANDIDATE && (
          <Button
            variant="contained"
            startIcon={<RateReview />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: '10px' }}
          >
            Write a Review
          </Button>
        )}
      </Box>

      {/* Featured Company Culture Cards */}
      <Grid container spacing={3}>
        {companies.map((comp) => (
          <Grid item xs={12} md={6} key={comp.id}>
            <GlassCard sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#ffffff">
                    {comp.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comp.industry} • {comp.location}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} p={0.75} borderRadius="8px" bgcolor="rgba(245, 158, 11, 0.15)">
                  <Star sx={{ color: '#fbbf24', fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={800} color="#fbbf24">
                    {comp.averageRating ? comp.averageRating.toFixed(1) : '4.8'}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                {comp.description}
              </Typography>

              <Box p={2} borderRadius="10px" bgcolor="rgba(15, 23, 42, 0.6)" border="1px solid rgba(255, 255, 255, 0.05)">
                <Rating value={comp.averageRating || 5} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="#f8fafc" fontWeight={600} mt={0.5}>
                  "Exceptional engineering culture with state-of-the-art tooling and supportive mentorship."
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  — Verified Senior Engineer
                </Typography>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Write Review Modal */}
      <CustomDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Share Your Workplace Review"
        subtitle="Help engineering peers understand the company culture"
      >
        <form onSubmit={handleAddReview}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Autocomplete
              options={companies}
              getOptionLabel={(option) => option.name || ''}
              value={companies.find((c) => c.id === form.companyId) || null}
              onChange={(event, newValue) => {
                setForm({ ...form, companyId: newValue ? newValue.id : '' });
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search & Select Company"
                  placeholder="Type to search (e.g. Stripe, Google, Microsoft)..."
                  required={!form.companyId}
                  helperText="Search by name instantly without scrolling through long lists"
                />
              )}
              PaperComponent={({ children, ...props }) => (
                <Paper
                  {...props}
                  sx={{
                    bgcolor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    '& .MuiAutocomplete-option': {
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' },
                      '&[aria-selected="true"]': { bgcolor: 'rgba(99, 102, 241, 0.25)' },
                    },
                  }}
                >
                  {children}
                </Paper>
              )}
            />
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Overall Rating
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#fbbf24' }}>
                  {form.rating} / 5 Stars
                </Typography>
              </Box>
              <Rating
                value={Number(form.rating) || 5}
                precision={0.5}
                onChange={(e, val) => setForm({ ...form, rating: val || 5 })}
                size="large"
              />
            </Box>
            <TextField
              label="Review Headline"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Inspiring team, great engineering autonomy"
              required
            />
            <TextField
              label="Review Details"
              multiline
              rows={4}
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Share details about work-life balance, leadership, compensation, and tech stack..."
              required
            />
            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
              <Button variant="text" onClick={() => setModalOpen(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Post Review'}
              </Button>
            </Box>
          </Box>
        </form>
      </CustomDialog>
    </Box>
  );
}
