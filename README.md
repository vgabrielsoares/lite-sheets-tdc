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

- **Criação e edição de fichas**: Interface intuitiva para criar e editar fichas de RPG personalizadas.
- **Persistência local**: Fichas salvas no próprio navegador, sem necessidade de cadastro ou login.
- **Exportação/Importação**: Suporte a exportação/importação de fichas em JSON e CSV para backup e compartilhamento.
- **Offline-first**: Totalmente funcional sem conexão com a internet.
- **Responsividade e acessibilidade**: Interface adaptada para desktop e mobile, com foco em acessibilidade.
- **Instalação como app**: Pode ser instalado em dispositivos como um aplicativo nativo (PWA).

---

## Instalação e Execução

### 1. Clonando o repositório

```bash
git clone https://github.com/vgabrielsoares/lite-sheets-tdc.git
cd lite-sheets-tdc
```

### 2. Instalando dependências

```bash
# Usando npm
npm install
# ou usando yarn
yarn install
```

### 3. Rodando localmente

#### Next.js

```bash
npm run dev
# ou
yarn dev
```

O app estará disponível em `http://localhost:3000`.

#### CRA

```bash
npm start
# ou
yarn start
```

### 4. Build para produção

#### Next.js

```bash
npm run build && npm start
# ou
yarn build && yarn start
```

#### CRA

```bash
npm run build
# ou
yarn build
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
import { render, screen, fireEvent } from "@testing-library/react";
import { CriarFicha } from "./CriarFicha";

test("cria e salva ficha", () => {
  render(<CriarFicha />);
  fireEvent.change(screen.getByPlaceholderText("Nome"), {
    target: { value: "Aragorn" },
  });
  fireEvent.change(screen.getByPlaceholderText("Classe"), {
    target: { value: "Ranger" },
  });
  fireEvent.change(screen.getByPlaceholderText("Nível"), {
    target: { value: 5 },
  });
  fireEvent.click(screen.getByText("Salvar"));
  expect(localStorage.getItem("ficha")).toContain("Aragorn");
});
```

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
