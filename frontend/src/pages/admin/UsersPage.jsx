import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person,
  AdminPanelSettings,
  Groups,
  Delete,
  CheckCircle,
  Block,
  MoreVert,
} from '@mui/icons-material';
import { adminApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSuspend = async (userId) => {
    try {
      await adminApi.suspendUser(userId);
      toast.warning('User account suspended.');
      loadUsers();
    } catch (err) {
      console.error('Suspend failed:', err);
      toast.error('Failed to suspend user.');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminApi.activateUser(userId);
      toast.success('User account activated successfully.');
      loadUsers();
    } catch (err) {
      console.error('Activate failed:', err);
      toast.error('Failed to activate user.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully.');
      loadUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
      toast.error('Failed to delete user.');
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Full Name',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700} color="#ffffff">
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            UID: #{row.id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email Address',
      render: (row) => (
        <Typography variant="body2" color="#818cf8">
          {row.email}
        </Typography>
      ),
    },
    {
      id: 'role',
      label: 'Assigned Role',
      render: (row) => (
        <Chip
          label={row.role || 'CANDIDATE'}
          size="small"
          sx={{
            bgcolor:
              row.role === 'ADMIN'
                ? 'rgba(245, 158, 11, 0.15)'
                : row.role === 'RECRUITER'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(99, 102, 241, 0.15)',
            color:
              row.role === 'ADMIN'
                ? '#fbbf24'
                : row.role === 'RECRUITER'
                ? '#34d399'
                : '#818cf8',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Account Status',
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} size="small" />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        const isSuspended = row.status === 'SUSPENDED';
        return (
          <Box display="flex" justifyContent="flex-end" gap={1}>
            {isSuspended ? (
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => handleActivate(row.id)}
                startIcon={<CheckCircle />}
                sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
              >
                Activate
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => handleSuspend(row.id)}
                startIcon={<Block />}
                sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
              >
                Suspend
              </Button>
            )}
            <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#f43f5e' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="#ffffff">
          User Management & RBAC Controls
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Audit user registrations, toggle account suspensions, and manage system privileges
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name, email, or role..."
        searchField="email"
        emptyMessage="No users found in database."
      />
    </Box>
  );
}
