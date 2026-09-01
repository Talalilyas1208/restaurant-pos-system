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
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import cartReducer from './slices/cartSlice';
import posSessionReducer from './slices/posSessionSlice';

// ─── SSR-safe localStorage for Next.js ────────────────────────────────────────
// createWebStorage('local') works in the browser; on the server (SSR) we swap
// it for a noop so redux-persist doesn't crash during server rendering.
const createNoopStorage = () => ({
  getItem: (_key: string) => Promise.resolve<string | null>(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
});

const safeStorage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// ─── Root Reducer ─────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  cart: cartReducer,
  posSession: posSessionReducer,
});

// ─── Redux Persist Config ─────────────────────────────────────────────────────
const persistConfig = {
  key: 'hotel_pos_root',
  version: 1,
  storage: safeStorage,
  whitelist: ['cart', 'posSession'], // only these slices are persisted to localStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions are intentionally non-serializable
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ─── TypeScript Helpers ───────────────────────────────────────────────────────
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — use these instead of plain useDispatch / useSelector everywhere
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

