import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./fonts.css";
import { createStore } from "mf_store/store";
import { ThemeProvider } from "mf_ui/theme";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { PersistorProvider } from "./context/PersistorContext";

const { store, persistor } = createStore();

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error('No se encontró el elemento con id="root"');
}

createRoot(rootElement).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<PersistorProvider value={persistor}>
					<ThemeProvider>
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
				</PersistorProvider>
			</PersistGate>
		</Provider>
	</StrictMode>,
);
