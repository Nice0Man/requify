import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { AppRouterWithRedux } from './router/AppRouterWithRedux';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouterWithRedux />
    </AppProviders>
  );
}; 