import { Card, CardContent, CardHeader, type CardProps } from "@mui/material";
import type { ReactNode } from "react";

interface StyledCardProps extends Omit<CardProps, "title"> {
	title?: string;
	subtitle?: string;
	actions?: ReactNode;
	noPadding?: boolean;
}

export const StyledCard = ({
	title,
	subtitle,
	actions,
	children,
	noPadding = false,
	sx,
	...props
}: StyledCardProps) => {
	return (
		<Card
			{...props}
			sx={{
				border: 1,
				borderColor: "divider",
				boxShadow:
					"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
				"&:hover": {
					boxShadow:
						"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
				},
				transition: "box-shadow 0.2s ease-in-out",
				...sx,
			}}
		>
			{(title || actions) && (
				<CardHeader
					title={title}
					subheader={subtitle}
					action={actions}
					sx={{
						borderBottom: 1,
						borderColor: "divider",
						"& .MuiCardHeader-title": {
							fontSize: "1.125rem",
							fontWeight: 600,
						},
						"& .MuiCardHeader-subheader": {
							fontSize: "0.875rem",
						},
					}}
				/>
			)}
			{noPadding ? (
				children
			) : (
				<CardContent
					sx={{
						p: 3,
						"&:last-child": { pb: 3 },
					}}
				>
					{children}
				</CardContent>
			)}
		</Card>
	);
};
