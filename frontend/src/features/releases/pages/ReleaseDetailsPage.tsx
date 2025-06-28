import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const ReleaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Release Details - ID: {id}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Release details implementation coming soon...
      </Typography>
    </Box>
  );
};

export default ReleaseDetailsPage; 