'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  Divider, Badge, useMediaQuery, Chip
} from '@mui/material';
import {
  DashboardOutlined, SearchOutlined, SwapHorizOutlined, NotificationsNoneOutlined,
  MenuOutlined, LogoutOutlined, PersonOutline, AdminPanelSettingsOutlined,
  ChevronLeft
} from '@mui/icons-material';

const DRAWER_WIDTH = 248;

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DashboardShell({ children, role = 'patient' }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const isPhysio = role === 'physiotherapist';

  const navItems = isPhysio
    ? [
        { label: 'Dashboard', href: '/physio-dashboard', icon: <DashboardOutlined /> },
        { label: 'Provider Directory', href: '/provider-directory', icon: <SearchOutlined /> },
        { label: 'Referrals', href: '/referrals', icon: <SwapHorizOutlined /> },
      ]
    : [
        { label: 'Dashboard', href: '/dashboard', icon: <DashboardOutlined /> },
        { label: 'My Referrals', href: '/referrals', icon: <SwapHorizOutlined /> },
        { label: 'Request Referral', href: '/dashboard/request-referral', icon: <SearchOutlined /> },
      ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const initials = user
    ? `${(user.firstName || user.first_name || '?')[0] || ''}${(user.lastName || user.last_name || '')[0] || ''}`.toUpperCase()
    : '??';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'center', px: 2, py: 2.5 }}>
        <Box
          component="img"
          src="/StawishaLogo.png"
          alt="Stawisha Logo"
          sx={{ height: '46px', objectFit: 'contain', cursor: 'pointer' }}
          onClick={() => router.push('/')}
        />
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 2, mb: 1 }}>
        <Chip
          size="small"
          icon={isPhysio ? <AdminPanelSettingsOutlined sx={{ fontSize: 16 }} /> : <PersonOutline sx={{ fontSize: 16 }} />}
          label={isPhysio ? 'Physiotherapist' : 'Patient'}
          sx={{
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '0.7rem',
            width: '100%',
          }}
        />
      </Box>

      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                py: 1,
                color: active ? '#FFFFFF' : '#374151',
                backgroundColor: active ? '#111827' : 'transparent',
                '&:hover': {
                  backgroundColor: active ? '#1F2937' : '#F3F4F6',
                },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#FFFFFF' : '#6B7280', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#F3F4F6' }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: '10px', color: '#6B7280', '&:hover': { backgroundColor: '#FEF2F2', color: '#EF4444' } }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: '1px solid #F3F4F6',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main column */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#111827',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: '#111827' }}>
                <MenuOutlined />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />

            <IconButton sx={{ color: '#6B7280' }}>
              <Badge variant="dot" color="error">
                <NotificationsNoneOutlined />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 36, height: 36, backgroundColor: '#111827', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Welcome' : 'Welcome'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}>
                <LogoutOutlined fontSize="small" sx={{ mr: 1 }} /> Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
