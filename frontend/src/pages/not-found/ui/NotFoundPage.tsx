import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/start');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            maxWidth: 500,
            width: '100%'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: 'text.primary'
            }}
          >
            Page Not Found
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            The page you are looking for might have been removed, 
            had its name changed, or is temporarily unavailable.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              size="large"
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 