'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme, App } from 'antd';
import { store, persistor } from './index';
import { queryClient } from '../lib/queryClient';

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={customTheme}>
            <App>{children}</App>
          </ConfigProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
