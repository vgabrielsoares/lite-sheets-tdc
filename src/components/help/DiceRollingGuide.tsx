'use client';

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * Guia do Sistema de Rolagem de Dados
 *
 * Documenta como funciona o sistema de rolagem de dados baseado
 * nas regras do Tabuleiro do Caos RPG.
 *
 * Funcionalidades:
 * - Explicação da mecânica de rolagem
 * - Como usar vantagem e desvantagem
 * - Modificadores e cálculos
 * - Exemplos práticos
 *
 * @example
 * ```tsx
 * <DiceRollingGuide />
 * ```
 */
export default function DiceRollingGuide() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CasinoIcon color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Sistema de Rolagem de Dados
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        O Lite Sheets TDC usa um sistema de rolagem baseado nas regras do
        Tabuleiro do Caos RPG. Aprenda a rolar dados, usar modificadores e
        interpretar resultados.
      </Typography>

      {/* Mecânica Básica */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Mecânica Básica
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O número de d20 rolados é igual ao valor do atributo-chave da
          habilidade. Você sempre escolhe o <strong>maior resultado</strong> (a
          não ser em casos especiais).
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 2 }}>
          Fórmula Geral:
        </Typography>

        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            textAlign: 'center',
            mb: 2,
          }}
        >
          [Atributo]d20 + [Modificador de Habilidade] + [Outros Modificadores]
        </Box>

        <List dense>
          <ListItem>
            <ListItemText
              primary="Atributo"
              secondary="Quantidade de dados d20 a rolar (igual ao valor do atributo)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Modificador de Habilidade"
              secondary="Atributo × Grau de Proficiência (Leigo ×0, Adepto ×1, Versado ×2, Mestre ×3)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Outros Modificadores"
              secondary="Bônus de equipamento, feitiços, efeitos temporários, etc."
            />
          </ListItem>
        </List>
      </Paper>

      {/* Caso Especial: Atributo 0 */}
      <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 4 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Caso Especial: Atributo em 0
        </Typography>
        <Typography variant="body2">
          Quando um atributo está em 0, você rola <strong>2d20</strong> e
          escolhe o <strong>MENOR</strong> resultado. Isso representa uma
          desvantagem severa.
        </Typography>
      </Alert>

      {/* Como Rolar na Interface */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Como Rolar na Interface
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="1. Rolagem Rápida (Duplo-Clique)"
              secondary="Duplo-clique no botão de rolagem ao lado da habilidade. O resultado aparece em um modal temporário por 3 segundos."
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="2. Rolagem Configurável (Clique Simples)"
              secondary="Clique simples no botão de rolagem. Abre um painel onde você pode adicionar modificadores extras e ver a configuração completa."
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="3. Histórico de Rolagens"
              secondary="Clique no botão flutuante de histórico (ícone de relógio) no canto inferior direito para ver todas as rolagens da sessão. Você pode expandir cada rolagem para ver detalhes completos e limpar o histórico quando necessário."
            />
          </ListItem>
        </List>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Exemplos Práticos */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Exemplos Práticos
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplo 1: Teste de Acrobacia (Adepto)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Atributo Agilidade: 3 | Proficiência: Adepto (×1)
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          3d20 + (3 × 1) = 3d20 + 3
        </Typography>
        <Typography variant="body2">
          Você rola 3 dados de 20, escolhe o maior (ex: 17), soma +3 ={' '}
          <strong>resultado 20</strong>
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplo 2: Teste de Conhecimento (Versado) com Modificador de Dado
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Atributo Mente: 2 | Proficiência: Versado (×2) | Modificador
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          (2 + 1)d20 + (2 × 2) = 3d20 + 4
        </Typography>
        <Typography variant="body2">
          Você rola 3 dados (2 normais + 1 modificador), escolhe o maior (ex:
          19), soma +4 = <strong>resultado 23</strong>
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplo 3: Teste de Força (Leigo) com Atributo 0
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Atributo Força: 0 | Proficiência: Leigo (×0)
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          2d20 + (0 × 0) = 2d20 + 0 (escolher MENOR)
        </Typography>
        <Typography variant="body2">
          Você rola 2 dados, escolhe o <strong>menor</strong> (ex: 6), soma 0 ={' '}
          <strong>resultado 6</strong>
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 3,
          bgcolor: 'info.50',
          borderColor: 'info.main',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Dica:</strong> O sistema calcula tudo automaticamente! Você só
          precisa clicar no botão de rolagem. Ajuste vantagem/desvantagem e
          modificadores extras quando necessário.
        </Typography>
      </Paper>
    </Box>
  );
}
