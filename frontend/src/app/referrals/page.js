'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, Tabs, Tab, Stack, Avatar, Chip,
  CircularProgress, Divider, Button
} from '@mui/material';
import { AddCircleOutline, ChevronRight, SwapHorizOutlined } from '@mui/icons-material';
import DashboardShell from '../../components/DashboardShell';
import { getReferrals, getCurrentUser } from '../../utils/api';

function StatusChip({ status }) {
  const map = {
    draft:       { bg: '#F3F4F6', color: '#374151', label: 'Draft' },
    pending:     { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    accepted:    { bg: '#DBEAFE', color: '#1E40AF', label: 'Accepted' },
    in_progress: { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
    completed:   { bg: '#ECFDF5', color: '#065F46', label: 'Completed' },
    rejected:    { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    expired:     { bg: '#F3F4F6', color: '#6B7280', label: 'Expired' },
  };
  const s = map[status] || map.draft;
  return (
    <Chip size="small" label={s.label} sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700 }} />
  );
}

const TABS = [
  { label: 'All',         filter: () => true },
  { label: 'Pending',     filter: (r) => r.status === 'pending' },
  { label: 'Active',      filter: (r) => ['accepted', 'in_progress'].includes(r.status) },
  { label: 'Completed',   filter: (r) => r.status === 'completed' },
];

export default function ReferralsPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const isPhysio = user?.userType === 'physiotherapist';

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReferrals();
        setReferrals(data?.referrals || []);
      } catch {
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = referrals.filter(TABS[tab].filter);

  return (
    <DashboardShell role={user?.userType || 'physiotherapist'}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            {isPhysio ? 'Referrals' : 'My Referrals'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            {isPhysio
              ? 'All patient transfers you are involved in.'
              : 'Track all your care transitions in one place.'}
          </Typography>
        </Box>
        {isPhysio && (
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => router.push('/referrals/new')}
            sx={{ backgroundColor: '#111827', borderRadius: '8px', '&:hover': { backgroundColor: '#1F2937' } }}
          >
            New Referral
          </Button>
        )}
        {!isPhysio && (
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => router.push('/dashboard/request-referral')}
            sx={{ backgroundColor: '#111827', borderRadius: '8px', '&:hover': { backgroundColor: '#1F2937' } }}
          >
            Request a Referral
          </Button>
        )}
      </Box>

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
            {TABS.map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#10B981' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 7 }}>
              <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <SwapHorizOutlined />
              </Avatar>
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600 }}>
                No referrals here yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                {isPhysio ? 'Create a new referral to get started.' : 'Request a referral to begin a care transfer.'}
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: '#F3F4F6' }} />} spacing={0}>
              {filtered.map((r) => {
                const nameLabel = isPhysio
                  ? `${r.patient_first_name || ''} ${r.patient_last_name || ''}`.trim()
                  : (r.receiving_first_name
                      ? `Dr. ${r.receiving_first_name} ${r.receiving_last_name}`
                      : 'Awaiting assignment');
                const subLabel = isPhysio
                  ? r.destination_location || r.receiving_clinic || '—'
                  : r.receiving_clinic || r.destination_location || '—';

                return (
                  <Box
                    key={r.id}
                    onClick={() => router.push(`/referrals/${r.id}`)}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1.75, px: 1, cursor: 'pointer', borderRadius: '8px',
                      '&:hover': { backgroundColor: '#F9FAFB' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{ bgcolor: '#111827', width: 40, height: 40, fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        {nameLabel[0] || '?'}{nameLabel.split(' ')[1]?.[0] || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          {nameLabel}{' '}
                          <Typography component="span" variant="caption" sx={{ color: '#9CA3AF' }}>
                            REF{String(r.id).padStart(3, '0')}
                          </Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {subLabel} · {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={r.status} />
                      <ChevronRight sx={{ color: '#D1D5DB' }} fontSize="small" />
                    </Box>
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
