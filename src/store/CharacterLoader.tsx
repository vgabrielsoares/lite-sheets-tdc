/**
 * CharacterLoader Component
 *
 * Componente responsável por inicializar e manter a sincronização
 * entre Redux e IndexedDB para personagens.
 *
 * Este componente deve ser montado uma vez na raiz da aplicação
 * para garantir que os personagens sejam carregados e sincronizados
 * automaticamente.
 */

'use client';

import { useCharacterSync } from '@/hooks/useCharacterSync';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

/**
 * Props do CharacterLoader
 */
export interface CharacterLoaderProps {
  /** Componentes filhos a serem renderizados após carregamento */
  children: React.ReactNode;
  /** Se true, exibe loading spinner durante carregamento inicial */
  showLoading?: boolean;
  /** Se true, exibe mensagem de erro se houver */
  showError?: boolean;
}

/**
 * Componente de carregamento e sincronização de personagens
 *
 * Usa o hook useCharacterSync para:
 * - Carregar personagens do IndexedDB na montagem
 * - Manter sincronização automática entre Redux e IndexedDB
 * - Exibir estados de loading e erro (opcional)
 *
 * @example
 * ```tsx
 * // Em app/layout.tsx ou similar
 * <CharacterLoader showLoading showError>
 *   <YourApp />
 * </CharacterLoader>
 * ```
 */
export default function CharacterLoader({
  children,
  showLoading = true,
  showError = true,
}: CharacterLoaderProps) {
  const { isLoading, error } = useCharacterSync();

  // Exibir loading durante carregamento inicial
  if (showLoading && isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Carregando personagens...
        </Typography>
      </Box>
    );
  }

  // Exibir erro se houver (não bloqueia renderização, apenas avisa)
  if (showError && error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            // Usuário pode fechar o alerta e continuar usando a aplicação
          }}
        >
          <Typography variant="body1" gutterBottom>
            <strong>Erro ao carregar personagens:</strong>
          </Typography>
          <Typography variant="body2">{error}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Você pode continuar usando a aplicação, mas os dados podem não estar
            sincronizados.
          </Typography>
        </Alert>
        {children}
      </Box>
    );
  }

  // Renderizar filhos normalmente
  return <>{children}</>;
}
