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
import StarIcon from '@mui/icons-material/Star';

import {
  SYSTEM_SYMBOLS,
  SYMBOL_SUCCESS,
  SYMBOL_FAILURE,
} from '@/constants/symbols';

/**
 * Guia do Sistema de Rolagem de Dados
 *
 * Documenta o sistema de pool de dados d6+ com contagem de sucessos,
 * graus de proficiência como tamanho de dado, e mecânicas relacionadas.
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
        O Lite Sheets TDC usa o sistema de pool de dados com contagem de
        sucessos do Tabuleiro do Caos RPG (livro v0.1.7). Aprenda como funciona
        a rolagem, os graus de habilidade e como interpretar resultados.
      </Typography>

      {/* Mecânica Básica */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Mecânica de Resolução
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O sistema utiliza uma <strong>pool de dados</strong> onde você rola
          uma quantidade de dados igual ao valor do{' '}
          <strong>atributo-chave + modificadores de dados</strong>. O tamanho do
          dado depende do <strong>grau de proficiência</strong> na habilidade.
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 2 }}>
          Como funciona:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary={`Sucesso (${SYMBOL_SUCCESS})`}
              secondary="Cada resultado ≥ 6 no dado conta como 1 sucesso"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Cancelamento"
              secondary={`Cada resultado = 1 cancela 1 sucesso (mínimo ${SYMBOL_FAILURE})`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Limite de dados"
              secondary="Máximo de 8 dados por teste de habilidade"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Modificadores"
              secondary="Todos os modificadores são em forma de +Xd ou -Xd (dados adicionados ou removidos), nunca numéricos"
            />
          </ListItem>
        </List>

        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '1rem',
            textAlign: 'center',
            mt: 2,
          }}
        >
          [Atributo]d[Grau] ± modificadores em dados → contar resultados ≥ 6
        </Box>
      </Paper>

      {/* Graus de Proficiência */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Graus de Proficiência (Tamanho do Dado)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O grau de proficiência em uma habilidade determina o{' '}
          <strong>tamanho do dado</strong> rolado. Dados maiores têm mais chance
          de obter resultados ≥ 6.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Grau</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Chance de {SYMBOL_SUCCESS} por dado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Chip label="Leigo" size="small" variant="outlined" />
                </TableCell>
                <TableCell>d6</TableCell>
                <TableCell>16,7% (resultado 6)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip label="Adepto" size="small" color="info" />
                </TableCell>
                <TableCell>d8</TableCell>
                <TableCell>37,5% (resultados 6, 7, 8)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip label="Versado" size="small" color="secondary" />
                </TableCell>
                <TableCell>d10</TableCell>
                <TableCell>50% (resultados 6–10)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip label="Mestre" size="small" color="warning" />
                </TableCell>
                <TableCell>d12</TableCell>
                <TableCell>58,3% (resultados 6–12)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Casos Especiais */}
      <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 4 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Casos Especiais
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Atributo 0:</strong> Rola 2 dados do grau da habilidade e usa
          o <strong>menor</strong> resultado para contagem de sucessos.
        </Typography>
        <Typography variant="body2">
          <strong>Penalidade extrema (dados negativos):</strong> Quando
          penalidades reduzem os dados abaixo de 0, rola 2 dados e usa o menor
          resultado. Nunca se rola mais que 2 dados com menor valor.
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
              secondary="Clique simples no botão de rolagem. Abre um painel onde você pode adicionar modificadores temporários de bônus (+Xd) ou penalidade (-Xd) para aquela instância de rolagem."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Histórico de Rolagens"
              secondary="Clique no botão flutuante de histórico (ícone de relógio) no canto inferior direito para ver todas as rolagens da sessão. Expanda cada rolagem para detalhes completos."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Rolagem Customizada"
              secondary="Use o botão de rolagem customizada para escolher o tipo de dado, quantidade, e se deseja somar ou contar sucessos. Útil para rolagens fora do sistema de resolução (dano, recursos, etc.)."
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
          Atributo Agilidade: 3 | Proficiência: Adepto (d8)
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          Rola 3d8 → resultados: 2, 7, 6 → 2{SYMBOL_SUCCESS} (dois sucessos)
        </Typography>
        <Typography variant="body2">
          Os resultados 7 e 6 são ≥ 6, contando como{' '}
          <strong>2{SYMBOL_SUCCESS}</strong>. O resultado 2 não é 1, então não
          cancela nada.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplo 2: Teste de Conhecimento (Versado) com Bônus
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Atributo Mente: 2 | Proficiência: Versado (d10) | Bônus: +1d
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          Rola (2+1)d10 = 3d10 → resultados: 1, 9, 6 → 2{SYMBOL_SUCCESS} - 1
          cancelamento = 1{SYMBOL_SUCCESS}
        </Typography>
        <Typography variant="body2">
          9 e 6 são sucessos (2{SYMBOL_SUCCESS}), mas o resultado 1 cancela um
          sucesso. Resultado final: <strong>1{SYMBOL_SUCCESS}</strong>.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplo 3: Teste com Atributo 0 (Leigo)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Atributo Corpo: 0 | Proficiência: Leigo (d6)
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 1 }}
        >
          Rola 2d6 → resultados: 3, 6 → usa o menor (3) → {SYMBOL_FAILURE}
        </Typography>
        <Typography variant="body2">
          Com atributo 0, rola 2d6 e usa o <strong>menor</strong> resultado (3).
          Como 3 não é ≥ 6, o resultado é <strong>{SYMBOL_FAILURE}</strong>.
        </Typography>
      </Paper>

      {/* Símbolos do Sistema */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <StarIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Símbolos do Sistema
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 80 }}>Símbolo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Significado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Exemplo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SYSTEM_SYMBOLS.map((sym) => (
              <TableRow key={sym.symbol}>
                <TableCell>
                  <Typography variant="h6" component="span">
                    {sym.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {sym.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {sym.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={sym.example} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          precisa clicar no botão de rolagem. Na rolagem configurável, é
          possível adicionar modificadores temporários de bônus (+Xd) ou
          penalidade (-Xd) para aquela instância.
        </Typography>
      </Paper>
    </Box>
  );
}
