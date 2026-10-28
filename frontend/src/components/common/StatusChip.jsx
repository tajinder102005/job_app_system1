import { Chip } from '@mui/material';
import { APPLICATION_STATUS } from '../../utils/auth';

export default function StatusChip({ status }) {
  const meta = APPLICATION_STATUS[status] || { label: status, color: 'default' };
  return <Chip label={meta.label} color={meta.color} size="small" variant="outlined" />;
}

export function RoleChip({ role }) {
  const colors = { CANDIDATE: 'primary', RECRUITER: 'success', ADMIN: 'warning' };
  return <Chip label={role} color={colors[role] || 'default'} size="small" />;
}
