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
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: '10px',
              fontFamily: '"Plus Jakarta Sans", Roboto, sans-serif',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              padding: '12px 16px',
              fontSize: '0.875rem',
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
