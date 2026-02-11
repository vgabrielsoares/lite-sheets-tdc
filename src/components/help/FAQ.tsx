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
      'Na página inicial, clique no botão "Nova Ficha" ou no card "Criar sua primeira ficha".',
      'Digite o nome do personagem e clique em "Criar Ficha".',
      'A ficha será criada com valores padrão de nível 1 conforme as regras do Tabuleiro do Caos RPG.',
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
      '• PV 5 (Vitalidade = GA/3)',
      '• 2 PP máximo e atual',
      '• Todos os atributos em 1',
      '• Proficiência com Armas Simples',
      '• Idioma Comum + (Mente - 1) idiomas adicionais',
      '• Inventário com Mochila, Cartão do Banco e 10 PO$',
    ],
    category: 'Edição',
    tags: ['nível 1', 'padrão'],
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
      'É uma habilidade especial do personagem. Ganha dados extras ao rolar: +1d (nível 1-5), +2d (nível 6-10), +3d (nível 11-15). Você escolhe qual habilidade é sua assinatura.',
    category: 'Edição',
    tags: ['assinatura', 'bônus'],
  },

  // Categoria: Sistema de Rolagem
  {
    question: 'Como rolar dados?',
    answer: [
      'Use o botão de rolagem ao lado das habilidades.',
      'Clique simples: abre configuração completa de rolagem.',
      'Duplo-clique: faz rolagem rápida com resultado em modal temporário.',
      'Você pode ajustar vantagem/desvantagem e modificadores extras.',
    ],
    category: 'Rolagem',
    tags: ['dados', 'rolagem', 'teste'],
  },
  {
    question: 'O que acontece quando atributo é 0?',
    answer:
      'Quando um atributo está em 0, você rola 2d20 e escolhe o MENOR resultado (mecânica de desvantagem severa).',
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

  // Categoria: Cálculos e Regras
  {
    question: 'Como é calculado o modificador de habilidades?',
    answer:
      'Modificador = Atributo-chave × Grau de Proficiência. Graus: Leigo (×0), Adepto (×1), Versado (×2), Mestre (×3). Exemplo: Mente 3 e Versado = 3 × 2 = +6.',
    category: 'Cálculos',
    tags: ['modificador', 'proficiência'],
  },
  {
    question: 'Como funciona a Guarda (GA)?',
    answer:
      'GA (Guarda) é uma proteção que absorve dano antes da Vitalidade (PV). GA base = 15 + bônus de arquétipo por nível. PV = GA máxima / 3 (arredondado para baixo). Dano atinge GA primeiro; quando GA chega a 0, o excedente vai para PV.',
    category: 'Cálculos',
    tags: ['guarda', 'ga', 'vitalidade', 'pv'],
  },
  {
    question: 'O que são GA e PP temporários?',
    answer: [
      'GA Temporários: pontos de guarda extras que absorvem dano primeiro. Não se acumulam, sempre use o maior valor.',
      'PP Temporários: pontos de poder extras. Funcionam igual aos GA temporários.',
    ],
    category: 'Cálculos',
    tags: ['ga', 'pp', 'temporário'],
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
    ],
    category: 'Backup',
    tags: ['importação', 'restauração'],
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
