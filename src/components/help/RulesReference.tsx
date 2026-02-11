'use client';

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';

import { SYMBOL_SUCCESS } from '@/constants/symbols';
import { DICE_STEPS, formatDiceStep } from '@/constants/diceSteps';
import { XP_TABLE } from '@/constants/progression';
import { SPELL_CIRCLE_PF_COST } from '@/constants/spells';

/**
 * Item do glossário
 */
interface GlossaryTerm {
  term: string;
  description: string;
  category: 'geral' | 'combate' | 'progressão' | 'mecânica';
}

/**
 * Termos do glossário conforme livro v0.1.7
 */
const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Narrador',
    description:
      'O narrador (ou mestre) rege a história e o ritmo do jogo, controlando tudo que não sejam os protagonistas aventureiros.',
    category: 'geral',
  },
  {
    term: 'Jogador',
    description:
      'O protagonista interpretado pelo jogador. Também chamado de aventureiro.',
    category: 'geral',
  },
  {
    term: 'NPC',
    description:
      'Personagem Não-Jogável. Controlado pelo narrador, interage com os jogadores de forma amigável, neutra ou antagonista.',
    category: 'geral',
  },
  {
    term: 'Criatura',
    description:
      'Qualquer ser vivo (ou não tão vivo) do sistema: jogador, NPC, inimigo, animal, monstro.',
    category: 'geral',
  },
  {
    term: 'Inimigo',
    description:
      'Criaturas diretamente agressivas aos personagens, que podem tentar um ataque.',
    category: 'geral',
  },
  {
    term: 'Atributos',
    description:
      'Capacidades físicas e mentais de uma criatura, em 6 aspectos: Agilidade, Corpo, Influência, Mente, Essência, Instinto. Variam de 0 a 5.',
    category: 'mecânica',
  },
  {
    term: 'Guarda (GA)',
    description:
      'Mede a capacidade de defesa: esquiva, bloqueio, combate, sorte e estamina. Dano é aplicado na GA primeiro. GA = 0 resulta em ferimento.',
    category: 'combate',
  },
  {
    term: 'Pontos de Vitalidade (PV)',
    description:
      'Saúde real da criatura. PV = teto(GA máxima / 3). Quando PV = 0, a criatura sofre Ferimento Crítico.',
    category: 'combate',
  },
  {
    term: 'Pontos de Poder (PP)',
    description:
      'Capacidades mágicas e energéticas. Consumidos por habilidades especiais. Sem penalidade ao chegar a 0 PP, exceto não usar poderes.',
    category: 'mecânica',
  },
  {
    term: 'Habilidades',
    description:
      'Perícias com 4 graus: Leigo (d6), Adepto (d8), Versado (d10), Mestre (d12). O grau determina o tamanho do dado rolado.',
    category: 'mecânica',
  },
  {
    term: `Sucesso (${SYMBOL_SUCCESS})`,
    description:
      'Resultado ≥ 6 em um dado. Acompanhado de número (1✶, 2✶, 3✶). Resultados = 1 cancelam 1 sucesso.',
    category: 'mecânica',
  },
  {
    term: 'Falha (0✶)',
    description: 'Quando um teste não tem nenhum sucesso após cancelamentos.',
    category: 'mecânica',
  },
  {
    term: 'Ação (▶)',
    description:
      'Unidade de tempo em combate. Turno Rápido: 2▶. Turno Lento: 3▶.',
    category: 'combate',
  },
  {
    term: 'Reação (↩)',
    description:
      '1 por rodada. Usada em resposta a gatilhos (ex: defesa ativa).',
    category: 'combate',
  },
  {
    term: 'Ação Livre (∆)',
    description:
      'Não gasta recursos. Pode ser usada à vontade durante o turno.',
    category: 'combate',
  },
  {
    term: 'Arquétipo',
    description:
      'Principal forma de progresso. 6 opções: Acadêmico, Acólito, Combatente, Feiticeiro, Ladino, Natural.',
    category: 'progressão',
  },
  {
    term: 'Classe',
    description:
      'Especialização composta por 1 ou 2 arquétipos. Até 3 classes por personagem.',
    category: 'progressão',
  },
  {
    term: 'Modificador',
    description:
      'Bônus ou penalidade. Pode ser adição/subtração pura (ex: +2 deslocamento) ou em dados (ex: +1d, -2d).',
    category: 'mecânica',
  },
  {
    term: 'Nível de Ameaça (NA)',
    description: 'Mede a periculosidade e poder de inimigos.',
    category: 'combate',
  },
  {
    term: 'Proficiência',
    description:
      'Habilidade de usar algo corretamente. Sem proficiência, penalidades são aplicadas.',
    category: 'mecânica',
  },
  {
    term: 'Turno e Rodada',
    description:
      'Cada criatura tem um turno. Quando todas agem, uma rodada se encerra.',
    category: 'combate',
  },
  {
    term: 'Descanso',
    description:
      'Período onde jogadores param para curar feridas, praticar hobbies e relaxar.',
    category: 'geral',
  },
  {
    term: 'Sessão',
    description:
      'Momento em que os jogadores se reúnem para jogar (como um episódio de uma série).',
    category: 'geral',
  },
  {
    term: 'Aventura',
    description:
      'Uma história sobre um assunto específico. Pode ser curta ou longa (como uma temporada).',
    category: 'geral',
  },
  {
    term: 'Campanha',
    description:
      'Longo período composto de várias aventuras (como uma série completa).',
    category: 'geral',
  },
];

/**
 * Labels de categoria
 */
const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
  geral: 'Geral',
  combate: 'Combate',
  progressão: 'Progressão',
  mecânica: 'Mecânica',
};

/**
 * Cores das categorias
 */
const CATEGORY_COLORS: Record<
  GlossaryTerm['category'],
  'default' | 'error' | 'warning' | 'info'
> = {
  geral: 'default',
  combate: 'error',
  progressão: 'warning',
  mecânica: 'info',
};

/**
 * Tabelas de Referência e Glossário (v0.2)
 *
 * Inclui:
 * - Glossário de termos do jogo
 * - Tabela de XP por nível
 * - Tabela de custos de feitiço (PF)
 * - Tabela de Sorte
 * - Tabela de Passos de Dados
 * - Tabela de Alcances
 */
export default function RulesReference() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <MenuBookIcon color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Referências e Glossário
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Consulte tabelas de referência, glossário de termos e outras informações
        úteis do Tabuleiro do Caos RPG (livro v0.1.7).
      </Typography>

      {/* Glossário de Termos */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Glossário de Termos
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Termo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {GLOSSARY_TERMS.map((item) => (
                <TableRow key={item.term}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.term}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={CATEGORY_LABELS[item.category]}
                      size="small"
                      color={CATEGORY_COLORS[item.category]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Tabela de XP */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Tabela de XP por Nível
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          XP necessário para progredir de cada nível para o próximo.
        </Typography>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nível</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>XP Necessário</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {XP_TABLE.map((xp, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {index} → {index + 1}
                  </TableCell>
                  <TableCell>{xp.toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          Após nível 30, cada nível seguinte requer XP anterior × 1,07.
        </Typography>
      </Paper>

      {/* Custos de Feitiço */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Custos de Feitiço (PF)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Custo em Pontos de Feitiço por círculo. Gastar PF também gasta PP no
          mesmo valor. Não é possível reduzir abaixo de 1 PF (exceto 1º círculo
          sem aprimoramentos). Com 0 PP, não pode conjurar.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Círculo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Custo (PF)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(SPELL_CIRCLE_PF_COST).map(([circle, cost]) => (
                <TableRow key={circle}>
                  <TableCell>{circle}º Círculo</TableCell>
                  <TableCell>{cost} PF</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tabela de Sorte */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Tabela de Sorte
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sorte é uma habilidade especial com 7 níveis de progressão
          independente do nível do personagem.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nível de Sorte</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rolagem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { level: 0, roll: '1d6' },
                { level: 1, roll: '2d6' },
                { level: 2, roll: '2d8' },
                { level: 3, roll: '3d8' },
                { level: 4, roll: '3d10' },
                { level: 5, roll: '4d10' },
                { level: 6, roll: '4d12' },
                { level: 7, roll: '5d12' },
              ].map((item) => (
                <TableRow key={item.level}>
                  <TableCell>{item.level}</TableCell>
                  <TableCell>{item.roll}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tabela de Apostas */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Tabela de Apostas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resultados possíveis ao apostar usando a habilidade de Sorte.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Teste</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Resultado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { test: '0✶', result: 'Perde tudo' },
                { test: '1✶', result: 'Perde metade' },
                { test: '2✶', result: 'Não ganha nada' },
                { test: '3✶', result: 'Ganha metade' },
                { test: '4✶', result: 'Ganha a aposta' },
                { test: '5✶', result: 'Ganha o dobro' },
                { test: '6✶', result: 'Ganha o quíntuplo' },
              ].map((item) => (
                <TableRow key={item.test}>
                  <TableCell>{item.test}</TableCell>
                  <TableCell>{item.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tabela de Alcances */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Tabela de Alcances
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Alcance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Distância</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { range: 'Pessoal', distance: 'Só o personagem' },
                { range: 'Adjacente/Toque', distance: '1 metro' },
                { range: 'Curto', distance: '5 metros' },
                { range: 'Médio', distance: '10 metros' },
                { range: 'Longo', distance: '30 metros' },
                { range: 'Muito Longo', distance: '60 metros' },
                { range: 'Ilimitado', distance: 'Sem limite' },
              ].map((item) => (
                <TableRow key={item.range}>
                  <TableCell>{item.range}</TableCell>
                  <TableCell>{item.distance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Passos de Dados */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Passos de Dados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Várias mecânicas podem alterar os passos de dado de efeitos do
          sistema. A progressão funciona avançando ou regredindo na lista
          abaixo.
        </Typography>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>Passo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dado(s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DICE_STEPS.map((step) => (
                <TableRow key={step.index}>
                  <TableCell>{step.index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDiceStep(step)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
