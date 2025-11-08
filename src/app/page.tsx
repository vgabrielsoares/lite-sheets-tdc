import AppLayout from '@/components/layout/AppLayout';
import { Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <AppLayout maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Lite Sheets TDC
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Sistema de Gerenciamento de Fichas de Personagem
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tabuleiro do Caos RPG
        </Typography>
      </Box>
    </AppLayout>
  );
}
