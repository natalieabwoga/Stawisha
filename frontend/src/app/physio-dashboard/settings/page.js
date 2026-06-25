'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Card, TextField, Button, Alert, CircularProgress, Grid, MenuItem } from '@mui/material';
import DashboardShell from '../../../components/DashboardShell';
import { getCurrentUser, updatePhysioProfile } from '../../../utils/api';

export default function PhysioSettingsPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    gender: '',
    role: '',
    clinic: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        license_number: user.license_number || '',
        gender: user.gender || '',
        role: user.role || '',
        clinic: user.clinic || '',
        location: user.location || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await updatePhysioProfile(formData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="physiotherapist">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          My Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Update your professional details and demographics here.
        </Typography>
      </Box>

      <Card elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '20px', border: '1px solid #F3F4F6', maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>First Name</Typography>
              <TextField fullWidth size="small" name="first_name" value={formData.first_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Last Name</Typography>
              <TextField fullWidth size="small" name="last_name" value={formData.last_name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Phone Number</Typography>
              <TextField fullWidth size="small" name="phone" value={formData.phone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Gender</Typography>
              <TextField select fullWidth size="small" name="gender" value={formData.gender} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>License Number</Typography>
              <TextField fullWidth size="small" name="license_number" value={formData.license_number} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Job Title/Role</Typography>
              <TextField fullWidth size="small" name="role" value={formData.role} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Clinic Name</Typography>
              <TextField fullWidth size="small" name="clinic" value={formData.clinic} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Location</Typography>
              <TextField fullWidth size="small" name="location" value={formData.location} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#111827', py: 1.2, px: 4, borderRadius: '8px', fontWeight: 700, '&:hover': { backgroundColor: '#1F2937' } }}>
              {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Card>
    </DashboardShell>
  );
}
