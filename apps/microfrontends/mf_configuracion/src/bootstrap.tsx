import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'mf_store/store';

const { store } = createStore();

// biome-ignore lint/style/noNonNullAssertion: DOM entry point garantizado
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <div style={{ padding: 24 }}>
        <h2>mf_configuracion — modo standalone</h2>
      </div>
    </Provider>
  </StrictMode>,
);
