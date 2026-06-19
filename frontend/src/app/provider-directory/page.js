'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, TextField, Button, MenuItem, InputAdornment,
  Avatar, Chip, Stack, CircularProgress, IconButton, Grid, Divider
} from '@mui/material';
import {
  SearchOutlined, VerifiedOutlined, LocationOnOutlined, ArrowBack,
  FilterListOutlined, PhoneOutlined, EmailOutlined
} from '@mui/icons-material';
import DashboardShell from '../../components/DashboardShell';
import { getProviders, getCurrentUser } from '../../utils/api';

export default function ProviderDirectoryPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProviders({ q, location, specialty });
      setProviders(data?.providers || []);
    } catch (err) {
      setError(err.message || 'Could not load the provider directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    search();
  };

  const availabilityStyle = (availability) => {
    if (availability === 'Limited') return { bg: '#FEF3C7', color: '#92400E' };
    if (availability === 'Unavailable') return { bg: '#FEE2E2', color: '#991B1B' };
    return { bg: '#ECFDF5', color: '#065F46' };
  };

  return (
    <DashboardShell role={user?.userType || 'physiotherapist'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => router.back()}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Provider Directory
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, ml: 5 }}>
        Search verified physiotherapists across Kenya to coordinate a patient's care transition.
      </Typography>

      <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, clinic, or speciality"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: '#9CA3AF' }} fontSize="small" /></InputAdornment>,
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                select
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                displayEmpty
                slotProps={{ select: { renderValue: (v) => v || 'Location' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="Nairobi">Nairobi</MenuItem>
                <MenuItem value="Mombasa">Mombasa</MenuItem>
                <MenuItem value="Kisumu">Kisumu</MenuItem>
                <MenuItem value="Nakuru">Nakuru</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<FilterListOutlined fontSize="small" />}
                sx={{ backgroundColor: '#111827', borderRadius: '8px', py: 0.85, '&:hover': { backgroundColor: '#1F2937' } }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 700, mb: 1.5 }}>
        Verified Physiotherapists {!loading && `(${providers.length})`}
      </Typography>

      <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #F3F4F6' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#10B981' }} />
          </Box>
        ) : providers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <SearchOutlined />
            </Avatar>
            <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>No matching providers found</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>Try a different location or specialty.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: '#F3F4F6' }} />}>
            {providers.map((p) => {
              const avail = availabilityStyle(p.availability);
              return (
                <Box
                  key={p.id}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' }, gap: 2, p: { xs: 2, sm: 2.5 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#111827', width: 48, height: 48, fontSize: '0.9rem', fontWeight: 700 }}>
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                          Dr. {p.first_name} {p.last_name}
                        </Typography>
                        <VerifiedOutlined sx={{ color: '#10B981', fontSize: 16 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {p.clinic}{p.location ? ` · ${p.location}` : ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        Specialty: {p.specialty || p.role || 'General Physiotherapy'} · License: {p.license_number}
                      </Typography>
                      <Box sx={{ mt: 0.75 }}>
                        <Chip size="small" label={p.availability || 'Available'} sx={{ backgroundColor: avail.bg, color: avail.color, fontWeight: 700, height: 22 }} />
                      </Box>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      size="small"
                      startIcon={<PhoneOutlined fontSize="small" />}
                      sx={{ color: '#6B7280', textTransform: 'none', display: { xs: 'none', md: 'inline-flex' } }}
                      href={`tel:${p.phone}`}
                    >
                      Call
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => router.push(`/referrals/new?providerId=${p.id}`)}
                      sx={{
                        backgroundColor: '#111827', borderRadius: '8px', flexGrow: { xs: 1, sm: 0 },
                        '&:hover': { backgroundColor: '#1F2937' },
                      }}
                    >
                      Select
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </DashboardShell>
  );
}
