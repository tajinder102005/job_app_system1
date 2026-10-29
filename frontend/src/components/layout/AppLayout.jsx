import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button,
  Badge,
  Popover,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Work,
  Business,
  Star,
  Person,
  Logout,
  Menu as MenuIcon,
  Bookmark,
  Assignment,
  PostAdd,
  CalendarMonth,
  Group,
  VerifiedUser,
  Security,
  Bolt,
  Home,
  Notifications,
  NotificationsNone,
  DoneAll,
  CheckCircleOutline,
  VideoCall,
  Launch,
  SmartToy,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/services';
import CustomDialog from '../common/CustomDialog';

const DRAWER_WIDTH = 260;

const NAV_CONFIG = {
  CANDIDATE: [
    { path: '/dashboard', label: 'Command Center', icon: <Dashboard /> },
    { path: '/jobs', label: 'Explore Jobs', icon: <Work /> },
    { path: '/my-applications', label: 'My Applications', icon: <Assignment /> },
    { path: '/saved-jobs', label: 'Saved Jobs', icon: <Bookmark /> },
    { path: '/companies', label: 'Companies', icon: <Business /> },
    { path: '/reviews', label: 'Reviews', icon: <Star /> },
    { path: '/profile', label: 'My Profile', icon: <Person /> },
  ],
  RECRUITER: [
    { path: '/dashboard', label: 'Talent Suite', icon: <Dashboard /> },
    { path: '/agentic-hiring', label: 'AI Hiring Hub', icon: <SmartToy /> },
    { path: '/my-jobs', label: 'Job Postings', icon: <PostAdd /> },
    { path: '/applications', label: 'Candidates', icon: <Assignment /> },
    { path: '/interviews', label: 'Interviews', icon: <CalendarMonth /> },
    { path: '/jobs', label: 'All Jobs', icon: <Work /> },
    { path: '/companies', label: 'Companies', icon: <Business /> },
    { path: '/profile', label: 'My Profile', icon: <Person /> },
  ],
  ADMIN: [
    { path: '/dashboard', label: 'Control Room', icon: <Dashboard /> },
    { path: '/agentic-hiring', label: 'AI Hiring Hub', icon: <SmartToy /> },
    { path: '/users', label: 'User Governance', icon: <Group /> },
    { path: '/company-verification', label: 'Verification', icon: <VerifiedUser /> },
    { path: '/audit-logs', label: 'Audit Logs', icon: <Security /> },
    { path: '/jobs', label: 'All Jobs', icon: <Work /> },
    { path: '/companies', label: 'Companies', icon: <Business /> },
    { path: '/profile', label: 'My Profile', icon: <Person /> },
  ],
};

const ROLE_COLORS = {
  CANDIDATE: { color: '#6366f1', label: 'Candidate' },
  RECRUITER: { color: '#10b981', label: 'Recruiter' },
  ADMIN: { color: '#f59e0b', label: 'Admin' },
};

export default function AppLayout() {
  const { role, name, email, logout, ROLES } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = async () => {
    if (!email) return;
    try {
      setLoadingNotifs(true);
      const res = await notificationsApi.getLogsByRecipient(email);
      const logs = res.data || [];
      setNotifications(logs);
      setUnreadCount(logs.filter((n) => !n.read).length);
    } catch (err) {
      console.warn('Notifications fetch error:', err.message);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [email]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!email) return;
    try {
      await notificationsApi.markAllAsRead(email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const currentRoleConfig = ROLE_COLORS[role] || ROLE_COLORS.CANDIDATE;
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.CANDIDATE;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0b1120' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Bolt sx={{ color: '#ffffff', fontSize: 22 }} />
        </Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" color="#ffffff">
          Job<span style={{ color: '#6366f1' }}>Flow</span>
        </Typography>
      </Box>

      {/* Role Tag */}
      <Box px={2.5} mb={2}>
        <Box
          p={1}
          borderRadius="8px"
          sx={{
            backgroundColor: `${currentRoleConfig.color}18`,
            border: `1px solid ${currentRoleConfig.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ color: currentRoleConfig.color, textTransform: 'uppercase' }}>
            {currentRoleConfig.label} Workspace
          </Typography>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: currentRoleConfig.color, boxShadow: `0 0 8px ${currentRoleConfig.color}` }} />
        </Box>
      </Box>

      {/* Nav List */}
      <List sx={{ flex: 1, px: 1.5 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '10px',
                mb: 0.75,
                py: 1,
                transition: 'all 0.15s ease',
                '&.Mui-selected': {
                  bgcolor: `${currentRoleConfig.color}22`,
                  border: `1px solid ${currentRoleConfig.color}44`,
                  '& .MuiListItemIcon-root': { color: currentRoleConfig.color },
                  '& .MuiListItemText-primary': { color: '#ffffff', fontWeight: 700 },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: selected ? currentRoleConfig.color : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box p={2} borderTop="1px solid rgba(255, 255, 255, 0.06)">
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<Home fontSize="small" />}
          onClick={() => navigate('/')}
          sx={{ mb: 1, borderRadius: '8px', fontSize: '0.8rem', color: 'text.secondary', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          Landing Page
        </Button>
        <Button
          fullWidth
          variant="text"
          size="small"
          color="error"
          startIcon={<Logout fontSize="small" />}
          onClick={logout}
          sx={{ borderRadius: '8px', fontSize: '0.8rem' }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16' }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(11, 17, 32, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' }, color: '#ffffff' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
              JobFlow <span style={{ color: 'text.secondary', fontWeight: 400 }}>/ {currentRoleConfig.label}</span>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            {/* Notification Bell Center */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => {
                  setNotifAnchorEl(e.currentTarget);
                  fetchNotifications();
                }}
                sx={{
                  color: unreadCount > 0 ? '#818cf8' : 'rgba(255, 255, 255, 0.7)',
                  bgcolor: unreadCount > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: unreadCount > 0 ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.2)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="primary"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#6366f1',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 10,
                      boxShadow: '0 0 10px rgba(99, 102, 241, 0.6)',
                    },
                  }}
                >
                  {unreadCount > 0 ? (
                    <Notifications sx={{ fontSize: 20, color: '#818cf8' }} />
                  ) : (
                    <NotificationsNone sx={{ fontSize: 20 }} />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Dropdown Popover */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  width: { xs: 320, sm: 390 },
                  maxHeight: 520,
                  bgcolor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  mt: 1.5,
                  overflow: 'hidden',
                },
              }}
            >
              {/* Popover Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  bgcolor: 'rgba(15, 23, 42, 0.95)',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="#ffffff">
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={`${unreadCount} new`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        fontWeight: 700,
                        height: 20,
                        fontSize: 11,
                      }}
                    />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAll sx={{ fontSize: 16 }} />}
                    onClick={handleMarkAllAsRead}
                    sx={{
                      color: '#94a3b8',
                      fontSize: 12,
                      textTransform: 'none',
                      '&:hover': { color: '#818cf8' },
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>

              {/* Notification Items List */}
              <Box sx={{ overflowY: 'auto', flex: 1, p: 1 }}>
                {loadingNotifs && notifications.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress size={26} sx={{ color: '#6366f1' }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box textAlign="center" py={6} px={3}>
                    <NotificationsNone sx={{ fontSize: 42, color: 'text.secondary', mb: 1, opacity: 0.4 }} />
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ opacity: 0.7, mt: 0.5 }}>
                      System and application updates will appear here
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      sx={{
                        p: 1.5,
                        mb: 0.8,
                        borderRadius: '10px',
                        bgcolor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                        border: notif.read ? '1px solid transparent' : '1px solid rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: notif.read ? 'rgba(255, 255, 255, 0.04)' : 'rgba(99, 102, 241, 0.14)',
                          borderColor: 'rgba(99, 102, 241, 0.4)',
                        },
                      }}
                      onClick={() => {
                        if (!notif.read) handleMarkAsRead(notif.id);
                        setSelectedNotif(notif);
                        setNotifAnchorEl(null);
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: notif.read ? 'transparent' : '#6366f1',
                          mt: 0.8,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={0.3}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={notif.read ? 600 : 700}
                            color={notif.read ? '#cbd5e1' : '#ffffff'}
                            noWrap
                          >
                            {notif.title || notif.subject || 'Notification'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, flexShrink: 0 }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (notif.sentAt ? new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: notif.read ? '#94a3b8' : '#e2e8f0',
                            fontSize: 12.5,
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {notif.message || notif.subject || 'New update on your account'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.8}>
                          <Chip
                            label={notif.type ? notif.type.replace(/_/g, ' ') : (notif.channel || 'IN_APP')}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9.5,
                              fontWeight: 600,
                              bgcolor: 'rgba(99, 102, 241, 0.12)',
                              color: '#a5b4fc',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                            }}
                          />
                          {!notif.read && (
                            <Tooltip title="Mark as read">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notif.id);
                                }}
                                sx={{ p: 0.2, color: '#6366f1', ml: 'auto' }}
                              >
                                <CheckCircleOutline sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Popover>

            <Chip
              label={`ROLE: ${role || 'CANDIDATE'}`}
              size="small"
              sx={{
                bgcolor: `${currentRoleConfig.color}22`,
                color: currentRoleConfig.color,
                fontWeight: 700,
                border: `1px solid ${currentRoleConfig.color}44`,
              }}
            />

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                cursor: 'pointer',
                p: 0.5,
                px: 1,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: currentRoleConfig.color,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {name ? name[0] : 'U'}
              </Avatar>
              <Typography variant="body2" fontWeight={600} color="#ffffff" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {name}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  minWidth: '180px',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                },
              }}
            >
              <Box px={2} py={1}>
                <Typography variant="body2" fontWeight={700} color="#ffffff">{name}</Typography>
                <Typography variant="caption" color="text.secondary">{email}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                <Person fontSize="small" sx={{ mr: 1.5, color: '#818cf8' }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/'); setAnchorEl(null); }}>
                <Home fontSize="small" sx={{ mr: 1.5, color: '#22d3ee' }} /> Landing Page
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={logout} sx={{ color: '#f43f5e' }}>
                <Logout fontSize="small" sx={{ mr: 1.5 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.08)' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.08)' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          mt: 8,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: '1440px',
          mx: 'auto',
        }}
      >
        <Outlet />
      </Box>

      {/* Full Notification Detail Dialog */}
      {selectedNotif && (
        <CustomDialog
          open={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          title={selectedNotif.title || selectedNotif.subject || 'Notification Details'}
          subtitle={
            selectedNotif.createdAt
              ? new Date(selectedNotif.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''
          }
          maxWidth="md"
        >
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Header Metadata Chips */}
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                label={selectedNotif.type ? selectedNotif.type.replace(/_/g, ' ') : 'NOTIFICATION'}
                size="small"
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                label={selectedNotif.channel || 'EMAIL & IN_APP'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                }}
              />
              {selectedNotif.status && (
                <Chip
                  label={selectedNotif.status}
                  size="small"
                  sx={{
                    bgcolor: selectedNotif.status === 'SENT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: selectedNotif.status === 'SENT' ? '#6ee7b7' : '#fda4af',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>

            {/* Video Meeting Callout if interview link is found */}
            {(() => {
              const fullText = `${selectedNotif.message || ''} ${selectedNotif.body || ''}`;
              const match = fullText.match(/https?:\/\/(meet\.jit\.si|meet\.google\.com|zoom\.us|teams\.microsoft\.com)[^\s"'>]+/i);
              if (match) {
                const meetingUrl = match[0];
                return (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: 'rgba(16, 185, 129, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VideoCall sx={{ color: '#34d399', fontSize: 26 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
                          Live Video Interview Room Ready
                        </Typography>
                        <Typography variant="caption" color="#cbd5e1">
                          Click below to launch your browser-based meeting (Jitsi / Meet)
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<Launch />}
                      sx={{
                        borderRadius: '10px',
                        px: 3,
                        fontWeight: 700,
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      Join Meeting Now
                    </Button>
                  </Box>
                );
              }
              return null;
            })()}

            {/* Message Body Content */}
            <Box
              sx={{
                p: 3,
                borderRadius: '14px',
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxHeight: '450px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
              }}
            >
              {selectedNotif.body ? (
                <Box
                  sx={{
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    '& a': { color: '#818cf8', textDecoration: 'underline' },
                    '& table': { width: '100% !important', maxWidth: '100% !important' },
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedNotif.body }}
                />
              ) : (
                <Typography variant="body1" color="#f8fafc" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {selectedNotif.message || selectedNotif.subject}
                </Typography>
              )}
            </Box>

            {/* Modal Actions */}
            <Box display="flex" justifyContent="flex-end" gap={1.5} pt={1}>
              {role === 'CANDIDATE' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedNotif(null);
                    navigate('/my-applications');
                  }}
                  sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  View My Applications
                </Button>
              )}
              {role === 'RECRUITER' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedNotif(null);
                    navigate('/applications');
                  }}
                  sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  View Candidates
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => setSelectedNotif(null)}
                sx={{ borderRadius: '10px', px: 3 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </CustomDialog>
      )}
    </Box>
  );
}
