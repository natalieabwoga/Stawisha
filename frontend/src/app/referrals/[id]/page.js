'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, Typography, Card, Button, Chip, Avatar, Stack, Grid,
  CircularProgress, Divider, Alert, IconButton, LinearProgress, Tab, Tabs
} from '@mui/material';
import {
  ArrowBack, LocationOnOutlined, PhoneOutlined, EmailOutlined,
  AssignmentOutlined, FitnessCenterOutlined, InsertDriveFileOutlined,
  CheckCircleOutlined, CancelOutlined, PlayArrowOutlined, TaskAltOutlined,
  PersonOutlined, VerifiedOutlined, DownloadOutlined
} from '@mui/icons-material';
import DashboardShell from '../../../components/DashboardShell';
import { getReferralById, updateReferralStatus, getCurrentUser, BASE_URL } from '../../../utils/api';

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

export default function ReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const user = getCurrentUser();

  const [referral, setReferral] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const load = async () => {
    setLoading(true);
    setError('');
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
  };

  useEffect(() => {
    if (id) load();
  }, [id]); // eslint-disable-line

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus);
    setError('');
    try {
      await updateReferralStatus(id, newStatus);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading('');
    }
  };

  const isPhysio = !!user?.clinic || !!user?.license_number || user?.userType === 'physiotherapist' || user?.role === 'physiotherapist';
  const isPatient = !isPhysio;
  const isReceiving = referral && String(user?.id) === String(referral.receiving_physio_id);
  const isReferring = referral && String(user?.id) === String(referral.referring_physio_id);
  const isPatientOwner = referral && String(user?.id) === String(referral.patient_id);

  const record = records[0]; // most recent clinical record
  const documentsList = record?.documents ? (typeof record.documents === 'string' ? JSON.parse(record.documents) : record.documents) : [];

  if (loading) {
    return (
      <DashboardShell role={user?.userType || 'physiotherapist'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      </DashboardShell>
    );
  }

  if (error && !referral) {
    return (
      <DashboardShell role={user?.userType || 'physiotherapist'}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={user?.userType || 'physiotherapist'}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={() => router.back()}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Clinical Record Transfer View
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, ml: 5 }}>
        Referral REF{String(id).padStart(3, '0')} · Submitted {referral ? new Date(referral.created_at).toLocaleDateString() : ''}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

      {referral?.status === 'accepted' && isReceiving && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlined />}
          sx={{ mb: 3, borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#065F46', '& .MuiAlert-icon': { color: '#10B981' } }}
        >
          Your referral has been accepted. Please review the patient's clinical history below before the first in-person session.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* LEFT: Patient + Parties info */}
        <Grid item xs={12} md={4}>
          {/* Patient card */}
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
            <InfoRow icon={<LocationOnOutlined fontSize="small" />} label="Destination" value={referral?.destination_location} />
            <InfoRow icon={<LocationOnOutlined fontSize="small" />} label="Address" value={referral?.patient_address} />
            <InfoRow icon={<PersonOutlined fontSize="small" />} label="Gender" value={referral?.patient_gender} />
            {referral?.patient_dob && <InfoRow icon={<PersonOutlined fontSize="small" />} label="DOB" value={new Date(referral.patient_dob).toLocaleDateString()} />}
            {referral?.urgency === 'urgent' && (
              <Chip
                size="small"
                label="⚡ Urgent"
                sx={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 700, mt: 0.5 }}
              />
            )}
          </Card>

          {/* Referring physio */}
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              REFERRING PROVIDER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#F3F4F6', color: '#374151', width: 38, height: 38, fontSize: '0.8rem' }}>
                {referral?.referring_first_name?.[0]}{referral?.referring_last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {referral?.referring_first_name
                    ? `Dr. ${referral.referring_first_name} ${referral.referring_last_name}`
                    : 'Not assigned'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{referral?.referring_clinic}</Typography>
              </Box>
            </Box>
          </Card>

          {/* Receiving physio */}
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

          {/* Patient Action buttons removed as referrals go directly to clinic */}

          {/* Action buttons */}
          {isPhysio && referral?.status === 'pending' && isReceiving && (
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
                Review Referral
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                Do you have the capacity to accept this patient for treatment?
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={actionLoading === 'accepted' ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleOutlined />}
                  onClick={() => handleStatusChange('accepted')}
                  disabled={!!actionLoading}
                  sx={{ backgroundColor: '#10B981', borderRadius: '8px', fontWeight: 700, '&:hover': { backgroundColor: '#059669' } }}
                >
                  Accept Referral
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={actionLoading === 'rejected' ? <CircularProgress size={16} sx={{ color: '#EF4444' }} /> : <CancelOutlined />}
                  onClick={() => handleStatusChange('rejected')}
                  disabled={!!actionLoading}
                  sx={{ borderColor: '#FCA5A5', color: '#EF4444', borderRadius: '8px', fontWeight: 700, '&:hover': { borderColor: '#EF4444', backgroundColor: '#FEF2F2' } }}
                >
                  Decline Referral
                </Button>
              </Stack>
            </Card>
          )}

          {isPhysio && referral?.status === 'accepted' && isReceiving && (
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6', mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5 }}>
                Start Treatment
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={actionLoading === 'in_progress' ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlayArrowOutlined />}
                onClick={() => handleStatusChange('in_progress')}
                disabled={!!actionLoading}
                sx={{ backgroundColor: '#3B82F6', borderRadius: '8px', fontWeight: 700, '&:hover': { backgroundColor: '#2563EB' } }}
              >
                Mark In Progress
              </Button>
            </Card>
          )}

          {isPhysio && referral?.status === 'in_progress' && isReceiving && (
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #F3F4F6' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={actionLoading === 'completed' ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <TaskAltOutlined />}
                onClick={() => handleStatusChange('completed')}
                disabled={!!actionLoading}
                sx={{ backgroundColor: '#111827', borderRadius: '8px', fontWeight: 700, '&:hover': { backgroundColor: '#1F2937' } }}
              >
                Mark Care Complete
              </Button>
            </Card>
          )}
        </Grid>

        {/* RIGHT: Clinical record + documents */}
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
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                          Record added {new Date(record.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <ClinicalSection
                        icon={<AssignmentOutlined fontSize="small" />}
                        title="Primary Diagnosis"
                        content={record.diagnosis}
                      />
                      <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />

                      <ClinicalSection
                        icon={<FitnessCenterOutlined fontSize="small" />}
                        title="Current Treatment Plan"
                        content={record.treatment_plan}
                      />
                      {record.treatment_plan && <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />}

                      <ClinicalSection
                        icon={<FitnessCenterOutlined fontSize="small" />}
                        title="Exercise Protocol"
                        content={record.exercise_protocol}
                      />
                      {record.exercise_protocol && <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />}

                      <ClinicalSection
                        icon={<AssignmentOutlined fontSize="small" />}
                        title="Functional Assessment Scores"
                        content={record.functional_assessment}
                      />
                      {record.functional_assessment && <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />}

                      <ClinicalSection
                        icon={<AssignmentOutlined fontSize="small" />}
                        title="Pain Mapping"
                        content={record.pain_mapping}
                      />
                      {record.pain_mapping && <Divider sx={{ borderColor: '#F3F4F6', mb: 3 }} />}

                      <ClinicalSection
                        icon={<AssignmentOutlined fontSize="small" />}
                        title="Progress Notes"
                        content={record.notes}
                      />

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
                </>
              )}

              {tab === 1 && (
                <>
                  {documentsList.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <InsertDriveFileOutlined sx={{ color: '#D1D5DB', fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        No documents have been attached to this referral.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {documentsList.map((doc, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            p: 1.5, backgroundColor: '#F9FAFB', borderRadius: '10px',
                            border: '1px solid #F3F4F6',
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
                          <IconButton 
                            size="small" 
                            sx={{ color: '#3B82F6' }}
                            component="a"
                            href={`${BASE_URL}${doc.url}`}
                            target="_blank"
                            download={doc.name}
                          >
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
