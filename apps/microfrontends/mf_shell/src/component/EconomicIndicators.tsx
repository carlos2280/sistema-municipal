import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
	Box,
	Divider,
	Fade,
	Paper,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";
import type React from "react";
import { useState } from "react";

// Interfaces
interface CurrencyData {
	code: string;
	name: string;
	value: number;
	previousValue: number;
	lastUpdate: string;
	trend: "up" | "down" | "stable";
}

interface EconomicIndicatorsProps {
	uf?: CurrencyData;
	usd?: CurrencyData;
	showTooltip?: boolean;
	compact?: boolean;
	className?: string;
}

// Animations
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled Components
const IndicatorContainer = styled(Paper)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(2),
	padding: theme.spacing(1, 2),
	backgroundColor: alpha(theme.palette.background.paper, 0.8),
	backdropFilter: "blur(8px)",
	border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
	borderRadius: theme.spacing(1),
	boxShadow: theme.shadows[1],
	transition: "all 0.2s ease-in-out",
	"&:hover": {
		boxShadow: theme.shadows[4],
		transform: "translateY(-1px)",
	},
}));

const PulseIndicator = styled(FiberManualRecordIcon)(({ theme }) => ({
	fontSize: "8px",
	color: theme.palette.success.main,
	animation: `${pulse} 2s infinite`,
}));

const CurrencyItem = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(0.75),
}));

const TooltipContent = styled(Box)(({ theme }) => ({
	padding: theme.spacing(2),
	minWidth: 280,
}));

const TrendIcon = styled(Box)<{ trend: "up" | "down" | "stable" }>(
	({ theme, trend }) => ({
		display: "flex",
		alignItems: "center",
		color:
			trend === "up"
				? theme.palette.success.main
				: trend === "down"
					? theme.palette.error.main
					: theme.palette.grey[500],
		fontSize: "14px",
	}),
);

// Utility functions
const formatCurrency = (value: number, currency = "CLP"): string => {
	return new Intl.NumberFormat("es-CL", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
};

const formatDateTime = (dateString: string): string => {
	return new Intl.DateTimeFormat("es-CL", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(dateString));
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
	switch (trend) {
		case "up":
			return <TrendingUpIcon fontSize="inherit" />;
		case "down":
			return <TrendingDownIcon fontSize="inherit" />;
		default:
			return null;
	}
};

const calculateChange = (current: number, previous: number): number => {
	return ((current - previous) / previous) * 100;
};

// Default data
const defaultUF: CurrencyData = {
	code: "UF",
	name: "Unidad de Fomento",
	value: 37245.67,
	previousValue: 37198.45,
	lastUpdate: "2025-06-15T09:30:00",
	trend: "up",
};

const defaultUSD: CurrencyData = {
	code: "USD",
	name: "Dólar Americano",
	value: 950.32,
	previousValue: 948.75,
	lastUpdate: "2025-06-15T09:30:00",
	trend: "up",
};

// Tooltip content component
const CurrencyTooltip: React.FC<{ currency: CurrencyData }> = ({
	currency,
}) => {
	const change = calculateChange(currency.value, currency.previousValue);

	return (
		<TooltipContent>
			<Stack spacing={2}>
				<Box>
					<Typography variant="subtitle2" fontWeight={600} color="text.primary">
						{currency.name} ({currency.code})
					</Typography>
					<Typography variant="h6" color="success.main" fontWeight={600}>
						{formatCurrency(currency.value)}
					</Typography>
				</Box>

				<Divider />

				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography variant="body2" color="text.secondary">
						Cambio:
					</Typography>
					<Box display="flex" alignItems="center" gap={0.5}>
						<TrendIcon trend={currency.trend}>
							{getTrendIcon(currency.trend)}
						</TrendIcon>
						<Typography
							variant="body2"
							color={change >= 0 ? "success.main" : "error.main"}
							fontWeight={500}
						>
							{change >= 0 ? "+" : ""}
							{change.toFixed(2)}%
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" justifyContent="space-between">
					<Typography variant="body2" color="text.secondary">
						Valor anterior:
					</Typography>
					<Typography variant="body2" color="text.primary">
						{formatCurrency(currency.previousValue)}
					</Typography>
				</Stack>

				<Divider />

				<Typography variant="caption" color="text.secondary" textAlign="center">
					Actualizado: {formatDateTime(currency.lastUpdate)}
				</Typography>
			</Stack>
		</TooltipContent>
	);
};

// Main component
const EconomicIndicators: React.FC<EconomicIndicatorsProps> = ({
	uf = defaultUF,
	usd = defaultUSD,
	showTooltip = true,
	compact = false,
	className,
}) => {
	const theme = useTheme();
	const [tooltipOpen, setTooltipOpen] = useState(false);

	const CurrencyDisplay: React.FC<{ currency: CurrencyData }> = ({
		currency,
	}) => (
		<CurrencyItem>
			<Typography
				variant="caption"
				fontWeight={600}
				color="text.secondary"
				sx={{ minWidth: "fit-content" }}
			>
				{currency.code}:
			</Typography>
			<Typography variant="body2" fontWeight={500} color="success.main">
				{compact
					? formatCurrency(currency.value).replace(/\s/g, "")
					: formatCurrency(currency.value)}
			</Typography>
			{!compact && (
				<TrendIcon trend={currency.trend}>
					{getTrendIcon(currency.trend)}
				</TrendIcon>
			)}
		</CurrencyItem>
	);

	const indicatorContent = (
		<IndicatorContainer
			elevation={0}
			className={className}
			onMouseEnter={() => showTooltip && setTooltipOpen(true)}
			onMouseLeave={() => showTooltip && setTooltipOpen(false)}
		>
			<CurrencyDisplay currency={uf} />

			<Divider
				orientation="vertical"
				flexItem
				sx={{
					height: 16,
					borderColor: alpha(theme.palette.divider, 0.3),
				}}
			/>

			<CurrencyDisplay currency={usd} />

			<PulseIndicator />
		</IndicatorContainer>
	);

	if (!showTooltip) {
		return indicatorContent;
	}

	return (
		<Tooltip
			title={
				<Box>
					<CurrencyTooltip currency={uf} />
					<Divider sx={{ my: 1 }} />
					<CurrencyTooltip currency={usd} />
				</Box>
			}
			arrow
			placement="bottom-end"
			TransitionComponent={Fade}
			TransitionProps={{ timeout: 200 }}
			open={tooltipOpen}
			onClose={() => setTooltipOpen(false)}
			componentsProps={{
				tooltip: {
					sx: {
						backgroundColor: theme.palette.background.paper,
						color: theme.palette.text.primary,
						boxShadow: theme.shadows[8],
						border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
						borderRadius: theme.spacing(1),
						backdropFilter: "blur(12px)",
						maxWidth: "none",
					},
				},
				arrow: {
					sx: {
						color: theme.palette.background.paper,
					},
				},
			}}
		>
			{indicatorContent}
		</Tooltip>
	);
};

export default EconomicIndicators;
