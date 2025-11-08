/**
 * Jest Setup File
 *
 * Configurações globais para todos os testes
 */

import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock do crypto.randomUUID para Node.js
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => {
        // Implementação simples de UUID v4 para testes
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      },
    },
    writable: true,
    configurable: true,
  });
}

// Polyfill para structuredClone (necessário para fake-indexeddb)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function structuredClone(value: any) {
    return JSON.parse(JSON.stringify(value));
  };
}
