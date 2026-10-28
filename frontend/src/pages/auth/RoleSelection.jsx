import React, { useState } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, Box, Avatar } from '@mui/material';
import { Person, Business, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { setRole, ROLES } from '../../utils/auth';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setRole(role);
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  const roles = [
    {
      id: ROLES.CANDIDATE,
      title: 'Candidate',
      description: 'Search for jobs, apply to positions, and track your applications',
      icon: <Person sx={{ fontSize: 60 }} />,
      color: '#1976d2'
    },
    {
      id: ROLES.RECRUITER,
      title: 'Recruiter',
      description: 'Post jobs, manage applications, and review candidates',
      icon: <Business sx={{ fontSize: 60 }} />,
      color: '#2e7d32'
    },
    {
      id: ROLES.ADMIN,
      title: 'Admin',
      description: 'Manage users, companies, and platform settings',
      icon: <AdminPanelSettings sx={{ fontSize: 60 }} />,
      color: '#d32f2f'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Welcome to JobFlow
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Select your role to continue
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: role.color,
                    margin: '0 auto',
                    mb: 3
                  }}
                >
                  {role.icon}
                </Avatar>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {role.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 3,
                    bgcolor: role.color,
                    '&:hover': {
                      bgcolor: role.color
                    }
                  }}
                  fullWidth
                >
                  Continue as {role.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RoleSelection;
