'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, Typography, Card, Chip, Avatar, Grid,
  CircularProgress, Divider, Alert, IconButton, Tab, Tabs, Stack
} from '@mui/material';
import {
  ArrowBack, LocationOnOutlined, PhoneOutlined, EmailOutlined,
  AssignmentOutlined, FitnessCenterOutlined, InsertDriveFileOutlined,
  PersonOutlined, VerifiedOutlined, DownloadOutlined
} from '@mui/icons-material';
import DashboardShell from '../../../../../components/DashboardShell';
import { getReferralById, BASE_URL } from '../../../../../utils/api';

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
    <Chip
      size="small"
      label={s.label}
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.8rem', px: 0.5 }}
    />
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
      <Box sx={{ color: '#9CA3AF', mt: 0.2, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

function ClinicalSection({ icon, title, content }) {
  if (!content) return null;
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color: '#10B981' }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{title}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</Typography>
    </Box>
  );
}

export default function AdminReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [referral, setReferral] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await getReferralById(id);
          setReferral(data?.referral || null);
          if (data?.referral && (data.referral.diagnosis || data.referral.documents)) {
            setRecords([{
              diagnosis: data.referral.diagnosis,
              treatment_plan: data.referral.treatment_plan,
              exercise_protocol: data.referral.exercise_protocol,
              functional_assessment: data.referral.functional_assessment,
              pain_mapping: data.referral.pain_mapping,
              notes: data.referral.notes,
              documents: data.referral.documents,
              created_at: data.referral.record_created_at || data.referral.created_at
            }]);
          } else {
            setRecords([]);
          }
        } catch (err) {
          setError(err.message || 'Could not load this referral.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const record = records[0];
  const documentsList = record?.documents ? (typeof record.documents === 'string' ? JSON.parse(record.documents) : record.documents) : [];

  if (loading) {
    return (
      <DashboardShell role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      </DashboardShell>
    );
  }

  if (error && !referral) {
    return (
      <DashboardShell role="admin">
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => router.back()}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Referral Details
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, ml: 5 }}>
        Referral REF{String(id).padStart(3, '0')} · Submitted {referral ? new Date(referral.created_at).toLocaleDateString() : ''}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
              <PersonOutlined sx={{ color: '#9CA3AF', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>
                PATIENT
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#111827', width: 44, height: 44 }}>
                {referral?.patient_first_name?.[0]}{referral?.patient_last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {referral?.patient_first_name} {referral?.patient_last_name}
                </Typography>
                <StatusChip status={referral?.status} />
              </Box>
            </Box>
            <Divider sx={{ borderColor: '#F3F4F6', mb: 2 }} />
            <InfoRow icon={<EmailOutlined fontSize="small" />} label="Email" value={referral?.patient_email} />
            <InfoRow icon={<PhoneOutlined fontSize="small" />} label="Phone" value={referral?.patient_phone} />
            <InfoRow icon={<LocationOnOutlined fontSize="small" />} label="Address" value={referral?.patient_address} />
            <InfoRow icon={<PersonOutlined fontSize="small" />} label="Gender" value={referral?.patient_gender} />
            {referral?.urgency === 'urgent' && (
              <Chip size="small" label="⚡ Urgent" sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700, mt: 0.5 }} />
            )}
          </Card>

          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              RECEIVING PROVIDER
            </Typography>
            {referral?.receiving_first_name ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#111827', width: 38, height: 38, fontSize: '0.8rem' }}>
                    {referral.receiving_first_name?.[0]}{referral.receiving_last_name?.[0]}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                        Dr. {referral.receiving_first_name} {referral.receiving_last_name}
                      </Typography>
                      <VerifiedOutlined sx={{ color: '#10B981', fontSize: 15 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{referral?.receiving_clinic}</Typography>
                  </Box>
                </Box>
                <InfoRow icon={<PhoneOutlined fontSize="small" />} label="Phone" value={referral?.receiving_phone} />
                <InfoRow icon={<EmailOutlined fontSize="small" />} label="Email" value={referral?.receiving_email} />
              </>
            ) : (
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Not yet assigned</Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
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
                <Tab label="Clinical Summary" />
                <Tab label={`Documents (${documentsList.length})`} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
              {tab === 0 && (
                <>
                  {!record ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <AssignmentOutlined sx={{ color: '#D1D5DB', fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        No clinical records have been attached to this referral yet.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <ClinicalSection icon={<AssignmentOutlined fontSize="small" />} title="Primary Diagnosis" content={record.diagnosis} />
                      <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />
                      <ClinicalSection icon={<FitnessCenterOutlined fontSize="small" />} title="Treatment Plan" content={record.treatment_plan} />
                      {record.treatment_plan && <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />}
                      <ClinicalSection icon={<AssignmentOutlined fontSize="small" />} title="Progress Notes" content={record.notes} />
                    </>
                  )}
                  {referral?.reason && (
                    <Box sx={{ mt: 1, p: 2, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        REASON FOR REFERRAL
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#374151' }}>{referral.reason}</Typography>
                    </Box>
                  )}
                </>
              )}

              {tab === 1 && (
                <>
                  {documentsList.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <InsertDriveFileOutlined sx={{ color: '#D1D5DB', fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No documents attached.</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {documentsList.map((doc, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            p: 1.5, backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 36, height: 36, borderRadius: '8px' }}>
                              <InsertDriveFileOutlined fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                              {doc.name || `Document ${i + 1}`}
                            </Typography>
                          </Box>
                          <IconButton size="small" sx={{ color: '#3B82F6' }} component="a" href={`${BASE_URL}${doc.url}`} target="_blank" download={doc.name}>
                            <DownloadOutlined fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
