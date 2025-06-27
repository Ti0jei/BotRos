import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          fontFamily: 'Inter, sans-serif',
          primaryColor: 'pink',
          colors: {
            pink: [
              '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1',
              '#f783ac', '#f06595', '#e64980', '#d6336c',
              '#c2255c', '#a61e4d',
            ],
          },
        }}
      >
        <ModalsProvider>
          <Notifications position="top-center" zIndex={1000} />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
