# Lite Sheets TDC

**Versão**: 0.2

Sistema de criação e gerenciamento de fichas de RPG para **Tabuleiro do Caos** totalmente no navegador, com experiência PWA, funcionamento offline, responsividade e foco em acessibilidade. Ideal para jogadores e mestres que buscam praticidade, performance e facilidade de uso, sem depender de backend ou banco de dados externo.

---

## Tecnologias Utilizadas

### Core Framework

- **React 19.2.0**: Biblioteca principal para construção da interface, utilizando componentes reutilizáveis e JSX
- **Next.js 16.0.1**: Framework para React com rotas automáticas, exportação estática e suporte a PWA
- **TypeScript 5.9.3**: Tipagem estática para maior robustez e manutenção

### Estado e Persistência

- **Redux Toolkit 2.10.1**: Gerenciamento de estado global
- **redux-persist 6.0.0**: Persistência do estado Redux
- **Dexie.js 4.2.1**: Wrapper do IndexedDB para armazenar fichas no navegador
- **Middleware customizado**: Sincronização automática Redux ↔ IndexedDB

### UI/UX

- **Material UI (MUI) 7.3.5**: Biblioteca de componentes React
- **Emotion**: Estilização CSS-in-JS
- **Temas customizados**: Claro/Escuro com paleta medieval/fantasy

### Testes

- **Jest 30.2.0**: Framework de testes unitários
- **React Testing Library 16.3.0**: Testes de componentes
- **fake-indexeddb 6.2.5**: Mock do IndexedDB para testes
- **~97 arquivos de teste**: Cobrindo utils, componentes, hooks, serviços e integração
- **Cobertura**: 66%+ em código crítico

### PWA

- **@ducanh2912/next-pwa 10.2.9**: Configuração de Service Worker
- **manifest.json**: Metadados para instalação
- **Cache estratégico**: Fontes, imagens, assets estáticos
- **Offline-first**: Totalmente funcional sem internet

---

## Funcionalidades

### Gerenciamento de Fichas

- **Criação e edição de fichas**: Interface intuitiva para criar e editar fichas de RPG personalizadas com valores padrão do sistema Tabuleiro do Caos
- **Persistência local**: Fichas salvas no próprio navegador usando IndexedDB, sem necessidade de cadastro ou login
- **Exportação/Importação**: Sistema completo de backup em JSON para portabilidade e compartilhamento entre dispositivos
- **Sistema de abas**: Ficha organizada em 8 abas (Principal, Combate, Arquétipos, Recursos, Inventário, Feitiços, Descrição, Anotações)

### Sistema de Jogo

- **Rolagem de dados**: Sistema integrado de pool de d6+ com contagem de sucessos (✶), suporte a diferentes tamanhos de dado por proficiência (d6/d8/d10/d12) e modificadores de quantidade de dados (+Xd/-Xd)
- **6 Atributos**: Agilidade (Agi), Corpo (Cor), Influência (Inf), Mente (Men), Essência (Ess), Instinto (Ins) — organizados em 3 categorias: Físico, Mental, Espiritual
- **Cálculos automáticos**: Guarda (GA), Vitalidade (PV = piso(GA/3)), modificadores de habilidades, idiomas baseados em Mente-1, capacidade de carga baseada em Corpo, e mais
- **Gerenciamento de recursos**: Controle de GA/PV/PP (e PF para conjuradores), dados de recurso (água, comida, tochas, flechas, etc.), economia de ações em combate (Turno Rápido/Lento, Reações, Ações Livres)
- **33 Habilidades**: Proficiências determinam o tamanho do dado rolado (Leigo=d6, Adepto=d8, Versado=d10, Mestre=d12). Novas habilidades: Sintonia (Ess) e Tenacidade (Cor). Iniciativa foi removida.
- **Inventário completo**: Sistema de moedas, itens com durabilidade (dados de recurso d2-d100), espaço de carga (não mais peso), 20 categorias de itens

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
# Build completo com validações (recomendado antes de deploy)
npm run predeploy

# Ou apenas build de produção
npm run build:production

# Ou build padrão
npm run build

# Preview do build
npm run preview
```

### 5. Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento (localhost:3000)

# Build
npm run build            # Build Next.js padrão
npm run build:production # Build com basePath para GitHub Pages
npm run export           # Exportação estática (alias para build)
npm run preview          # Preview do build localmente

# Qualidade de Código
npm run type-check       # Verificar tipos TypeScript (zero erros no MVP 1)
npm run lint             # ESLint
npm run lint:fix         # Corrigir automaticamente problemas de lint
npm run format           # Prettier - formatar código
npm run format:check     # Verificar formatação sem modificar

# Testes
npm run test             # Executar todos os testes (Jest)
npm run test:watch       # Modo watch
npm run test:coverage    # Testes com relatório de cobertura

# Deploy
npm run predeploy        # Validações completas: type-check + lint + test + build

# Utilidades
npm run validate:pwa     # Validar configuração PWA
npm run generate:icons   # Abrir gerador de ícones
```

---

## Testes

### Estatísticas

- **Total de arquivos de teste**: ~97 arquivos
- **Categorias**:
  - Testes unitários (utils, cálculos, validadores)
  - Testes de componentes (UI, formulários, displays)
  - Testes de integração (fluxos completos, persistência, Redux)
  - Testes de hooks customizados
  - Testes de serviços (export/import, backup, IndexedDB)
- **Cobertura**: 66%+ em código crítico de negócio
- **Status MVP 1**: 2073/2087 testes passando (99.33%)

### Rodando testes

```bash
# Executar todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage

# Teste específico
npm test -- src/utils/__tests__/calculations.test.ts

# Com filtro de nome
npm test -- --testNamePattern="calculateDefense"
```

### Exemplo de teste

```tsx
import { render, screen } from '@testing-library/react';
import { CharacterCard } from './CharacterCard';
import { createDefaultCharacter } from '@/utils';

test('deve exibir informações básicas do personagem', () => {
  const character = createDefaultCharacter({ name: 'Aragorn' });
  render(<CharacterCard character={character} />);

  expect(screen.getByText('Aragorn')).toBeInTheDocument();
  expect(screen.getByText(/Nível 1/)).toBeInTheDocument();
});
```

---

## Deploy

A aplicação é automaticamente deployed no GitHub Pages através de GitHub Actions quando há um push na branch `main`.

### Deploy Automático (GitHub Actions)

O workflow `.github/workflows/deploy.yml` executa:

1. **Checkout** do código
2. **Setup Node.js 20** com cache npm
3. **Instalação** de dependências (`npm ci`)
4. **Type-check** TypeScript (continua mesmo com erros)
5. **Linter** ESLint
6. **Testes** Jest
7. **Build** de produção (`npm run build:production`)
8. **Deploy** no GitHub Pages

### Deploy Manual

Para fazer deploy manualmente:

```bash
# 1. Executar todas as validações e build
npm run predeploy

# 2. Se tudo passar, commit e push para main
git add .
git commit -m "Deploy: descrição das mudanças"
git push origin main

# 3. O workflow será disparado automaticamente
```

### Configuração

- **Exportação estática**: `output: 'export'` no `next.config.ts`
- **Base path**: `/lite-sheets-tdc` (variável `NEXT_PUBLIC_BASE_PATH`)
- **Asset prefix**: Configurado para GitHub Pages
- **Arquivo `.nojekyll`**: Presente para evitar processamento Jekyll

---

## Central de Ajuda

O Lite Sheets TDC possui uma **Central de Ajuda integrada** acessível pelo menu de navegação ou rota `/help`:

### Conteúdo Disponível

- **FAQ (Perguntas Frequentes)**: Respostas para dúvidas comuns sobre:
  - Criação e edição de fichas
  - Como o salvamento funciona (IndexedDB)
  - Regras do sistema Tabuleiro do Caos
  - Resolução de problemas comuns
  - Compatibilidade de navegadores

- **Atalhos de Teclado**: Documentação completa de navegação:
  - Navegação geral (Tab, Enter, Esc)
  - Edição de campos (Enter para editar, Esc para cancelar)
  - Rolagem de dados (Shift+D para rolar pool de dados)
  - Atalhos de acessibilidade

- **Guia de Exportação/Importação**: Passo a passo detalhado:
  - Como fazer backup das fichas (JSON)
  - Como restaurar fichas de backup
  - Compartilhamento entre dispositivos
  - Dicas de segurança e boas práticas

- **Sistema de Rolagem**: Explicação da mecânica:
  - Rolagem pool de d6+ com contagem de sucessos (✶)
  - Tamanho de dado por proficiência (d6/d8/d10/d12)
  - Modificadores de quantidade de dados (+Xd/-Xd)
  - Contagem de sucessos: resultados ≥ 6 = 1✶, resultados 1 cancelam 1✶
  - Limite de 8 dados por teste
  - Atributo 0: role 2d e escolha o menor
  - Exemplos práticos com pool de dados

### Como Acessar

1. Clique no ícone **Ajuda** no menu de navegação
2. Ou acesse diretamente: `https://vgabrielsoares.github.io/lite-sheets-tdc/help`
3. Interface adaptativa:
   - **Desktop**: Abas horizontais
   - **Mobile**: Dropdown seletor

## Acessibilidade

Este projeto segue as diretrizes **WCAG 2.1 Nível AA** para garantir acessibilidade para todos os usuários.

### Recursos de Acessibilidade

#### Navegação

- **Totalmente navegável por teclado**: Tab, Shift+Tab, Enter, Esc, setas
- **Skip links**: Pular para conteúdo principal (componente `SkipLink`)
- **Foco visível**: Indicadores claros em todos os elementos interativos
- **Atalhos documentados**: Central de Ajuda com referência completa
- **Ordem lógica de foco**: Sequência natural de navegação

#### Leitores de Tela

- **ARIA labels**: Elementos rotulados apropriadamente
- **ARIA landmarks**: Estrutura semântica (header, nav, main, aside)
- **ARIA live regions**: Feedback de ações (toasts, alertas)
- **Roles apropriados**: Buttons, links, dialogs, tabs
- **Descrições contextuais**: `aria-describedby` em formulários

#### Visual

- **Contraste WCAG AA**: ≥4.5:1 em todos os textos
- **Temas Claro/Escuro**: Paleta testada em ambos os modos
- **Zoom 200%**: Funciona sem scroll horizontal
- **Sem dependência de cor**: Informação não depende apenas de cor
- **Fonte legível**: Roboto com tamanhos apropriados

#### Formulários

- **Labels associados**: Todos os inputs têm labels vinculados
- **Validação inline**: Feedback imediato e claro
- **Mensagens de erro**: Descritivas e acionáveis
- **Auto-save**: Salvamento automático (debounced)
- **Confirmações**: Dialogs para ações destrutivas

### Testado com

- **Lighthouse**: Score de acessibilidade >90 (validado manualmente)
- **Navegação por teclado**: Todas as funcionalidades testadas
- **NVDA/JAWS**: Compatível com leitores de tela
- **Axe DevTools**: Sem erros críticos de acessibilidade
- **Dispositivos reais**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

---

## Documentação Adicional

- **[CHANGELOG.md](./CHANGELOG.md)**: Histórico de versões e mudanças
- **Base Files**: Documentos de referência do sistema Tabuleiro do Caos em `base-files/`
  - `v0.2.md`: Regras completas da v0.2 (1680 linhas)
  - `regras-basicas.md`: Regras básicas atualizadas do jogo
  - `mvp-um.md`: Especificações do MVP 1

---

## Pontos de Atenção

### Persistência e Backup

- **Dados locais**: Fichas armazenadas no IndexedDB do navegador (não há servidor)
- **Por dispositivo**: Cada navegador/dispositivo mantém suas próprias fichas
- **Backup essencial**: Exporte periodicamente em JSON para evitar perda de dados
- **Compartilhamento**: Use exportação/importação JSON para transferir entre dispositivos
- **Limpar dados**: Limpar dados do navegador apaga as fichas (faça backup antes!)

### Compatibilidade

- **Navegadores modernos**: Chrome, Firefox, Safari, Edge (versões recentes)
- **IndexedDB**: Necessário para funcionamento (disponível em todos os navegadores modernos)
- **PWA**: Instalável em Android, iOS, Windows, macOS, Linux
- **Internet Explorer**: Não suportado

### Performance

- **Offline-first**: Totalmente funcional sem internet após primeira visita
- **Bundle otimizado**: <500KB de JavaScript (target MVP 1)
- **Lazy loading**: Componentes carregados sob demanda
- **React 19**: Performance otimizada com Concurrent Features

---

## Licença

Este projeto está sob a licença **GNU General Public License v3.0**.

Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## Autor

**Victor Gabriel Soares**

- GitHub: [@vgabrielsoares](https://github.com/vgabrielsoares)
- Projeto: [lite-sheets-tdc](https://github.com/vgabrielsoares/lite-sheets-tdc)

---

## Agradecimentos

- Sistema RPG: **Tabuleiro do Caos**
- Comunidade React/Next.js
- Material UI team
- Todos os colaboradores e jogadores que testaram o sistema
