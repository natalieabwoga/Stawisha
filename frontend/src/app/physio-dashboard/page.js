'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, Button, Chip, Tabs, Tab, Stack, Avatar,
  Grid, CircularProgress, Divider, IconButton
} from '@mui/material';
import {
  AddCircleOutlined, SearchOutlined, RefreshOutlined, ChevronRight,
  AssignmentOutlined, PendingActionsOutlined, TaskAltOutlined
} from '@mui/icons-material';
import DashboardShell from '../../components/DashboardShell';
import { getReferrals, getCurrentUser } from '../../utils/api';

function StatCard({ icon, label, value, tint }) {
  return (
    <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: tint.bg, color: tint.color, width: 44, height: 44, borderRadius: '12px' }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>{label}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{value}</Typography>
        </Box>
      </Box>
    </Card>
  );
}

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

const TABS = ['active', 'pending', 'completed'];

export default function PhysioDashboard() {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const user = getCurrentUser();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReferrals();
      setReferrals(data?.referrals || []);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    active: referrals.filter((r) => ['accepted', 'in_progress'].includes(r.status)).length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
  };

  const filtered = referrals.filter((r) => {
    if (TABS[tab] === 'active') return ['accepted', 'in_progress'].includes(r.status);
    if (TABS[tab] === 'pending') return r.status === 'pending';
    return r.status === 'completed';
  });

  return (
    <DashboardShell role="physiotherapist">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            Clinician Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            {user?.firstName ? `Welcome back, Dr. ${user.firstName}.` : 'Manage your referrals and patient transfers.'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<SearchOutlined />}
            onClick={() => router.push('/provider-directory')}
            sx={{ borderColor: '#E5E7EB', color: '#111827', borderRadius: '8px', '&:hover': { borderColor: '#111827', backgroundColor: '#F9FAFB' } }}
          >
            Provider Directory
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlined />}
            onClick={() => router.push('/referrals/new')}
            sx={{ backgroundColor: '#111827', borderRadius: '8px', '&:hover': { backgroundColor: '#1F2937' } }}
          >
            New Referral
          </Button>
          <IconButton onClick={load} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<AssignmentOutlined />} label="Active Referrals" value={counts.active} tint={{ bg: '#EFF6FF', color: '#3B82F6' }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PendingActionsOutlined />} label="Pending Referrals" value={counts.pending} tint={{ bg: '#FFFBEB', color: '#F59E0B' }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<TaskAltOutlined />} label="Completed This Month" value={counts.completed} tint={{ bg: '#ECFDF5', color: '#10B981' }} />
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #F3F4F6' }}>
        <Box sx={{ borderBottom: '1px solid #F3F4F6', px: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#6B7280', minHeight: 48 },
              '& .Mui-selected': { color: '#111827 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#10B981', height: 3 },
            }}
          >
            <Tab label="Active" />
            <Tab label="Pending" />
            <Tab label="Completed" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#10B981' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 5 }}>
              No referrals in this category yet.
            </Typography>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: '#F3F4F6' }} />} spacing={0}>
              {filtered.map((r) => {
                const isReceiving = r.receiving_physio_id === user?.id;
                const counterpartName = isReceiving
                  ? `${r.referring_first_name || ''} ${r.referring_last_name || ''}`.trim()
                  : `${r.receiving_first_name || 'Unassigned'} ${r.receiving_last_name || ''}`.trim();

                return (
                  <Box
                    key={r.id}
                    onClick={() => router.push(`/referrals/${r.id}`)}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1.75, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' }, borderRadius: '8px', px: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#111827', width: 38, height: 38, fontSize: '0.8rem' }}>
                        {(r.patient_first_name?.[0] || '?')}{(r.patient_last_name?.[0] || '')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {r.patient_first_name} {r.patient_last_name} <Typography component="span" variant="caption" sx={{ color: '#9CA3AF' }}>REF{String(r.id).padStart(3, '0')}</Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {isReceiving ? 'From' : 'To'} {counterpartName || r.destination_location || '—'} · {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StatusChip status={r.status} />
                      <ChevronRight sx={{ color: '#D1D5DB' }} fontSize="small" />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Card>
    </DashboardShell>
  );
}
