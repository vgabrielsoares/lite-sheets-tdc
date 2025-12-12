/**
 * ImportCharacterButton - Botão para importar fichas de personagem
 *
 * Este componente permite ao usuário importar fichas de personagem a partir
 * de arquivos JSON, com validação completa e feedback visual.
 */

'use client';

import { useRef, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { addCharacter } from '@/features/characters/charactersSlice';
import { useNotifications } from '@/hooks/useNotifications';
import {
  importCharacter,
  type ImportResult,
  type ImportMultipleResult,
} from '@/services/importService';

/**
 * Props do componente ImportCharacterButton
 */
interface ImportCharacterButtonProps {
  /** Variante do botão (padrão: outlined) */
  variant?: 'text' | 'outlined' | 'contained';
  /** Tamanho do botão (padrão: medium) */
  size?: 'small' | 'medium' | 'large';
  /** Texto customizado do botão (padrão: "Importar Ficha") */
  label?: string;
  /** Callback executado após importação bem-sucedida */
  onImportSuccess?: (characterId: string) => void;
  /** Se true, mostra apenas o ícone (padrão: false) */
  iconOnly?: boolean;
}

/**
 * Componente de botão para importar fichas de personagem
 *
 * Responsabilidades:
 * - Permitir seleção de arquivo JSON
 * - Validar e importar personagem
 * - Exibir feedback de sucesso/erro
 * - Adicionar personagem ao Redux store
 * - Mostrar avisos se houver
 *
 * Seguindo princípios de boas práticas:
 * - DRY: Reutilizável com diferentes variantes
 * - Modularização: Lógica de importação em serviço separado
 * - Acessibilidade: Labels, ARIA, feedback claro
 * - UX: Loading states, confirmação, avisos
 */
export default function ImportCharacterButton({
  variant = 'outlined',
  size = 'medium',
  label = 'Importar Ficha',
  onImportSuccess,
  iconOnly = false,
}: ImportCharacterButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotifications();

  // Ref para o input de arquivo (hidden)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<
    ImportResult | ImportMultipleResult | null
  >(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  /**
   * Abre o seletor de arquivo
   */
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  /**
   * Processa o arquivo selecionado
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      console.log(`📥 Iniciando importação de: ${file.name}`);

      // Importa personagem(s)
      const result = await importCharacter(file);

      // Verifica se é importação única ou múltipla
      if ('character' in result) {
        // Importação única
        console.log(`✅ Personagem importado: ${result.character.name}`);

        // Adiciona ao Redux store
        dispatch(addCharacter(result.character));

        // Mostra resultado
        setImportResult(result);
        setShowResultDialog(true);

        // Notificação de sucesso
        showSuccess(
          `Personagem "${result.character.name}" importado com sucesso!`
        );

        // Callback de sucesso
        if (onImportSuccess) {
          onImportSuccess(result.character.id);
        }
      } else {
        // Importação múltipla
        console.log(`✅ ${result.count} personagens importados`);

        // Adiciona todos ao Redux store
        result.characters.forEach((character) => {
          dispatch(addCharacter(character));
        });

        // Mostra resultado
        setImportResult(result);
        setShowResultDialog(true);

        // Notificação de sucesso
        const successCount = result.count;
        const errorCount = result.errors.length;
        const message =
          errorCount > 0
            ? `${successCount} personagens importados (${errorCount} falharam)`
            : `${successCount} personagens importados com sucesso!`;

        showSuccess(message);

        // Callback de sucesso (primeiro personagem importado)
        if (onImportSuccess && result.characters.length > 0) {
          onImportSuccess(result.characters[0].id);
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao importar personagem:', error);

      const errorMessage =
        error?.message || 'Erro desconhecido ao importar personagem';

      showError(`Erro ao importar: ${errorMessage}`);
    } finally {
      setIsImporting(false);
      // Limpa o input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Fecha o dialog de resultado
   */
  const handleCloseDialog = () => {
    setShowResultDialog(false);
    setImportResult(null);
  };

  /**
   * Navega para a ficha importada
   */
  const handleViewCharacter = () => {
    if (!importResult) return;

    // Para importação única, navega para o personagem
    if ('character' in importResult) {
      router.push(`/characters/${importResult.character.id}`);
      handleCloseDialog();
    }
    // Para importação múltipla, navega para o primeiro personagem
    else if (
      'characters' in importResult &&
      importResult.characters.length > 0
    ) {
      router.push(`/characters/${importResult.characters[0].id}`);
      handleCloseDialog();
    }
  };

  return (
    <>
      {/* Input de arquivo (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Selecionar arquivo JSON para importar"
      />

      {/* Botão de importação */}
      <Tooltip
        title={
          isImporting
            ? 'Importando personagem...'
            : 'Importar ficha a partir de arquivo JSON'
        }
      >
        <Button
          variant={variant}
          size={size}
          startIcon={
            isImporting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <UploadIcon />
            )
          }
          onClick={handleOpenFileSelector}
          disabled={isImporting}
          aria-label={label}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          {!iconOnly && (isImporting ? 'Importando...' : label)}
        </Button>
      </Tooltip>

      {/* Dialog de resultado da importação */}
      <Dialog
        open={showResultDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Importação Concluída
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Mensagem diferente para importação única vs múltipla */}
          {importResult && 'character' in importResult ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                O personagem <strong>{importResult.character.name}</strong> foi
                importado com sucesso!
              </DialogContentText>

              {/* Informações da importação única */}
              <Box sx={{ mb: 2 }}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Versão do Arquivo"
                      secondary={importResult.originalVersion}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Nível"
                      secondary={importResult.character.level}
                    />
                  </ListItem>
                  {importResult.character.lineage && (
                    <ListItem>
                      <ListItemText
                        primary="Linhagem"
                        secondary={importResult.character.lineage.name || 'N/A'}
                      />
                    </ListItem>
                  )}
                  {importResult.character.origin && (
                    <ListItem>
                      <ListItemText
                        primary="Origem"
                        secondary={importResult.character.origin.name || 'N/A'}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </>
          ) : importResult && 'characters' in importResult ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>{importResult.count} personagens</strong> foram
                importados com sucesso!
              </DialogContentText>

              {/* Informações da importação múltipla */}
              <Box sx={{ mb: 2 }}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Versão do Arquivo"
                      secondary={importResult.originalVersion}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Personagens Importados"
                      secondary={importResult.characters
                        .map((c) => c.name)
                        .join(', ')}
                    />
                  </ListItem>
                  {importResult.errors.length > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Erros"
                        secondary={`${importResult.errors.length} personagens falharam na importação`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              {/* Lista de erros, se houver */}
              {importResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <strong>Erros durante a importação:</strong>
                  <List dense sx={{ mt: 1 }}>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText
                          primary={error.name}
                          secondary={error.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </>
          ) : null}

          {/* Avisos, se houver */}
          {importResult && importResult.warnings.length > 0 && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <strong>Avisos durante a importação:</strong>
              <List dense sx={{ mt: 1 }}>
                {importResult.warnings.map((warning, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {/* Migração de versão */}
          {importResult?.wasMigrated && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Os dados foram migrados da versão {importResult.originalVersion}{' '}
              para a versão atual.
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Fechar
          </Button>
          <Button
            onClick={handleViewCharacter}
            color="primary"
            variant="contained"
            autoFocus
          >
            Ver Ficha
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
