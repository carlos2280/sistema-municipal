/**
 * AuthFooter — Hint de teclado MERIDIAN
 *
 * Muestra "Enter para continuar" con badge kbd estilizado.
 */

import { Box, styled } from "@mui/material";
import { memo } from "react";

const FooterRoot = styled(Box)(({ theme }) => ({
	textAlign: "center",
	fontSize: 11,
	color: theme.meridian.text.tx4,
	marginTop: 12,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 5,
}));

const Kbd = styled("kbd")(({ theme }) => ({
	fontFamily: theme.typography.number?.fontFamily,
	fontSize: 10,
	background: theme.meridian.surfaces.s3,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 4,
	padding: "2px 6px",
	color: theme.palette.text.disabled,
}));

export const AuthFooter = memo(function AuthFooter() {
	return (
		<FooterRoot>
			<Kbd>Enter</Kbd>
			<span>para continuar</span>
		</FooterRoot>
	);
});
