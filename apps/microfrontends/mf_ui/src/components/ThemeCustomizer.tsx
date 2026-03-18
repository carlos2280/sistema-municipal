/**
 * ═══════════════════════════════════════════════════════════════
 *  MERIDIAN — Theme Customizer (Level 1 Personalization)
 *
 *  Panel de preferencias del usuario:
 *  - Apariencia: Dark / Light / Auto
 *  - Tamaño de texto: S / M / L
 *  - Densidad de tabla: Compact / Normal / Relaxed
 * ═══════════════════════════════════════════════════════════════
 */

import {
	Box,
	Button,
	Divider,
	Drawer,
	IconButton,
	Stack,
	Tooltip,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import {
	Check,
	Monitor,
	Moon,
	RotateCcw,
	Settings2,
	Sun,
	X,
} from "lucide-react";
import {
	type TableDensity,
	type TextSize,
	useTheme,
} from "../theme/ThemeProvider";

// ─── Styled Components ───────────────────────────────────────────

const DrawerHeader = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: theme.spacing(2, 3),
	borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Section = styled(Box)(({ theme }) => ({
	padding: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
	fontSize: "0.625rem",
	fontWeight: 600,
	textTransform: "uppercase",
	letterSpacing: "0.12em",
	color: theme.palette.text.secondary,
	marginBottom: theme.spacing(2),
}));

const OptionButton = styled(Box, {
	shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
	flex: 1,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: theme.spacing(2),
	borderRadius: 12,
	cursor: "pointer",
	border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
	backgroundColor: selected
		? alpha(theme.palette.primary.main, 0.08)
		: "transparent",
	transition: "all 150ms cubic-bezier(0, 0, 0.2, 1)",
	"&:hover": {
		borderColor: theme.palette.primary.main,
		backgroundColor: alpha(theme.palette.primary.main, 0.04),
	},
}));

const OptionRow = styled(Box, {
	shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(1.5),
	padding: theme.spacing(1.5, 2),
	borderRadius: 8,
	cursor: "pointer",
	border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
	backgroundColor: selected
		? alpha(theme.palette.primary.main, 0.08)
		: "transparent",
	transition: "all 150ms cubic-bezier(0, 0, 0.2, 1)",
	"&:hover": {
		borderColor: theme.palette.primary.main,
		backgroundColor: alpha(theme.palette.primary.main, 0.04),
	},
}));

// ─── Types ───────────────────────────────────────────────────────

interface ThemeCustomizerProps {
	open: boolean;
	onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
	const {
		preferences,
		setMode,
		setTextSize,
		setTableDensity,
		resetToDefaults,
	} = useTheme();

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: { sx: { width: 320, maxWidth: "100%" } },
			}}
		>
			{/* Header */}
			<DrawerHeader>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Settings2 size={18} strokeWidth={1.5} />
					<Typography variant="h6" fontWeight={600}>
						Preferencias
					</Typography>
				</Stack>
				<IconButton onClick={onClose} size="small">
					<X size={18} strokeWidth={1.5} />
				</IconButton>
			</DrawerHeader>

			<Box sx={{ overflow: "auto", flex: 1 }}>
				{/* ─── Apariencia ───────────────────────────────── */}
				<Section>
					<SectionTitle>Apariencia</SectionTitle>
					<Stack direction="row" spacing={1}>
						<OptionButton
							selected={preferences.mode === "dark"}
							onClick={() => setMode("dark")}
						>
							<Moon size={20} strokeWidth={1.5} />
							<Typography variant="caption" sx={{ mt: 0.75, fontWeight: 500 }}>
								Oscuro
							</Typography>
						</OptionButton>
						<OptionButton
							selected={preferences.mode === "light"}
							onClick={() => setMode("light")}
						>
							<Sun size={20} strokeWidth={1.5} />
							<Typography variant="caption" sx={{ mt: 0.75, fontWeight: 500 }}>
								Claro
							</Typography>
						</OptionButton>
						<OptionButton
							selected={preferences.mode === "system"}
							onClick={() => setMode("system")}
						>
							<Monitor size={20} strokeWidth={1.5} />
							<Typography variant="caption" sx={{ mt: 0.75, fontWeight: 500 }}>
								Auto
							</Typography>
						</OptionButton>
					</Stack>
				</Section>

				<Divider />

				{/* ─── Tamaño de Texto ──────────────────────────── */}
				<Section>
					<SectionTitle>Tamaño de Texto</SectionTitle>
					<Stack spacing={1}>
						{[
							{ key: "small" as TextSize, label: "Pequeño", preview: "12px" },
							{ key: "medium" as TextSize, label: "Normal", preview: "13.5px" },
							{ key: "large" as TextSize, label: "Grande", preview: "15px" },
						].map(({ key, label, preview }) => (
							<OptionRow
								key={key}
								selected={preferences.textSize === key}
								onClick={() => setTextSize(key)}
							>
								<Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
									{label}
								</Typography>
								<Typography
									variant="caption"
									sx={{
										fontFamily: '"DM Mono", monospace',
										color: "text.secondary",
									}}
								>
									{preview}
								</Typography>
								{preferences.textSize === key && (
									<Check size={14} strokeWidth={2} />
								)}
							</OptionRow>
						))}
					</Stack>
				</Section>

				<Divider />

				{/* ─── Densidad de Tabla ─────────────────────────── */}
				<Section>
					<SectionTitle>Densidad de Tabla</SectionTitle>
					<Stack spacing={1}>
						{[
							{ key: "compact" as TableDensity, label: "Compacta", h: "36px" },
							{ key: "normal" as TableDensity, label: "Normal", h: "44px" },
							{ key: "relaxed" as TableDensity, label: "Holgada", h: "52px" },
						].map(({ key, label, h }) => (
							<OptionRow
								key={key}
								selected={preferences.tableDensity === key}
								onClick={() => setTableDensity(key)}
							>
								{/* Mini preview de densidad */}
								<Stack spacing={0.25} sx={{ width: 28 }}>
									{[0, 1, 2].map((i) => (
										<Box
											key={i}
											sx={{
												height:
													key === "compact" ? 3 : key === "normal" ? 4 : 5,
												borderRadius: 0.5,
												bgcolor: "text.disabled",
												opacity: 0.4,
											}}
										/>
									))}
								</Stack>
								<Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
									{label}
								</Typography>
								<Typography
									variant="caption"
									sx={{
										fontFamily: '"DM Mono", monospace',
										color: "text.secondary",
									}}
								>
									{h}
								</Typography>
								{preferences.tableDensity === key && (
									<Check size={14} strokeWidth={2} />
								)}
							</OptionRow>
						))}
					</Stack>
				</Section>
			</Box>

			{/* Footer */}
			<Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
				<Button
					fullWidth
					variant="outlined"
					size="small"
					startIcon={<RotateCcw size={14} strokeWidth={1.5} />}
					onClick={resetToDefaults}
				>
					Restaurar Predeterminados
				</Button>
			</Box>
		</Drawer>
	);
}

// ─── Trigger Button ──────────────────────────────────────────────

interface ThemeCustomizerButtonProps {
	onClick: () => void;
}

export function ThemeCustomizerButton({ onClick }: ThemeCustomizerButtonProps) {
	return (
		<Tooltip title="Preferencias" arrow>
			<IconButton
				onClick={onClick}
				sx={(theme) => ({
					bgcolor: alpha(theme.palette.primary.main, 0.08),
					"&:hover": {
						bgcolor: alpha(theme.palette.primary.main, 0.16),
					},
				})}
			>
				<Settings2 size={18} strokeWidth={1.5} />
			</IconButton>
		</Tooltip>
	);
}

export default ThemeCustomizer;
