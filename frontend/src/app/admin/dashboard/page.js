'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, Grid, CircularProgress, Divider, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Tooltip
} from '@mui/material';
import {
  PeopleOutlined, LocalHospitalOutlined, SyncAltOutlined, SettingsOutlined,
  DeleteOutlined, VisibilityOutlined
} from '@mui/icons-material';
import DashboardShell from '../../../components/DashboardShell';
import { getAdminStats, getAdminPatients, getAdminPhysios, getAdminReferrals, deleteAdminPatient, deleteAdminPhysio } from '../../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [physios, setPhysios] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, patientsData, physiosData, referralsData] = await Promise.all([
        getAdminStats(),
        getAdminPatients(),
        getAdminPhysios(),
        getAdminReferrals()
      ]);
      
      setStats(statsData.stats);
      setPatients(patientsData.patients);
      setPhysios(physiosData.physiotherapists);
      setReferrals(referralsData.referrals);
    } catch (err) {
      setError(err.message || 'Could not load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'patient') {
        await deleteAdminPatient(deleteModal.id);
      } else if (deleteModal.type === 'physio') {
        await deleteAdminPhysio(deleteModal.id);
      }
      setDeleteModal({ open: false, type: '', id: null, name: '' });
      await loadData(); // Reload stats and tables
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (type, id, name) => {
    setDeleteModal({ open: true, type, id, name });
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ backgroundColor: `${color}15`, p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>{title}</Typography>
        <Typography variant="h4" sx={{ color: '#111827', fontWeight: 800 }}>{value}</Typography>
      </Box>
    </Card>
  );

  return (
    <DashboardShell role="admin">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            Platform Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
            Monitor platform statistics and manage users.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<SettingsOutlined />}
          onClick={() => router.push('/admin/dashboard/settings')}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: '#374151', borderColor: '#D1D5DB' }}
        >
          Admin Settings
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* Stats Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Total Patients" 
                value={stats?.patients || 0} 
                icon={<PeopleOutlined sx={{ color: '#3B82F6' }} />} 
                color="#3B82F6" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Registered Physios" 
                value={stats?.physiotherapists || 0} 
                icon={<LocalHospitalOutlined sx={{ color: '#10B981' }} />} 
                color="#10B981" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Total Referrals" 
                value={stats?.referrals || 0} 
                icon={<SyncAltOutlined sx={{ color: '#8B5CF6' }} />} 
                color="#8B5CF6" 
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Referrals Table */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  All Referrals
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Assigned Physio</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Urgency</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#6B7280' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referrals.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>#{row.id}</TableCell>
                          <TableCell>{row.patient_first} {row.patient_last}</TableCell>
                          <TableCell>{row.physio_first ? `Dr. ${row.physio_first} ${row.physio_last}` : 'Pending'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.urgency} sx={{ textTransform: 'capitalize' }} />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={row.status} color={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'primary'} sx={{ textTransform: 'capitalize' }} />
                          </TableCell>
                          <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => router.push(`/admin/dashboard/referrals/${row.id}`)} sx={{ color: '#10B981' }}>
                                <VisibilityOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {referrals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#9CA3AF' }}>No referrals found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Patients Table */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F3F4F6', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  Patients
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Registered</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#6B7280' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patients.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.first_name} {row.last_name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete Patient">
                              <IconButton size="small" onClick={() => openDeleteModal('patient', row.id, `${row.first_name} ${row.last_name}`)} sx={{ color: '#EF4444' }}>
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Physios Table */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F3F4F6', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  Physiotherapists
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>License</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6B7280' }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#6B7280' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {physios.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>Dr. {row.first_name} {row.last_name}</TableCell>
                          <TableCell>{row.license_number}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.verification_status} color="success" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Delete Physiotherapist">
                              <IconButton size="small" onClick={() => openDeleteModal('physio', row.id, `Dr. ${row.first_name} ${row.last_name}`)} sx={{ color: '#EF4444' }}>
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, type: '', id: null, name: '' })}>
            <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the account for <strong>{deleteModal.name}</strong>? 
                This action cannot be undone and will cascade to related records.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDeleteModal({ open: false, type: '', id: null, name: '' })} color="inherit" sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Account'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </DashboardShell>
  );
}
