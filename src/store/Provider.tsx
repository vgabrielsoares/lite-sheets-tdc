/**
 * Redux Provider Component
 *
 * Provider do Redux com suporte a redux-persist.
 * Deve envolver a aplicação para disponibilizar o store.
 */

'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';

/**
 * Props do ReduxProvider
 */
interface ReduxProviderProps {
  /** Componentes filhos */
  children: ReactNode;
}

/**
 * Provider do Redux com persistência
 *
 * Este componente deve envolver toda a aplicação para disponibilizar
 * o Redux store e garantir a persistência do estado.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <html lang="pt-BR">
 *       <body>
 *         <ReduxProvider>
 *           {children}
 *         </ReduxProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export default ReduxProvider;
