import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/createWebStorage';
import cartReducer from './slices/cartSlice';
import posSessionReducer from './slices/posSessionSlice';

// SSR-safe storage for Next.js
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const safeStorage = typeof window !== 'undefined' ? storage('local') : createNoopStorage();

const rootReducer = combineReducers({
  cart: cartReducer,
  posSession: posSessionReducer,
});

const persistConfig = {
  key: 'hotel_pos_root',
  version: 1,
  storage: safeStorage,
  whitelist: ['cart', 'posSession'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
