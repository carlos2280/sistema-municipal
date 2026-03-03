import { createContext, useContext } from "react";
import type { Persistor } from "redux-persist";

const PersistorContext = createContext<Persistor | null>(null);

export const PersistorProvider = PersistorContext.Provider;

export function usePersistor(): Persistor {
	const persistor = useContext(PersistorContext);
	if (!persistor) {
		throw new Error("usePersistor debe usarse dentro de PersistorProvider");
	}
	return persistor;
}
