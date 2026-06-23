'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Typography, Card, TextField, Button, MenuItem, Alert,
  CircularProgress, IconButton, Grid, Divider, Chip, LinearProgress, Stack
} from '@mui/material';
import {
  ArrowBack, CloudUploadOutlined, InsertDriveFileOutlined, Close
} from '@mui/icons-material';
import DashboardShell from '../../../components/DashboardShell';
import { createReferral } from '../../../utils/api';

function NewReferralForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetProviderId = searchParams.get('providerId');

  const [patientId, setPatientId] = useState('');
  const [receivingPhysioId, setReceivingPhysioId] = useState(presetProviderId || '');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [exerciseProtocol, setExerciseProtocol] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected.map((f) => f.name)]);
  };

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f !== name));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId || !receivingPhysioId) {
      setError('Please select a patient and a receiving physiotherapist.');
      return;
    }

    setLoading(true);
    try {
      await createReferral({
        patientId: Number(patientId),
        receivingPhysioId: Number(receivingPhysioId),
        destinationLocation,
        reason,
        diagnosis,
        treatmentPlan,
        exerciseProtocol,
        documents: files,
      });
      setSuccess('Referral submitted. The receiving physiotherapist has been notified.');
      setTimeout(() => router.push('/physio-dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="physiotherapist">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => router.back()}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Referral Submission Form
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, ml: 5 }}>
        Please complete all required fields and attach relevant clinical documents.
      </Typography>

      <Card elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '20px', border: '1px solid #F3F4F6', maxWidth: 760 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
            Patient Demographics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Patient ID<span style={{ color: '#EF4444' }}> *</span>
              </Typography>
              <TextField
                fullWidth size="small" placeholder="Existing patient ID"
                value={patientId} onChange={(e) => setPatientId(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Receiving Physiotherapist ID<span style={{ color: '#EF4444' }}> *</span>
              </Typography>
              <TextField
                fullWidth size="small" placeholder="From Provider Directory"
                value={receivingPhysioId} onChange={(e) => setReceivingPhysioId(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
              <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                Tip: select a provider from the <Box component="span" onClick={() => router.push('/provider-directory')} sx={{ color: '#10B981', fontWeight: 600, cursor: 'pointer' }}>Provider Directory</Box> to auto-fill this.
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
            Destination Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Destination Location
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Mombasa, Kenya"
                value={destinationLocation} onChange={(e) => setDestinationLocation(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Reason for Referral
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Continuing ACL rehab while travelling"
                value={reason} onChange={(e) => setReason(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
            Clinical Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Primary Diagnosis
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Chronic Lower Back Pain"
                value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Current Treatment Plan
              </Typography>
              <TextField
                fullWidth size="small" placeholder="e.g. Manual therapy, twice weekly"
                value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>
                Exercise Protocol / Referral Notes
              </Typography>
              <TextField
                fullWidth size="small" multiline rows={3}
                placeholder="Describe the current exercise protocol, range of motion measurements, or any notes for the receiving physiotherapist."
                value={exerciseProtocol} onChange={(e) => setExerciseProtocol(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
            Clinical Documents
          </Typography>
          <Box
            component="label"
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed #E5E7EB', borderRadius: '12px', p: 4, cursor: 'pointer',
              backgroundColor: '#F9FAFB', mb: files.length ? 2 : 3,
              '&:hover': { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
            }}
          >
            <input type="file" hidden multiple onChange={handleFileSelect} />
            <CloudUploadOutlined sx={{ color: '#9CA3AF', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600 }}>Upload Clinical Records</Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', textAlign: 'center', mt: 0.5 }}>
              Treatment histories, X-rays, exercise protocols, assessment scores, diagnostic imaging
            </Typography>
          </Box>

          {files.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((f) => (
                <Chip
                  key={f}
                  icon={<InsertDriveFileOutlined sx={{ fontSize: 16 }} />}
                  label={f}
                  onDelete={() => removeFile(f)}
                  deleteIcon={<Close sx={{ fontSize: 14 }} />}
                  sx={{ backgroundColor: '#F3F4F6', color: '#374151', fontWeight: 500 }}
                />
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ backgroundColor: '#111827', borderRadius: '8px', px: 3, '&:hover': { backgroundColor: '#1F2937' } }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Submit Referral'}
            </Button>
          </Stack>
        </form>
      </Card>
    </DashboardShell>
  );
}

export default function NewReferralPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinearProgress sx={{ width: '50%' }} /></Box>}>
      <NewReferralForm />
    </Suspense>
  );
}
