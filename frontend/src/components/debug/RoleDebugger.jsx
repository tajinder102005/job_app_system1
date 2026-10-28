import { useState } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import { getRole, ROLES } from '../../utils/auth';

export default function RoleDebugger() {
  const [currentRole, setCurrentRole] = useState(getRole());

  const setRole = (role) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', `Test ${role}`);
    localStorage.setItem('userEmail', `test@${role.toLowerCase()}.com`);
    localStorage.setItem('token', 'debug-token');
    localStorage.setItem('userId', '999');
    localStorage.setItem('userStatus', 'ACTIVE');
    setCurrentRole(role);
    window.location.reload(); // Force refresh
  };

  return (
    <Card sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Debug Role Switcher</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current: {currentRole || 'None'}
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Button 
            size="small" 
            variant={currentRole === ROLES.CANDIDATE ? 'contained' : 'outlined'}
            onClick={() => setRole(ROLES.CANDIDATE)}
          >
            Candidate
          </Button>
          <Button 
            size="small" 
            variant={currentRole === ROLES.RECRUITER ? 'contained' : 'outlined'}
            onClick={() => setRole(ROLES.RECRUITER)}
          >
            Recruiter
          </Button>
          <Button 
            size="small" 
            variant={currentRole === ROLES.ADMIN ? 'contained' : 'outlined'}
            onClick={() => setRole(ROLES.ADMIN)}
          >
            Admin
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}