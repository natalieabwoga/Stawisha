'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, TextField, Button, MenuItem, Alert,
  CircularProgress, IconButton, Grid
} from '@mui/material';
import { ArrowBack, FlightTakeoffOutlined } from '@mui/icons-material';
import DashboardShell from '../../../components/DashboardShell';
import { createTransferRequest } from '../../../utils/api';

export default function RequestReferralPage() {
  const router = useRouter();
  const [destinationLocation, setDestinationLocation] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!destinationLocation || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await createTransferRequest({ destinationLocation, reason, urgency });
      setSuccess('Your transfer request has been sent to your primary physiotherapist.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="patient">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => router.push('/dashboard')}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Request a Referral
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, ml: 5 }}>
        Tell us where you're headed — your physiotherapist will match you with a verified provider there.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '20px', border: '1px solid #F3F4F6' }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Destination Location<span style={{ color: '#EF4444' }}> *</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Mombasa, Kenya"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Reason for Transfer<span style={{ color: '#EF4444' }}> *</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={4}
                placeholder="e.g. Travelling for work for 6 weeks and need to continue my knee rehabilitation."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Urgency Level
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="urgent">Urgent — emergency travel</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#111827', color: 'white', py: 1.2, borderRadius: '8px',
                  fontWeight: 700, '&:hover': { backgroundColor: '#1F2937' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Submit Request'}
              </Button>
            </form>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ p: 3, borderRadius: '20px', backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', height: '100%' }}>
            <FlightTakeoffOutlined sx={{ color: '#10B981', fontSize: 32, mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#065F46', mb: 1 }}>
              What happens next?
            </Typography>
            <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
              Your primary physiotherapist will review your request, search the verified Provider Directory
              for your destination, and securely transfer your treatment history before you arrive. You'll
              get a notification the moment a provider is assigned.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
