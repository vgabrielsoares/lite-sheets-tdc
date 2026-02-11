# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.2] - v0.2 — Atualização de Regras (Livro v0.1.7)

### Added

- **Atributos reformulados**: 6 atributos (Agilidade, Corpo, Influência, Mente, Essência, Instinto) com 3 categorias (Físico, Mental, Espiritual)
- **Novo sistema de dados**: Pool de d6+ com contagem de sucessos (resultado ≥ 6 = ✶, resultado 1 cancela 1 sucesso)
- **Proficiência por dado**: Leigo (d6), Adepto (d8), Versado (d10), Mestre (d12)
- **Sistema de saúde dupla**: Guarda (GA) + Vitalidade (PV) substituem HP antigo
- **Dado de Vulnerabilidade**: Progressão d20→d12→d10→d8→d6→d4 em acertos críticos
- **Economia de ações**: Turno Rápido (2▶), Turno Lento (3▶), 1 Reação (↩), Ações Livres (∆)
- **Sistema de feitiços**: Pontos de Feitiço (PF) por círculo, toggle de Conjurador
- **Progressão por Arquétipos**: 6 arquétipos combinados em Classes
- **Wizard de criação**: Criação guiada de personagens com validação
- **Constantes de símbolos**: `src/constants/symbols.ts` — referência centralizada de ✶, ▶, ↩, ∆
- **Constantes de passos de dados**: `src/constants/diceSteps.ts` — 27 passos de progressão
- **Constantes de versão**: `src/constants/version.ts` — APP_VERSION, RULEBOOK_VERSION
- **Componente RulesReference**: Glossário de termos, tabelas de XP, custos de feitiço, sorte, apostas, alcances e passos de dados
- **Componente SystemPresentation**: Apresentação do universo e mecânicas na landing page
- **2 novas habilidades**: Sintonia (Essência, Combate) e Tenacidade (Corpo, Combate)
- **Habilidade de Sorte**: 7 níveis de progressão independente com tabela própria
- **Sistema de inventário atualizado**: Espaço (não peso), durabilidade por dado, 20 categorias de itens
- **Compra de proficiências**: Sistema de compra retroativa com pontos de atributo
- **Testes de resistência**: Determinação, Reflexo, Sintonia, Tenacidade, Vigor
- **Condições de combate**: Sistema completo de condições (Agarrado, Caído, Incapacitado, etc.)
- **Tamanhos de criatura**: Minúsculo a Colossal com modificadores de espaço

### Changed

- **Atributos**: Constituição→Corpo, Força→Corpo (maior valor), Presença→Essência, novo Instinto
- **Sistema de dados**: d20+mod substituído por pool de d6+ com contagem de sucessos
- **Defesa**: Valor fixo (15+Agi) substituído por teste ativo (Reflexo/Vigor)
- **Saúde**: PV único substituído por GA (escudo) + PV (vitalidade), PV = teto(GA/3)
- **PP base**: 2 (antes era 1)
- **Idiomas adicionais**: Mente - 1 (mínimo 0), antes era igual a Mente
- **Habilidades proficientes**: 3 + Mente (antes era 2 + Mente)
- **Habilidade de Assinatura**: +1d/+2d/+3d por faixa de nível, sem distinção combate/não-combate
- **Capacidade de carga**: Agora em "Espaço" (5 + 5×Corpo), não mais peso em kg
- **Moeda**: PO$ (Peças de Ouro) como padrão
- **Footer**: Exibe versão do app (v0.2) e versão do livro (v0.1.7)
- **DiceRollingGuide**: Reescrito para refletir mecânica de pool + sucessos
- **FAQ**: Atualizado com todas as mudanças de regras
- **HelpPage**: Nova aba "Referências" com glossário e tabelas

### Removed

- **Atributo Força**: Mesclado com Corpo
- **Atributo Constituição**: Renomeado para Corpo
- **Atributo Presença**: Renomeado para Essência
- **Habilidade Iniciativa**: Não existe mais no sistema
- **Sistema d20**: Substituído por pool de d6+
- **Triunfo/Desastre**: Mecânicas removidas do sistema
- **Modificadores numéricos**: Todos os modificadores são agora +Xd/-Xd
- **Defesa fixa**: Substituída por defesa ativa (teste)

---

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

- **Atributos**: Agilidade, Corpo, Influência, Mente, Essência, Instinto (0-5+)
- **Habilidades**: 33 habilidades com 4 níveis de proficiência (d6, d8, d10, d12)
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

**Última atualização**: 2025-07-08
**Versão atual**: v0.2 (Livro v0.1.7)
