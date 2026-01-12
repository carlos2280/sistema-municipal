import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import {
	type PropsWithChildren,
	createContext,
	useMemo,
	useState,
} from "react";
import { darkTheme, lightTheme } from "./theme";

type ThemeContextType = {
	toggleTheme: () => void;
	isDarkTheme: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
	toggleTheme: () => {},
	isDarkTheme: false,
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	// Leer preferencia de localStorage al inicializar
	const [isDarkTheme, setIsDarkTheme] = useState(() => {
		const saved = localStorage.getItem("darkMode");
		return saved ? JSON.parse(saved) : false;
	});

	const theme = useMemo(
		() => (isDarkTheme ? darkTheme : lightTheme),
		[isDarkTheme],
	);

	const toggleTheme = () => {
		setIsDarkTheme((prev) => {
			const newValue = !prev;
			// Guardar en localStorage
			localStorage.setItem("darkMode", JSON.stringify(newValue));
			return newValue;
		});
	};

	return (
		<ThemeContext.Provider value={{ toggleTheme, isDarkTheme }}>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
};
