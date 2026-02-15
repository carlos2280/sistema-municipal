import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { createStore } from 'mf_store/store'
import { ThemeProvider } from 'mf_ui/theme'
import App from './App'
import './index.css'

const { store } = createStore()

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider>
          <App />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  )
}
