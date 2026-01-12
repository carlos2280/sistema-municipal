import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
}

export const PageHeader = ({
	title,
	subtitle,
	breadcrumbs,
	actions,
}: PageHeaderProps) => {
	return (
		<Box
			sx={{
				mb: 3,
				pb: 2,
				borderBottom: 1,
				borderColor: "divider",
			}}
		>
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumbs
					separator={<ChevronRightIcon sx={{ fontSize: 16 }} />}
					sx={{ mb: 1.5 }}
					aria-label="breadcrumb"
				>
					<Link
						href="/"
						underline="hover"
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							color: "text.secondary",
							"&:hover": { color: "primary.main" },
						}}
					>
						<HomeIcon sx={{ fontSize: 16 }} />
						Inicio
					</Link>
					{breadcrumbs.map((item) =>
						item.href ? (
							<Link
								key={item.label}
								href={item.href}
								underline="hover"
								sx={{
									color: "text.secondary",
									"&:hover": { color: "primary.main" },
								}}
							>
								{item.label}
							</Link>
						) : (
							<Typography
								key={item.label}
								color="text.primary"
								fontWeight={500}
							>
								{item.label}
							</Typography>
						),
					)}
				</Breadcrumbs>
			)}

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 2,
					flexWrap: "wrap",
				}}
			>
				<Box>
					<Typography
						variant="h4"
						component="h1"
						sx={{
							fontWeight: 700,
							color: "text.primary",
							mb: subtitle ? 0.5 : 0,
						}}
					>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body1" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>

				{actions && <Box sx={{ display: "flex", gap: 1.5 }}>{actions}</Box>}
			</Box>
		</Box>
	);
};
