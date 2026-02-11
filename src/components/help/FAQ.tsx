'use client';

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * Pergunta do FAQ
 */
interface FAQItem {
  question: string;
  answer: string | string[];
  category: string;
  tags?: string[];
}

/**
 * Lista de perguntas frequentes
 */
const FAQ_ITEMS: FAQItem[] = [
  // Categoria: Primeiros Passos
  {
    question: 'Como criar minha primeira ficha de personagem?',
    answer: [
      'Na página inicial, clique no botão "Nova Ficha".',
      'Você pode criar uma ficha em branco (com valores padrão de nível 1) ou usar o wizard de criação passo a passo.',
      'A ficha será criada conforme as regras do Tabuleiro do Caos RPG (livro v0.1.7).',
    ],
    category: 'Primeiros Passos',
    tags: ['criação', 'início'],
  },
  {
    question: 'Onde minhas fichas são salvas?',
    answer:
      'Suas fichas são salvas localmente no navegador usando IndexedDB. Não precisam de internet ou cadastro. Os dados ficam apenas no seu dispositivo.',
    category: 'Primeiros Passos',
    tags: ['salvamento', 'armazenamento'],
  },
  {
    question: 'Posso usar offline?',
    answer:
      'Sim! O Lite Sheets TDC é uma PWA (Progressive Web App) e funciona completamente offline após o primeiro acesso. Você pode até instalá-lo como aplicativo no seu dispositivo.',
    category: 'Primeiros Passos',
    tags: ['offline', 'pwa'],
  },

  // Categoria: Edição de Fichas
  {
    question: 'Como editar informações da ficha?',
    answer: [
      'Clique em qualquer campo para editá-lo diretamente.',
      'Campos numéricos (GA, PV, PP, Atributos) podem ser editados com um clique ou duplo-clique.',
      'Campos complexos (Linhagem, Origem) abrem uma sidebar lateral com detalhes.',
      'Todas as alterações são salvas automaticamente.',
    ],
    category: 'Edição',
    tags: ['edição', 'sidebar'],
  },
  {
    question: 'O que são valores padrão de nível 1?',
    answer: [
      'Ao criar uma ficha, ela inicia com:',
      '• GA 15 (Guarda máxima e atual)',
      '• PV = teto(GA máxima / 3)',
      '• 2 PP máximo e atual',
      '• Todos os 6 atributos em 1 (Agilidade, Corpo, Influência, Mente, Essência, Instinto)',
      '• +2 pontos de atributo para distribuir (máximo 3 em um atributo)',
      '• Proficiência com Armas Simples',
      '• Idioma Comum + (Mente - 1) idiomas adicionais (mínimo 0)',
      '• 3 + Mente habilidades proficientes',
      '• Habilidade de Assinatura (+1d em 1 habilidade escolhida)',
      '• Inventário com Mochila, Cartão do Banco e 10 PO$',
    ],
    category: 'Edição',
    tags: ['nível 1', 'padrão'],
  },
  {
    question: 'Quais são os 6 atributos do sistema?',
    answer: [
      'Os atributos do Tabuleiro do Caos RPG são:',
      '• Agilidade (Agi) — Destreza, reflexos, coordenação, rapidez',
      '• Corpo (Cor) — Capacidades físicas, saúde, força, resistência',
      '• Influência (Inf) — Habilidades sociais, carisma',
      '• Mente (Men) — Inteligência, raciocínio, conhecimentos',
      '• Essência (Ess) — Capacidades mágicas, potencial energético',
      '• Instinto (Ins) — Sentidos, instintos naturais',
      '',
      'Categorias: Físico (Agi, Cor), Mental (Inf, Men), Espiritual (Ess, Ins).',
      'Valores de 0 a 5. Com atributo 0, rola 2d e usa o menor.',
    ],
    category: 'Edição',
    tags: ['atributos', 'categorias'],
  },
  {
    question: 'Como funcionam os idiomas conhecidos?',
    answer:
      'Todo personagem conhece Comum por padrão. Você pode adicionar idiomas adicionais igual ao valor de Mente - 1 (mínimo 0). Se aumentar Mente, pode adicionar mais idiomas retroativamente.',
    category: 'Edição',
    tags: ['idiomas', 'mente'],
  },
  {
    question: 'O que é a Habilidade de Assinatura?',
    answer:
      'É uma habilidade especial do personagem que ganha dados extras ao rolar: +1d (nível 1-5), +2d (nível 6-10), +3d (nível 11-15). Você escolhe qual habilidade é sua assinatura. Não há distinção entre habilidades de combate e não-combate.',
    category: 'Edição',
    tags: ['assinatura', 'bônus'],
  },

  // Categoria: Sistema de Rolagem
  {
    question: 'Como funciona o sistema de rolagem?',
    answer: [
      'O sistema usa pool de dados com contagem de sucessos (✶):',
      '• Role X dados, onde X = valor do atributo + modificadores de dados.',
      '• O tamanho do dado depende do grau de proficiência: Leigo (d6), Adepto (d8), Versado (d10), Mestre (d12).',
      '• Resultados ≥ 6 = 1 sucesso (✶). Resultados = 1 cancelam 1 sucesso.',
      '• Mínimo de 0✶. Máximo de 8 dados por teste.',
      '• Todos os modificadores são +Xd ou -Xd (nunca numéricos).',
    ],
    category: 'Rolagem',
    tags: ['dados', 'rolagem', 'sucessos'],
  },
  {
    question: 'Como rolar dados na interface?',
    answer: [
      'Use o botão de rolagem ao lado das habilidades.',
      'Clique simples: abre configuração com opção de adicionar bônus (+Xd) ou penalidade (-Xd) temporários.',
      'Duplo-clique: faz rolagem rápida com resultado em modal temporário.',
      'Também há rolagem customizada para dados fora do sistema de resolução (dano, recursos, etc.).',
    ],
    category: 'Rolagem',
    tags: ['dados', 'rolagem', 'teste'],
  },
  {
    question: 'O que acontece quando atributo é 0?',
    answer:
      'Quando um atributo está em 0, você rola 2 dados do grau da habilidade e usa o MENOR resultado para contagem de sucessos. Penalidades que reduzem dados abaixo de 0 também rolam 2d e usam o menor.',
    category: 'Rolagem',
    tags: ['atributo zero', 'penalidade'],
  },
  {
    question: 'Onde vejo histórico de rolagens?',
    answer:
      'Clique no botão flutuante de histórico (ícone de relógio) no canto inferior direito da tela. Lá você vê todas as rolagens da sessão atual com detalhes completos.',
    category: 'Rolagem',
    tags: ['histórico', 'rolagens'],
  },

  // Categoria: Combate
  {
    question: 'Como funciona o sistema de saúde (GA/PV)?',
    answer: [
      '• GA (Guarda): Proteção que absorve dano. Funciona como um escudo. Base: 15 + bônus de arquétipo.',
      '• PV (Vitalidade): Saúde real do personagem. PV = teto(GA máxima / 3).',
      '• Dano atinge GA primeiro. Quando GA = 0, excedente vai para PV.',
      '• PV = 0: Ferimento Crítico (não morte imediata).',
      '• Receber dano na GA não significa ser ferido, mas ter as defesas desgastadas.',
    ],
    category: 'Combate',
    tags: ['guarda', 'vitalidade', 'dano', 'ga', 'pv'],
  },
  {
    question: 'Como funciona a economia de ações em combate?',
    answer: [
      '• Turno Rápido: 2 ações (▶▶) — age primeiro na rodada.',
      '• Turno Lento: 3 ações (▶▶▶) — age depois dos turnos rápidos.',
      '• Cada criatura tem 1 reação (↩) por rodada.',
      '• Ações livres (∆) não custam recursos.',
      '• Defesa é um teste ativo (não um valor fixo).',
    ],
    category: 'Combate',
    tags: ['ações', 'turno', 'combate'],
  },
  {
    question: 'O que é o Dado de Vulnerabilidade?',
    answer:
      'A vulnerabilidade é uma condição aplicada por golpes críticos. Ela é representada por um dado que regride: d20 → d12 → d10 → d8 → d6 → d4. Os efeitos mecânicos são aplicados automaticamente na ficha.',
    category: 'Combate',
    tags: ['vulnerabilidade', 'crítico'],
  },

  // Categoria: Progressão
  {
    question: 'Como funciona o Level Up?',
    answer: [
      'O personagem sobe de nível ao acumular XP suficiente (consulte a tabela de XP na seção de ajuda).',
      'Ao subir de nível, você pode:',
      '• Escolher um arquétipo para avançar.',
      '• Ganhar bônus de GA, PP e outras melhorias do arquétipo/classe.',
      '• Investir em novos atributos (até o máximo de 5, ou 6 com linhagem).',
    ],
    category: 'Progressão',
    tags: ['level up', 'xp', 'arquétipo'],
  },
  {
    question: 'O que são Arquétipos e Classes?',
    answer: [
      '• Arquétipos: Principal forma de progresso. 6 opções: Acadêmico, Acólito, Combatente, Feiticeiro, Ladino, Natural.',
      '• Classes: Especializações compostas por combinações de 1 ou 2 arquétipos.',
      '• Cada personagem pode ter até 3 classes.',
      '• A soma dos níveis de classes = nível do personagem.',
    ],
    category: 'Progressão',
    tags: ['arquétipo', 'classe', 'progressão'],
  },

  // Categoria: Feitiços e Magia
  {
    question: 'Como funciona o sistema de feitiços?',
    answer: [
      '• Habilite "Conjurador" na aba de feitiços para acessar Pontos de Feitiço (PF).',
      '• PF são usados para conjurar feitiços. Gastar PF também gasta PP no mesmo valor.',
      '• Custos por círculo: 1º=0 PF, 2º=1, 3º=3, 4º=5, 5º=7, 6º=9, 7º=15, 8º=20.',
      '• Não é possível conjurar com 0 PP.',
      '• Habilidades de conjuração: Arcano, Natureza ou Religião.',
    ],
    category: 'Feitiços',
    tags: ['feitiços', 'pf', 'magia', 'conjuração'],
  },

  // Categoria: Exportação e Backup
  {
    question: 'Como fazer backup das minhas fichas?',
    answer: [
      'Abra a ficha que deseja exportar.',
      'Clique no botão de Download (ícone de seta para baixo) no topo da ficha.',
      'Um arquivo JSON será baixado com todos os dados do personagem.',
      'Guarde esse arquivo em local seguro (nuvem, pen drive, etc.).',
    ],
    category: 'Backup',
    tags: ['exportação', 'backup', 'json'],
  },
  {
    question: 'Como importar uma ficha salva?',
    answer: [
      'Na página "Minhas Fichas", clique em "Importar Ficha".',
      'Selecione o arquivo JSON da ficha.',
      'A ficha será importada e adicionada à sua lista.',
      'Fichas de versões anteriores são migradas automaticamente para o formato atual.',
    ],
    category: 'Backup',
    tags: ['importação', 'restauração', 'migração'],
  },
  {
    question: 'Perco meus dados se limpar o navegador?',
    answer:
      'Sim! Se limpar dados/cache do navegador, as fichas serão apagadas. Por isso, faça backup regularmente exportando suas fichas em JSON.',
    category: 'Backup',
    tags: ['dados', 'segurança'],
  },
  {
    question: 'Posso compartilhar fichas com amigos?',
    answer:
      'Sim! Exporte a ficha em JSON e envie o arquivo para seu amigo. Ele pode importar no sistema dele. Cada pessoa terá sua própria cópia.',
    category: 'Backup',
    tags: ['compartilhar', 'amigos'],
  },

  // Categoria: Acessibilidade
  {
    question: 'O sistema é navegável por teclado?',
    answer:
      'Sim! Todo o sistema pode ser navegado usando Tab, Enter, Esc e setas. Veja a seção "Atalhos de Teclado" para mais detalhes.',
    category: 'Acessibilidade',
    tags: ['teclado', 'navegação'],
  },
  {
    question: 'Funciona com leitor de tela?',
    answer:
      'Sim! O sistema segue diretrizes WCAG 2.1 AA e foi testado com NVDA. Todos os elementos têm labels apropriados para leitores de tela.',
    category: 'Acessibilidade',
    tags: ['leitor de tela', 'nvda', 'wcag'],
  },

  // Categoria: Problemas Comuns
  {
    question: 'Minha ficha não está salvando!',
    answer: [
      'Verifique se o navegador permite armazenamento local (IndexedDB).',
      'Navegação anônima/privada pode impedir salvamento.',
      'Se usar extensões de bloqueio, permita armazenamento para este site.',
      'Como emergência, exporte a ficha em JSON e importe novamente.',
    ],
    category: 'Problemas',
    tags: ['salvar', 'erro', 'indexeddb'],
  },
  {
    question: 'O aplicativo não funciona offline!',
    answer: [
      'Acesse o site com internet pelo menos uma vez.',
      'Verifique se o navegador suporta Service Workers.',
      'Navegadores modernos (Chrome, Firefox, Safari, Edge) têm suporte completo.',
      'Tente instalar o app (botão "Instalar" no navegador).',
    ],
    category: 'Problemas',
    tags: ['offline', 'pwa', 'service worker'],
  },
  {
    question: 'Como mudar entre tema claro e escuro?',
    answer:
      'Clique no ícone de sol/lua no canto superior direito da tela. A preferência é salva automaticamente.',
    category: 'Problemas',
    tags: ['tema', 'escuro', 'claro'],
  },
];

/**
 * Componente de FAQ (Perguntas Frequentes)
 *
 * Exibe perguntas e respostas organizadas por categoria em formato acordeão.
 *
 * Funcionalidades:
 * - Acordeão expansível por categoria
 * - Tags de busca/filtro
 * - Navegação por teclado
 * - Acessível com ARIA labels
 *
 * @example
 * ```tsx
 * <FAQ />
 * ```
 */
export default function FAQ() {
  // Agrupa FAQ por categoria
  const groupedFAQ = FAQ_ITEMS.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <HelpOutlineIcon color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Perguntas Frequentes (FAQ)
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Encontre respostas para as dúvidas mais comuns sobre o Lite Sheets TDC:
      </Typography>

      {Object.entries(groupedFAQ).map(([category, items]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {category}
          </Typography>

          {items.map((item, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 1,
                '&:before': { display: 'none' },
                borderRadius: 1,
                overflow: 'hidden',
              }}
              elevation={0}
              variant="outlined"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-label={`Expandir pergunta: ${item.question}`}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.question}
                  </Typography>
                  {item.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {item.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {Array.isArray(item.answer) ? (
                  <Box component="ul" sx={{ pl: 2, my: 0 }}>
                    {item.answer.map((line, lineIndex) => (
                      <Typography
                        key={lineIndex}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {line}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" fontWeight={600} gutterBottom>
          Não encontrou sua resposta?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O Lite Sheets TDC é open source! Visite o{' '}
          <a
            href="https://github.com/vgabrielsoares/lite-sheets-tdc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            repositório no GitHub
          </a>{' '}
          para reportar problemas ou contribuir.
        </Typography>
      </Box>
    </Box>
  );
}
