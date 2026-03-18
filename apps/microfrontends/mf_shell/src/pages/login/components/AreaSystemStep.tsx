/**
 * AreaSystemStep — Selección de área (cards) + sistema (list cards) MERIDIAN
 *
 * Grid de area cards seleccionables + reveal animado de sistema cards.
 * Todo desde tokens del tema, nada hardcoded.
 */

import { Box, Typography, alpha, styled } from "@mui/material";
import {
	Building2,
	Check,
	GraduationCap,
	HeartPulse,
	Layers,
	Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { TSchemaCredenciales } from "../../../types/login.zod";
import type { AreaOption, SistemaOption } from "../types";

// ── Area Card Icons (mapping by name pattern) ───────────────────────────────

const AREA_ICON_MAP: ReadonlyArray<{
	readonly pattern: RegExp;
	readonly icon: LucideIcon;
}> = [
	{ pattern: /salud/i, icon: HeartPulse },
	{ pattern: /educa/i, icon: GraduationCap },
	{ pattern: /obra/i, icon: Package },
];

function getAreaIcon(nombre: string): LucideIcon {
	const match = AREA_ICON_MAP.find((entry) => entry.pattern.test(nombre));
	return match?.icon ?? Building2;
}

// ── Styled: Area Grid ───────────────────────────────────────────────────────

const AreaGrid = styled(Box)(({ theme }) => ({
	display: "grid",
	gridTemplateColumns: "repeat(3, 1fr)",
	gap: 8,

	[theme.breakpoints.down("md")]: {
		gridTemplateColumns: "1fr",
	},
}));

const AreaCard = styled(Box)<{ ownerState: { selected: boolean } }>(
	({ theme, ownerState }) => {
		const accent = theme.palette.primary.main;
		const accentRgb = theme.meridian.moduleAccent.rgb;

		return {
			background: theme.meridian.surfaces.s2,
			border: `1.5px solid ${theme.palette.divider}`,
			borderRadius: 12,
			padding: "14px 15px",
			cursor: "pointer",
			transition:
				"border-color 150ms, background 150ms, transform 150ms, box-shadow 150ms",
			display: "flex",
			flexDirection: "column",
			gap: 7,
			userSelect: "none",

			"&:hover": {
				borderColor: theme.meridian.borders.strong,
				background: theme.meridian.surfaces.s3,
				transform: "translateY(-1px)",
			},

			...(ownerState.selected && {
				borderColor: accent,
				background: alpha(accent, 0.07),
				boxShadow: `0 0 0 1px rgba(${accentRgb}, 0.15), 0 4px 16px rgba(${accentRgb}, 0.08)`,
			}),
		};
	},
);

const AreaIcon = styled(Box)<{ ownerState: { selected: boolean } }>(
	({ theme, ownerState }) => ({
		width: 30,
		height: 30,
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 15,
		flexShrink: 0,
		transition: "background 150ms",
		background: ownerState.selected
			? alpha(theme.palette.primary.main, 0.15)
			: theme.meridian.surfaces.s4,

		"& svg": { width: 15, height: 15, strokeWidth: 1.5 },
	}),
);

const AreaCheckmark = styled(Box)<{ ownerState: { visible: boolean } }>(
	({ theme, ownerState }) => ({
		width: 14,
		height: 14,
		borderRadius: "50%",
		background: theme.palette.primary.main,
		display: ownerState.visible ? "flex" : "none",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "flex-end",
		flexShrink: 0,
		marginLeft: "auto",
		color: "#0A0A14",
	}),
);

const AreaName = styled(Typography)(({ theme }) => ({
	fontSize: 12.5,
	fontWeight: 600,
	color: theme.palette.text.primary,
	lineHeight: 1.3,
	textTransform: "capitalize" as const,
}));

const AreaDesc = styled(Typography)(({ theme }) => ({
	fontSize: 11,
	color: theme.palette.text.disabled,
	lineHeight: 1.3,
	marginTop: 2,
}));

// ── Styled: Sistema Reveal ──────────────────────────────────────────────────

const SistemaReveal = styled(Box)<{ ownerState: { open: boolean } }>(
	({ ownerState }) => ({
		overflow: "hidden",
		maxHeight: ownerState.open ? 380 : 0,
		opacity: ownerState.open ? 1 : 0,
		transition: "max-height 350ms cubic-bezier(0,0,0.2,1), opacity 250ms",
		marginTop: ownerState.open ? 10 : 0,
	}),
);

const SistemaLabel = styled("label")(({ theme }) => ({
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: "0.07em",
	textTransform: "uppercase" as const,
	color: theme.palette.text.disabled,
	display: "block",
	marginBottom: 10,
}));

const SysGrid = styled(Box)(() => ({
	display: "flex",
	flexDirection: "column",
	gap: 7,
}));

const SysCard = styled(Box)<{ ownerState: { selected: boolean } }>(
	({ theme, ownerState }) => {
		const accent = theme.palette.primary.main;

		return {
			display: "flex",
			alignItems: "center",
			gap: 12,
			padding: "11px 13px",
			background: theme.meridian.surfaces.s3,
			border: `1px solid ${theme.palette.divider}`,
			borderRadius: 12,
			cursor: "pointer",
			transition: "background 150ms, border-color 150ms",
			outline: "none",
			textAlign: "left",
			width: "100%",
			fontFamily: theme.typography.fontFamily,

			"&:hover": {
				background: theme.meridian.surfaces.s4,
				borderColor: theme.meridian.borders.strong,
			},

			...(ownerState.selected && {
				background: alpha(accent, 0.1),
				borderColor: accent,
			}),
		};
	},
);

const SysCardIcon = styled(Box)<{ ownerState: { selected: boolean } }>(
	({ theme, ownerState }) => ({
		width: 34,
		height: 34,
		background: ownerState.selected
			? alpha(theme.palette.primary.main, 0.15)
			: theme.meridian.surfaces.s4,
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: ownerState.selected
			? theme.palette.primary.main
			: theme.palette.text.disabled,
		flexShrink: 0,
		transition: "background 150ms, color 150ms",

		"& svg": { width: 15, height: 15 },
	}),
);

const SysCardName = styled(Typography)(({ theme }) => ({
	fontSize: 13,
	fontWeight: 500,
	color: theme.palette.text.primary,
	flex: 1,
}));

const SysCardCheck = styled(Box)<{ ownerState: { selected: boolean } }>(
	({ theme, ownerState }) => ({
		width: 16,
		height: 16,
		border: `1.5px solid ${ownerState.selected ? theme.palette.primary.main : theme.meridian.borders.strong}`,
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		transition: "all 150ms",
		flexShrink: 0,

		...(ownerState.selected && {
			background: theme.palette.primary.main,
			color: "#000",
		}),

		"& svg": { width: 9, height: 9 },
	}),
);

// ── No Systems State ────────────────────────────────────────────────────────

const NoSystemsBox = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	gap: 8,
	padding: "20px 16px",
	border: `1px dashed ${theme.meridian.borders.muted}`,
	borderRadius: 12,
	textAlign: "center",
	color: theme.palette.text.disabled,
	fontSize: 12,
	lineHeight: 1.5,
	"& svg": { width: 28, height: 28, opacity: 0.35 },
}));

// ── Loading skeleton ────────────────────────────────────────────────────────

const LoadingBar = styled(Box)(({ theme }) => ({
	height: 3,
	borderRadius: 2,
	background: `linear-gradient(90deg, ${theme.meridian.surfaces.s3}, ${theme.palette.primary.main}, ${theme.meridian.surfaces.s3})`,
	backgroundSize: "200% 100%",
	animation: "shimmer 1.5s ease-in-out infinite",
	"@keyframes shimmer": {
		"0%": { backgroundPosition: "200% 0" },
		"100%": { backgroundPosition: "-200% 0" },
	},
}));

// ── Component ───────────────────────────────────────────────────────────────

interface AreaSystemStepProps {
	readonly areas: ReadonlyArray<AreaOption>;
	readonly sistemas: ReadonlyArray<SistemaOption>;
	readonly isLoadingSistemas: boolean;
	readonly onSistemaSelect?: (codigo: string) => void;
}

export const AreaSystemStep = memo(function AreaSystemStep({
	areas,
	sistemas,
	isLoadingSistemas,
	onSistemaSelect,
}: AreaSystemStepProps) {
	const { control, watch } = useFormContext<TSchemaCredenciales>();
	const selectedArea = watch("areaId");

	return (
		<Box>
			{/* Área de trabajo */}
			<Controller
				name="areaId"
				control={control}
				render={({ field }) => (
					<Box sx={{ mb: "12px" }}>
						<SistemaLabel>Área de trabajo</SistemaLabel>
						<AreaGrid>
							{areas.map((area) => {
								const isSelected = field.value === area.id;
								const Icon = getAreaIcon(area.nombre);

								return (
									<AreaCard
										key={area.id}
										ownerState={{ selected: isSelected }}
										onClick={() => field.onChange(area.id)}
										role="radio"
										aria-checked={isSelected}
										tabIndex={0}
									>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "flex-start",
											}}
										>
											<AreaIcon ownerState={{ selected: isSelected }}>
												<Icon />
											</AreaIcon>
											<AreaCheckmark ownerState={{ visible: isSelected }}>
												<Check size={8} strokeWidth={3} />
											</AreaCheckmark>
										</Box>
										<Box>
											<AreaName>{area.nombre}</AreaName>
											{area.descripcion && (
												<AreaDesc>{area.descripcion}</AreaDesc>
											)}
										</Box>
									</AreaCard>
								);
							})}
						</AreaGrid>
					</Box>
				)}
			/>

			{/* Sistema de trabajo — reveal animado */}
			<SistemaReveal ownerState={{ open: !!selectedArea }}>
				{selectedArea && isLoadingSistemas && (
					<Box sx={{ py: 1 }}>
						<LoadingBar />
						<Typography
							sx={{
								mt: 1,
								textAlign: "center",
								fontSize: 12,
								color: "text.secondary",
							}}
						>
							Cargando sistemas...
						</Typography>
					</Box>
				)}

				{selectedArea && !isLoadingSistemas && sistemas.length === 0 && (
					<NoSystemsBox>
						<Layers />
						<span>No hay sistemas asignados para esta área.</span>
						<span>Contacte al administrador del sistema.</span>
					</NoSystemsBox>
				)}

				{sistemas.length > 0 && (
					<Controller
						name="sistemaId"
						control={control}
						render={({ field }) => (
							<Box>
								<SistemaLabel>Sistema de trabajo</SistemaLabel>
								<SysGrid>
									{sistemas.map((sistema) => {
										const isSelected = field.value === sistema.id;
										return (
											<SysCard
												key={sistema.id}
												ownerState={{ selected: isSelected }}
												onClick={() => {
													field.onChange(sistema.id);
													onSistemaSelect?.(sistema.codigo);
												}}
												role="radio"
												aria-checked={isSelected}
												tabIndex={0}
											>
												<SysCardIcon ownerState={{ selected: isSelected }}>
													<Layers />
												</SysCardIcon>
												<SysCardName>{sistema.nombre}</SysCardName>
												<SysCardCheck ownerState={{ selected: isSelected }}>
													{isSelected && <Check size={9} strokeWidth={3} />}
												</SysCardCheck>
											</SysCard>
										);
									})}
								</SysGrid>
							</Box>
						)}
					/>
				)}
			</SistemaReveal>
		</Box>
	);
});
