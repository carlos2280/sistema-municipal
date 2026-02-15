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
const { store, persistor } = createStore();

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error('No se encontró el elemento con id="root"');
}

createRoot(rootElement).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ThemeProvider>
					<App />
					<Toaster position="top-center" richColors />
				</ThemeProvider>
			</PersistGate>
		</Provider>
	</StrictMode>,
);
