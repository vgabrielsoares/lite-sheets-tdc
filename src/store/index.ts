/**
 * Redux Store Configuration
 *
 * Configura o store do Redux com Redux Toolkit e redux-persist
 * para sincronização com IndexedDB.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Importa os reducers
import charactersReducer from '@/features/characters/charactersSlice';
import appReducer from '@/features/app/appSlice';

/**
 * Configuração do redux-persist
 */
const persistConfig = {
  key: 'lite-sheets-tdc',
  version: 1,
  storage,
  // Whitelist: apenas o que deve ser persistido
  whitelist: ['characters', 'app'],
  // Blacklist: o que não deve ser persistido
  blacklist: [],
};

/**
 * Combina todos os reducers
 */
const rootReducer = combineReducers({
  characters: charactersReducer,
  app: appReducer,
});

/**
 * Reducer persistido
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configuração do store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora estas actions do redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Persistor do store
 */
export const persistor = persistStore(store);

/**
 * Tipos exportados para uso em toda a aplicação
 */

/** Tipo do estado global da aplicação */
export type RootState = ReturnType<typeof store.getState>;

/** Tipo do dispatch */
export type AppDispatch = typeof store.dispatch;

/**
 * Exporta o store como default
 */
export default store;
