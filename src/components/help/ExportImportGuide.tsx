'use client';

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';

/**
 * Guia de Exportação e Importação
 *
 * Documenta o processo de exportar e importar fichas de personagem,
 * incluindo backup, compartilhamento e portabilidade entre dispositivos.
 *
 * Funcionalidades:
 * - Passo a passo de exportação
 * - Passo a passo de importação
 * - Dicas de segurança e backup
 * - Avisos sobre perda de dados
 *
 * @example
 * ```tsx
 * <ExportImportGuide />
 * ```
 */
export default function ExportImportGuide() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SaveIcon color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Exportação e Importação de Fichas
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aprenda a fazer backup e compartilhar suas fichas de personagem usando
        exportação e importação em formato JSON.
      </Typography>

      {/* Seção de Exportação */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DownloadIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Exportar Ficha (Backup)
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Exportar uma ficha cria um arquivo JSON com todos os dados do
          personagem. Use para backup ou compartilhamento.
        </Typography>

        <Stepper orientation="vertical">
          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Abra a ficha do personagem
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Na tela "Minhas Fichas", clique no card da ficha que deseja
                exportar para abrir a visualização completa.
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Clique no botão de Exportar
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                No topo da ficha, ao lado do nome do personagem, clique no botão
                com ícone de download (seta para baixo).
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Salve o arquivo JSON
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Um arquivo chamado <code>character-[nome]-[data].json</code>{' '}
                será baixado. Guarde em local seguro (nuvem, pen drive, backup
                automático, etc.).
              </Typography>
            </StepContent>
          </Step>
        </Stepper>

        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Exportação concluída!</strong> O arquivo JSON contém TODOS
            os dados do personagem: atributos, habilidades, inventário,
            feitiços, anotações e mais.
          </Typography>
        </Alert>
      </Paper>

      {/* Seção de Importação */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <UploadIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Importar Ficha (Restaurar)
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Importe fichas salvas em JSON para restaurar backups ou adicionar
          fichas compartilhadas por amigos.
        </Typography>

        <Stepper orientation="vertical">
          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Vá para "Minhas Fichas"
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Na página inicial, você verá a lista de todas as suas fichas.
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Clique em "Importar Ficha"
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                No topo da tela, clique no botão "Importar Ficha" (ícone de
                upload com seta para cima).
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Selecione o arquivo JSON
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Escolha o arquivo <code>.json</code> da ficha exportada
                anteriormente. O sistema valida e carrega os dados
                automaticamente.
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="subtitle2" fontWeight={600}>
                Ficha adicionada!
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                A ficha importada aparecerá na lista e estará pronta para uso.
                Um novo ID único será gerado para evitar conflitos.
              </Typography>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Casos de Uso */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Casos de Uso
      </Typography>

      <List dense>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Backup Regular"
            secondary="Exporte fichas periodicamente para não perder progresso. Recomendado: backup mensal ou após sessões importantes."
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Trocar de Dispositivo"
            secondary="Exporte no dispositivo antigo, importe no novo. Perfeito para migrar entre computador e tablet."
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Compartilhar com Amigos"
            secondary="Envie o JSON para amigos importarem. Cada um terá sua própria cópia independente."
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Versionar Personagens"
            secondary="Exporte antes de mudanças arriscadas. Se não gostar, importe a versão antiga."
          />
        </ListItem>
      </List>

      {/* Avisos Importantes */}
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 3, mb: 2 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Avisos Importantes:
        </Typography>
        <List dense>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary="• Limpar cache/dados do navegador APAGA todas as fichas não exportadas"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary="• Navegação anônima/privada NÃO salva fichas permanentemente"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary="• Cada dispositivo tem seu próprio banco de dados local"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary="• Arquivos JSON são legíveis por humanos - NÃO contêm senha ou dados sensíveis"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: 'info.50',
          borderColor: 'info.main',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Dica Pro:</strong> Configure backup automático em nuvem
          (Google Drive, Dropbox) para a pasta de Downloads. Assim, seus
          arquivos JSON são automaticamente salvos na nuvem toda vez que
          exportar uma ficha!
        </Typography>
      </Paper>
    </Box>
  );
}
