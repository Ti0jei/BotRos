import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications'; // ✅ добавлено
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css'; // ✅ обязательно

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Notifications position="top-center" zIndex={1000} /> {/* ✅ подключили */}
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
