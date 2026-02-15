import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import { createStore } from 'mf_store/store';
import { Toaster } from 'sonner';
import App from './App.tsx';
import theme from './theme/theme';
const { store } = createStore();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: '#e3f2fd', // fondo azul claro como Paper de MUI
              color: '#0d47a1', // texto azul fuerte
              borderRadius: '8px',
              fontFamily: 'Roboto, sans-serif',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              padding: '12px 16px',
            },
            classNames: {
              title: 'font-bold',
              description: 'text-sm',
              actionButton:
                'ml-4 px-3 py-1 rounded bg-[#1976d2] text-white hover:bg-[#1565c0] transition-colors',
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
