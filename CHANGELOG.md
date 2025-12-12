# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- Configuração de deploy automático no GitHub Pages via GitHub Actions
- Workflow CI/CD com validações de tipo, linter, testes e build
- Documentação completa de deploy em `DEPLOY.md`
- Script `predeploy` para validações antes do deploy
- Script `build:production` com configuração de basePath
- Script `preview` para testar build localmente
- Arquivo `.nojekyll` para GitHub Pages

### Changed

- Ativado `output: 'export'` no `next.config.ts` para exportação estática
- Configurado `basePath` e `assetPrefix` para GitHub Pages
- Atualizado script `export` para usar apenas `next build`
- Atualizado README.md com informações de deploy e acesso online

### Fixed

- Configuração de exportação estática do Next.js
- Compatibilidade com GitHub Pages

---

## Versões Futuras

### [1.0.0] - MVP 1 (Planejado)

#### Added

- Sistema completo de gerenciamento de fichas de RPG
- Criação e edição de fichas com valores padrão de nível 1
- Sistema de abas para organização da ficha (8 abas)
- Sidebar retrátil para detalhamento de campos
- Persistência local com IndexedDB
- Sincronização automática Redux + IndexedDB
- Sistema de rolagem de dados (d20, d4, d6, d8, d10, d12, d100)
- Suporte a vantagem/desvantagem em rolagens
- Cálculos automáticos (defesa, modificadores, idiomas)
- Sistema de inventário completo com peso e capacidade
- Sistema de moedas com conversor
- Gerenciamento de PV/PP com valores temporários
- Economia de ações em combate
- Exportação/Importação de fichas em JSON
- PWA com funcionamento offline completo
- Service Worker para cache de assets
- Tema claro e escuro com paleta medieval/fantasy
- Interface responsiva (mobile, tablet, desktop)
- Acessibilidade completa (WCAG 2.1 AA)
- Navegação por teclado
- Central de Ajuda integrada
- Testes unitários e de integração (>80% coverage)

#### Características do Sistema

- **Atributos**: Agilidade, Constituição, Força, Influência, Mente, Presença (0-5+)
- **Habilidades**: 33 habilidades com 4 níveis de proficiência
- **Arquétipos**: 6 arquétipos (Acadêmico, Acólito, Combatente, Feiticeiro, Ladino, Natural)
- **Classes**: Sistema de multiclasse
- **Linhagens**: Customização de ancestralidade
- **Origens**: Background do personagem
- **Combate**: Sistema completo de ações e reações
- **Feitiços**: Gerenciamento de feitiços e PP
- **Progressão**: Sistema de níveis e XP

#### Limitações do MVP 1

- Aplicação de bônus de origem/linhagem é manual
- Progressão de nível é manual (sem automação)
- Biblioteca de feitiços não incluída (entrada manual)
- Sistema de iniciativa não automatizado

---

## Convenções de Versionamento

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades mantendo compatibilidade
- **PATCH**: Correções de bugs mantendo compatibilidade

## Categorias de Mudanças

- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de vulnerabilidades

---

**Última atualização**: 11/12/2025  
**Versão atual**: Em desenvolvimento (MVP 1)
