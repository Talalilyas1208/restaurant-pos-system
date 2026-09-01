'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ConfigProvider, theme, App, Spin } from 'antd';
import { store, persistor } from './index';
import { queryClient, persister } from '../lib/queryClient';

// ─── Ant Design Custom Theme ──────────────────────────────────────────────────
const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#f97316',
    colorInfo: '#f97316',
    colorSuccess: '#22c55e',
    colorWarning: '#eab308',
    colorError: '#ef4444',
    colorBgBase: '#0b0f19',
    colorBgContainer: '#131b2e',
    colorBgElevated: '#1a233a',
    colorBorder: '#27354f',
    colorBorderSecondary: '#1e293b',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: 12,
    fontFamily: 'inherit',
  },
  components: {
    Button: {
      colorPrimary: '#f97316',
      algorithm: true,
      controlHeight: 40,
      borderRadius: 10,
    },
    Card: {
      colorBgContainer: '#131b2e',
      colorBorderSecondary: '#1e293b',
      borderRadiusLG: 16,
    },
    Modal: {
      contentBg: '#131b2e',
      headerBg: '#131b2e',
      borderRadiusLG: 20,
    },
    Drawer: {
      colorBgElevated: '#131b2e',
    },
    Table: {
      colorBgContainer: '#131b2e',
      headerBg: '#1a233a',
      headerColor: '#cbd5e1',
      rowHoverBg: '#1e293b',
    },
    Tabs: {
      colorPrimary: '#f97316',
      itemSelectedColor: '#f97316',
      itemHoverColor: '#fb923c',
    },
    Input: {
      colorBgContainer: '#1a233a',
      colorBorder: '#27354f',
    },
    Select: {
      colorBgContainer: '#1a233a',
      colorBorder: '#27354f',
    },
    Segmented: {
      itemSelectedBg: '#f97316',
      itemSelectedColor: '#ffffff',
      colorBgLayout: '#1a233a',
    },
  },
};

// ─── Providers ────────────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* PersistGate defers Redux-persisted state rehydration until after mount */}
      <PersistGate loading={null} persistor={persistor}>
        {/*
          PersistQueryClientProvider restores the React Query cache from localStorage
          before the first render. `persister` is undefined on the server (SSR-safe).
          On client, stale cache (older than `maxAge`) is discarded automatically.
        */}
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: persister!,
            maxAge: 5 * 60 * 1000, // Discard cache entries older than 5 minutes
            buster: 'v1',          // Increment this to force-clear old cache on deploy
          }}
          onSuccess={() => {
            // Background-refetch all queries once cache is restored,
            // so users always see fresh data after the initial instant load.
            queryClient.resumePausedMutations().then(() => {
              queryClient.invalidateQueries();
            });
          }}
        >
          <ConfigProvider theme={customTheme}>
            <App>
              {children}
            </App>
          </ConfigProvider>
        </PersistQueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

