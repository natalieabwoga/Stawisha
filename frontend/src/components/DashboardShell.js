'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  Divider, Badge, useMediaQuery, Chip, CircularProgress
} from '@mui/material';
import {
  DashboardOutlined, SearchOutlined, SwapHorizOutlined, NotificationsNoneOutlined,
  MenuOutlined, LogoutOutlined, PersonOutlined, AdminPanelSettingsOutlined,
  ChevronLeft
} from '@mui/icons-material';

const DRAWER_WIDTH = 248;

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = raw ? JSON.parse(raw) : null;
    
    // Safely extract role from JWT to gracefully handle legacy cached sessions
    if (user && token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.role) user.role = payload.role;
      } catch (e) {
        // ignore JWT parse errors
      }
    }
    return user;
  } catch {
    return null;
  }
}

async function getNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const res = await fetch('http://localhost:3001/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

async function markNotificationsRead() {
  const token = localStorage.getItem('token');
  if (!token) return;
  await fetch('http://localhost:3001/api/notifications/read', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export default function DashboardShell({ children, role = 'patient' }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const rawRole = (currentUser.role || currentUser.user_type || currentUser.userType || 'patient').toLowerCase();
    const isPatient = rawRole === 'patient';
    const isPhysiotherapist = rawRole === 'physiotherapist' || rawRole === 'physio';
    const isAdmin = rawRole === 'admin';

    // Strict Role-Based Routing
    if (isPhysiotherapist && (pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/admin/dashboard'))) {
      router.push('/physio-dashboard');
      return;
    }

    if (isPatient && (pathname.startsWith('/physio-dashboard') || pathname.startsWith('/admin/dashboard'))) {
      router.push('/dashboard');
      return;
    }
    
    if (isAdmin && !pathname.startsWith('/admin')) {
      router.push('/admin/dashboard');
      return;
    }

    setUser(currentUser);
    setIsAuthorized(true);
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [pathname, router]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotifClick = (e) => {
    setNotifAnchorEl(e.currentTarget);
    if (unreadCount > 0) markNotificationsRead().then(loadNotifications);
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <CircularProgress sx={{ color: '#10B981' }} />
      </Box>
    );
  }

  const normalizedRole = (user?.role || user?.user_type || user?.userType || 'patient').toLowerCase();
  const isPhysio = normalizedRole === 'physiotherapist' || normalizedRole === 'physio';
  const isAdmin = normalizedRole === 'admin';

  let navItems = [];
  if (isAdmin) {
    navItems = [
      { label: 'Admin Dashboard', href: '/admin/dashboard', icon: <AdminPanelSettingsOutlined /> }
    ];
  } else if (isPhysio) {
    navItems = [
      { label: 'Dashboard', href: '/physio-dashboard', icon: <DashboardOutlined /> },
      { label: 'Provider Directory', href: '/provider-directory', icon: <SearchOutlined /> },
      { label: 'Referrals', href: '/referrals', icon: <SwapHorizOutlined /> },
    ];
  } else {
    navItems = [
      { label: 'Dashboard', href: '/dashboard', icon: <DashboardOutlined /> },
      { label: 'My Referrals', href: '/referrals', icon: <SwapHorizOutlined /> },
      { label: 'Request Referral', href: '/dashboard/request-referral', icon: <SearchOutlined /> },
    ];
  }

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

  const userGender = (user?.gender || 'Male').toLowerCase();
  
  let imagePath = '';
  if (isAdmin) {
    imagePath = '/admin.png';
  } else if (isPhysio) {
    imagePath = userGender === 'female' ? '/FemalePhysiotherapist.png' : '/MalePhysiotherapist.png';
  } else {
    imagePath = userGender === 'female' ? '/FemalePatient.png' : '/MalePatient.png';
  }

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

      <Box sx={{ px: 2, mb: 1, display: 'flex', justifyContent: 'center' }}>
        <Box
          component="img"
          src={imagePath}
          alt={isPhysio ? "Physiotherapist" : "Patient"}
          sx={{ width: '100%', maxWidth: '200px', height: 'auto', objectFit: 'contain' }}
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

            <IconButton onClick={handleNotifClick} sx={{ color: '#6B7280' }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneOutlined />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>Notifications</Typography>
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem disabled>No notifications</MenuItem>
              ) : (
                notifications.map((n) => (
                  <MenuItem key={n.id} sx={{ whiteSpace: 'normal', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: n.is_read ? 400 : 600 }}>{n.message}</Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5 }}>{new Date(n.created_at).toLocaleString()}</Typography>
                  </MenuItem>
                ))
              )}
            </Menu>

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
              <MenuItem onClick={() => router.push(isPhysio ? '/physio-dashboard/settings' : '/dashboard/settings')} sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}>
                <LogoutOutlined fontSize="small" sx={{ mr: 1 }} /> Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, position: 'relative', overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
