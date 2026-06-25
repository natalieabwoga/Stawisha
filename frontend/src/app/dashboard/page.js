'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, Button, Chip, Stack, Avatar, Grid,
  LinearProgress, CircularProgress, Divider
} from '@mui/material';
import {
  AddCircleOutlined, LocationOnOutlined, PhoneOutlined, EmailOutlined,
  CheckCircle, RadioButtonUnchecked, FlightTakeoffOutlined, HistoryOutlined
} from '@mui/icons-material';
import DashboardShell from '../../components/DashboardShell';
import { getReferrals, getCurrentUser } from '../../utils/api';

const STAGES = ['pending', 'accepted', 'in_progress', 'completed'];
const STAGE_LABELS = {
  pending: 'Referral Submitted',
  accepted: 'Referral Accepted',
  in_progress: 'Treatment In Progress',
  completed: 'Care Completed',
};

function StatusChip({ status }) {
  const map = {
    draft: { bg: '#F3F4F6', color: '#374151', label: 'Draft' },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    accepted: { bg: '#DBEAFE', color: '#1E40AF', label: 'Accepted' },
    in_progress: { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
    completed: { bg: '#ECFDF5', color: '#065F46', label: 'Completed' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    expired: { bg: '#F3F4F6', color: '#6B7280', label: 'Expired' },
  };
  const s = map[status] || map.draft;
  return <Chip size="small" label={s.label} sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700 }} />;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    (async () => {
      try {
        const data = await getReferrals();
        setReferrals(data?.referrals || []);
      } catch (err) {
        setError(err.message || 'Could not load your referrals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = referrals.find((r) => ['pending', 'accepted', 'in_progress'].includes(r.status));
  const history = referrals.filter((r) => r.id !== active?.id);
  const activeStageIndex = active ? Math.max(STAGES.indexOf(active.status), 0) : -1;

  return (
    <DashboardShell role="patient">
      <Grid container spacing={3}>
        {/* Left Side: Header & Cards */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                Welcome back{user?.first_name ? `, ${user.first_name}` : ''}.
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                Here's where your care journey stands today.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlined />}
              onClick={() => router.push('/dashboard/request-referral')}
              sx={{
                backgroundColor: '#111827',
                py: 1.1,
                px: 2.5,
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#1F2937' },
              }}
            >
              Request a Referral
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #F3F4F6', height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
              My Demographics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Name</Typography>
                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>{user?.first_name} {user?.last_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Contact Info</Typography>
                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailOutlined sx={{ fontSize: 14, color: '#6B7280' }} /> {user?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <PhoneOutlined sx={{ fontSize: 14, color: '#6B7280' }} /> {user?.phone || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Location</Typography>
                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlined sx={{ fontSize: 14, color: '#6B7280' }} /> {user?.address || 'Address not provided'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

            <Grid item xs={12} md={7}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#10B981' }} />
            </Box>
          ) : (
            <>
              {/* Active referral tracker */}
          <Card elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '20px', border: '1px solid #F3F4F6', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: active ? 3 : 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightTakeoffOutlined sx={{ color: '#10B981' }} fontSize="small" /> Active Referral
              </Typography>
              {active && <StatusChip status={active.status} />}
            </Box>

            {!active ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <FlightTakeoffOutlined />
                </Avatar>
                <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600, mb: 0.5 }}>
                  No active referral right now
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2.5, maxWidth: 420, mx: 'auto' }}>
                  Travelling soon? Request a referral so your physiotherapist can connect you with a verified provider at your destination.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/dashboard/request-referral')}
                  sx={{ borderColor: '#10B981', color: '#065F46', borderRadius: '8px', '&:hover': { borderColor: '#059669', backgroundColor: '#ECFDF5' } }}
                >
                  Request a Referral
                </Button>
              </Box>
            ) : (
              <>
                {/* Stepper */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, overflowX: 'auto', py: 1 }}>
                  {STAGES.map((stage, i) => (
                    <Box key={stage} sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 110 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        {i <= activeStageIndex ? (
                          <CheckCircle sx={{ color: '#10B981', fontSize: 26 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#D1D5DB', fontSize: 26 }} />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5, textAlign: 'center', fontWeight: i <= activeStageIndex ? 700 : 500,
                            color: i <= activeStageIndex ? '#111827' : '#9CA3AF', fontSize: '0.7rem', px: 0.5,
                          }}
                        >
                          {STAGE_LABELS[stage]}
                        </Typography>
                      </Box>
                      {i < STAGES.length - 1 && (
                        <Box sx={{ height: 2, flex: 1, backgroundColor: i < activeStageIndex ? '#10B981' : '#E5E7EB', mb: 2.5 }} />
                      )}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ borderColor: '#F3F4F6', mb: 2.5 }} />

                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, letterSpacing: 0.5 }}>
                  ASSIGNED PHYSIOTHERAPIST
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Avatar sx={{ bgcolor: '#111827', width: 48, height: 48 }}>
                    {(active.receiving_first_name?.[0] || '?')}{(active.receiving_last_name?.[0] || '')}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827' }}>
                      {active.receiving_first_name ? `Dr. ${active.receiving_first_name} ${active.receiving_last_name}` : 'Awaiting assignment'}
                    </Typography>
                    {active.receiving_clinic && (
                      <Typography variant="body2" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlined sx={{ fontSize: 14 }} /> {active.receiving_clinic}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(`/referrals/${active.id}`)}
                  sx={{ mt: 2.5, borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', '&:hover': { borderColor: '#111827', backgroundColor: '#F9FAFB' } }}
                >
                  View Referral Details
                </Button>
              </>
            )}
          </Card>

          {/* Referral history */}
          <Card elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '20px', border: '1px solid #F3F4F6' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryOutlined sx={{ color: '#6B7280' }} fontSize="small" /> Referral History
            </Typography>

            {history.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 3 }}>
                Your past referrals will appear here.
              </Typography>
            ) : (
              <Stack divider={<Divider sx={{ borderColor: '#F3F4F6' }} />} spacing={1.5}>
                {history.map((r) => (
                  <Box
                    key={r.id}
                    onClick={() => router.push(`/referrals/${r.id}`)}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1, cursor: 'pointer', '&:hover': { opacity: 0.7 },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                        {r.receiving_first_name ? `Dr. ${r.receiving_first_name} ${r.receiving_last_name}` : 'Pending assignment'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {r.receiving_clinic || r.destination_location} · {new Date(r.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <StatusChip status={r.status} />
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </>
      )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
