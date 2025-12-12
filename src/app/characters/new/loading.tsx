import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';

/**
 * Loading state para a página de criação de ficha
 */
export default function Loading() {
  return (
    <AppLayout maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Carregando formulário...
        </Typography>
      </Box>
    </AppLayout>
  );
}
