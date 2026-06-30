'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, Grid, TextField, Button, Avatar, Divider, Alert, CircularProgress } from '@mui/material';
import { SaveOutlined, SecurityOutlined, AdminPanelSettingsOutlined } from '@mui/icons-material';
import DashboardShell from '../../../../components/DashboardShell';
import { getCurrentUser } from '../../../../utils/api';

export default function AdminSettingsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return (
      <DashboardShell role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
          Admin Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Manage your administrator account details.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #F3F4F6', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: '#111827', color: '#fff', fontSize: '2rem' }}>
                <AdminPanelSettingsOutlined fontSize="large" />
              </Avatar>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Administrator
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              {user.email}
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#F3F4F6' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#10B981' }}>
              <SecurityOutlined fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>System Administrator</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '16px', border: '1px solid #F3F4F6' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Account Information
            </Typography>

            <Alert severity="info" sx={{ mb: 4, borderRadius: '8px' }}>
              Admin details are currently managed directly via the database for security reasons. Password changes can be requested from the database administrator.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>Email Address</Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  value={user.email}
                  disabled
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#F9FAFB' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>Role</Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  value="System Administrator"
                  disabled
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#F9FAFB' } }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </DashboardShell>
  );
}
