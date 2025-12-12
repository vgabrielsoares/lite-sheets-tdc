# Lite Sheets TDC

Sistema de criação e gerenciamento de fichas de RPG totalmente no navegador, com experiência PWA, funcionamento offline, responsividade e foco em acessibilidade. Ideal para jogadores e mestres que buscam praticidade, performance e facilidade de uso, sem depender de backend ou banco de dados externo.

---

## Tecnologias Utilizadas

- **React**: Biblioteca principal para construção da interface, utilizando componentes reutilizáveis e JSX.
- **Next.js**: Framework para React, com SSR/SSG, rotas automáticas, API Routes e suporte facilitado a PWA (ex: [next-pwa](https://github.com/shadowwalker/next-pwa)).
- **Create React App (CRA)**: Alternativa para SPAs, com suporte a PWA via service worker.
- **Redux Toolkit** ou **Context API**: Gerenciamento de estado global, com persistência local usando [redux-persist](https://github.com/rt2zz/redux-persist) ou soluções similares.
- **Persistência Local**: Uso de `IndexedDB` (com [Dexie.js](https://dexie.org/)) para armazenar fichas no navegador.
- **TypeScript**: Tipagem estática para maior robustez e manutenção.
- **Testes**: [Jest](https://jestjs.io/) para testes unitários e [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) para testes de componentes.
- **Componentes UI**: [Material UI](https://mui.com/) para componentes prontos e responsivos.
- **PWA**: Service Worker, `manifest.json`, cache offline e instalação no dispositivo.

---

## Funcionalidades

### Gerenciamento de Fichas

- **Criação e edição de fichas**: Interface intuitiva para criar e editar fichas de RPG personalizadas com valores padrão do sistema Tabuleiro do Caos
- **Persistência local**: Fichas salvas no próprio navegador usando IndexedDB, sem necessidade de cadastro ou login
- **Exportação/Importação**: Sistema completo de backup em JSON para portabilidade e compartilhamento entre dispositivos
- **Sistema de abas**: Ficha organizada em 8 abas (Principal, Combate, Arquétipos, Recursos, Inventário, Feitiços, Descrição, Anotações)

### Sistema de Jogo

- **Rolagem de dados**: Sistema integrado de rolagem de d20 com suporte a vantagem/desvantagem e modificadores
- **Cálculos automáticos**: Defesa, modificadores de habilidades, idiomas baseados em Mente, e mais
- **Gerenciamento de recursos**: Controle de PV/PP com valores temporários, economia de ações em combate
- **Inventário completo**: Sistema de moedas, itens, peso e capacidade de carga

### Experiência do Usuário

- **Offline-first**: Totalmente funcional sem conexão com a internet (PWA)
- **Instalação como app**: Pode ser instalado em dispositivos como um aplicativo nativo
- **Tema claro/escuro**: Alternância entre temas com paleta medieval/fantasy
- **Responsividade**: Interface adaptada para desktop, tablet e mobile
- **Acessibilidade completa**: Navegação por teclado, leitores de tela, WCAG 2.1 AA
- **Central de Ajuda**: Documentação integrada com FAQ, atalhos de teclado e guias passo a passo

---

## Acesso Online

A aplicação está disponível online no GitHub Pages:

🔗 **[https://vgabrielsoares.github.io/lite-sheets-tdc/](https://vgabrielsoares.github.io/lite-sheets-tdc/)**

- Totalmente funcional offline (PWA)
- Instalável em dispositivos móveis e desktop
- Sem necessidade de cadastro ou login
- Dados salvos localmente no navegador

---

## Instalação e Execução Local

### 1. Clonando o repositório

```bash
git clone https://github.com/vgabrielsoares/lite-sheets-tdc.git
cd lite-sheets-tdc
```

### 2. Instalando dependências

```bash
npm install
```

### 3. Rodando localmente

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`.

### 4. Build para produção

```bash
# Build completo com validações
npm run predeploy

# Ou apenas build
npm run build

# Preview do build
npm run preview
```

### 5. Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento
npm run build            # Build de produção
npm run test             # Executar testes
npm run test:coverage    # Testes com coverage
npm run lint             # Verificar código
npm run lint:fix         # Corrigir código automaticamente
npm run format           # Formatar código
npm run type-check       # Verificar tipos TypeScript
```

---

## Testes

### Rodando testes unitários e de componentes

```bash
npm test
# ou
yarn test
```

Exemplo de teste com React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CriarFicha } from './CriarFicha';

test('cria e salva ficha', () => {
  render(<CriarFicha />);
  fireEvent.change(screen.getByPlaceholderText('Nome'), {
    target: { value: 'Aragorn' },
  });
  fireEvent.change(screen.getByPlaceholderText('Classe'), {
    target: { value: 'Ranger' },
  });
  fireEvent.change(screen.getByPlaceholderText('Nível'), {
    target: { value: 5 },
  });
  fireEvent.click(screen.getByText('Salvar'));
  expect(localStorage.getItem('ficha')).toContain('Aragorn');
});
```

---

## Deploy

A aplicação é automaticamente deployed no GitHub Pages através de GitHub Actions quando há um push na branch `main`.

### Deploy Automático

O workflow de CI/CD executa:

1. Validação de tipos TypeScript
2. Linter (ESLint)
3. Testes com coverage
4. Build de produção
5. Deploy no GitHub Pages

### Deploy Manual

Para fazer deploy manualmente, execute:

```bash
# Executar todas as validações e build
npm run predeploy

# Se tudo passar, faça push para main
git push origin main
```

### Documentação Completa

Para informações detalhadas sobre deploy, configuração e troubleshooting, consulte [DEPLOY.md](./DEPLOY.md).

---

## Central de Ajuda

O Lite Sheets TDC possui uma **Central de Ajuda integrada** acessível pelo menu de navegação (`/help`), com:

### Conteúdo Disponível

- **FAQ (Perguntas Frequentes)**: Respostas para dúvidas comuns sobre criação de fichas, salvamento, regras do sistema e resolução de problemas
- **Atalhos de Teclado**: Documentação completa de navegação por teclado, incluindo atalhos para edição, rolagem e navegação geral
- **Guia de Exportação/Importação**: Passo a passo detalhado para fazer backup e restaurar fichas, com dicas de segurança
- **Sistema de Rolagem**: Explicação da mecânica de dados, vantagem/desvantagem, modificadores e exemplos práticos

### Como Acessar

1. Clique em **"Ajuda"** no menu de navegação (ícone de interrogação)
2. Ou acesse diretamente em `/help` na URL
3. Escolha a seção desejada nas abas (desktop) ou dropdown (mobile)

## Acessibilidade

Este projeto segue as diretrizes **WCAG 2.1 Nível AA** para garantir acessibilidade para todos os usuários.

### Recursos de Acessibilidade

- **Navegação por teclado**: Totalmente navegável com Tab, Enter, Esc e teclas de seta
- **Atalhos documentados**: Central de Ajuda com todos os atalhos disponíveis
- **ARIA labels**: Elementos rotulados apropriadamente para leitores de tela
- **Contraste de cores**: Todos os textos atendem WCAG AA (≥4.5:1) em ambos os temas
- **Foco visível**: Indicadores claros de foco em todos os elementos interativos
- **Formulários acessíveis**: Labels associados, validação inline, mensagens de erro claras
- **Responsivo**: Funciona perfeitamente em 200% de zoom sem scroll horizontal
- **Semântica HTML**: Estrutura correta com landmarks (header, nav, main, aside)
- **Spinners de carregamento**: Feedback visual durante transições e carregamentos
- **Auto-save**: Salva automaticamente, sem necessidade de ação manual

### Testado com

- **Lighthouse**: Score de acessibilidade >90
- **Navegação por teclado**: Todas as funcionalidades acessíveis via Tab/Enter/Esc
- **NVDA**: Compatível com leitor de tela
- **Axe DevTools**: Sem erros críticos de acessibilidade

---

## Licença

Este projeto está sob a licença GNU General Public License v3.0. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## Contato

Desenvolvido por [Victor Gabriel Soares](https://github.com/vgabrielsoares) — contato via GitHub.

---

### Pontos de Atenção

- **Sincronização entre dispositivos**: Cada dispositivo mantém suas próprias fichas. Para compartilhar, utilize a exportação/importação em JSON.
- **Backup**: Exporte suas fichas periodicamente para evitar perdas.
- **Offline-first**: Teste e garanta funcionamento sem internet.
- **Acessibilidade e responsividade**: Interface adaptada para desktop e mobile.
- **Exportação/Importação de dados**: Suporte a formatos como JSON e CSV.
