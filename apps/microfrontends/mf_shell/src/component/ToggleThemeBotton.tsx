import { IconButton, Tooltip } from "@mui/material";
import { ThemeContext } from "mf_ui/theme";
import { useContext } from "react";
import { getIconLucile } from "../utils/IconDynamicLucile";

export const ToggleThemeButton = () => {
	const { toggleTheme, isDarkTheme } = useContext(ThemeContext);

	return (
		<Tooltip title={isDarkTheme ? "Modo claro" : "Modo oscuro"}>
			<IconButton onClick={toggleTheme} color="inherit">
				{isDarkTheme ? getIconLucile("moon") : getIconLucile("sun-dim")}
			</IconButton>
		</Tooltip>
	);
};
