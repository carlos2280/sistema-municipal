import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ForwardedRef, ReactNode } from "react";

interface MainCardProps {
	border?: boolean;
	boxShadow?: boolean;
	children?: ReactNode;
	content?: boolean;
	contentClass?: string;
	contentSX?: SxProps<Theme>;
	headerSX?: SxProps<Theme>;
	darkTitle?: boolean;
	secondary?: ReactNode;
	shadow?: string;
	sx?: SxProps<Theme>;
	title?: ReactNode | string;
	ref?: ForwardedRef<HTMLDivElement>;
	[key: string]: unknown; // Para otros props que se pasen al Card
}

const headerStyle: SxProps<Theme> = {
	"& .MuiCardHeader-action": { mr: 0 },
};

function MainCard({
	border = false,
	boxShadow,
	children,
	content = true,
	contentClass = "",
	contentSX = {},
	headerSX = {},
	darkTitle,
	secondary,
	shadow,
	sx = {},
	title,
	ref,
	...others
}: MainCardProps) {
	const defaultShadow = "0 2px 14px 0 rgb(32 40 45 / 8%)";

	return (
		<Card
			ref={ref}
			{...others}
			sx={{
				border: border ? "1px solid" : "none",
				borderColor: "divider",
				":hover": {
					boxShadow: boxShadow ? shadow || defaultShadow : "inherit",
				},
				...sx,
			}}
		>
			{/* card header and action */}
			{!darkTitle && title && (
				<CardHeader
					sx={{ ...headerStyle, ...headerSX } as SxProps<Theme>}
					title={title}
					action={secondary}
				/>
			)}
			{darkTitle && title && (
				<CardHeader
					sx={{ ...headerStyle, ...headerSX } as SxProps<Theme>}
					title={<Typography variant="h3">{title}</Typography>}
					action={secondary}
				/>
			)}

			{/* content & header divider */}
			{title && <Divider />}

			{/* card content */}
			{content ? (
				<CardContent sx={contentSX} className={contentClass}>
					{children}
				</CardContent>
			) : (
				children
			)}
		</Card>
	);
}

export default MainCard;
