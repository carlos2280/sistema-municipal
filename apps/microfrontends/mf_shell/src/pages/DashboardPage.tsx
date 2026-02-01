/**
 * Dashboard Page - Sistema Municipal CrisCar
 *
 * Página principal con estadísticas, gráficos y actividad reciente
 */

import {
	Box,
	Card,
	CardContent,
	Grid,
	LinearProgress,
	Stack,
	Typography,
	alpha,
	styled,
} from "@mui/material";
import {
	Activity,
	BarChart3,
	Calendar,
	ClipboardList,
	DollarSign,
	FileText,
	TrendingUp,
	Users,
	Clock,
	CheckCircle2,
	AlertCircle,
	ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	PageHeader,
	StatCard,
	SkeletonPage,
	UserAvatar,
	Badge,
} from "mf_ui/components";
import { useTheme as useAppTheme } from "mf_ui/theme";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const WelcomeCard = styled(Card)(({ theme }) => ({
	background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
	color: theme.palette.primary.contrastText,
	borderRadius: 16,
	overflow: "hidden",
	position: "relative",
	"&::before": {
		content: '""',
		position: "absolute",
		top: 0,
		right: 0,
		width: "40%",
		height: "100%",
		background: `radial-gradient(circle at 70% 50%, ${alpha("#fff", 0.1)} 0%, transparent 60%)`,
		pointerEvents: "none",
	},
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
	borderRadius: 12,
	border: `1px solid ${theme.palette.divider}`,
	cursor: "pointer",
	transition: "all 0.2s ease-in-out",
	"&:hover": {
		boxShadow: theme.shadows[4],
		borderColor: theme.palette.primary.main,
		transform: "translateY(-4px)",
	},
}));

const QuickActionIcon = styled(Box, {
	shouldForwardProp: (prop) => prop !== "iconColor",
})<{ iconColor: string }>(({ theme, iconColor }) => ({
	width: 44,
	height: 44,
	borderRadius: 12,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: alpha(iconColor, 0.12),
	color: iconColor,
	transition: "transform 0.2s ease-in-out",
	"$:hover &": {
		transform: "scale(1.1)",
	},
}));

const ActivityItem = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "flex-start",
	gap: theme.spacing(2),
	padding: theme.spacing(2),
	borderRadius: 12,
	transition: "background-color 0.2s ease-in-out",
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.04),
	},
}));

const ActivityDot = styled(Box, {
	shouldForwardProp: (prop) => prop !== "status",
})<{ status: "success" | "warning" | "error" | "info" }>(
	({ theme, status }) => ({
		width: 8,
		height: 8,
		borderRadius: "50%",
		marginTop: 6,
		flexShrink: 0,
		backgroundColor:
			status === "success"
				? theme.palette.success.main
				: status === "warning"
					? theme.palette.warning.main
					: status === "error"
						? theme.palette.error.main
						: theme.palette.info.main,
	}),
);

const ProgressCard = styled(Card)(({ theme }) => ({
	borderRadius: 12,
	border: `1px solid ${theme.palette.divider}`,
	padding: theme.spacing(2.5),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const quickActions = [
	{
		icon: FileText,
		label: "Nuevo Documento",
		description: "Crear oficio o decreto",
		color: "#7928ca",
	},
	{
		icon: Users,
		label: "Gestión Personal",
		description: "Administrar funcionarios",
		color: "#0891b2",
	},
	{
		icon: DollarSign,
		label: "Presupuesto",
		description: "Ver estado financiero",
		color: "#059669",
	},
	{
		icon: Calendar,
		label: "Agenda",
		description: "Programar reuniones",
		color: "#d97706",
	},
];

const recentActivity = [
	{
		id: 1,
		user: "María González",
		action: "aprobó el decreto",
		target: "N°2024-0145",
		time: "Hace 5 min",
		status: "success" as const,
	},
	{
		id: 2,
		user: "Carlos Pérez",
		action: "subió documento a",
		target: "Licitaciones",
		time: "Hace 15 min",
		status: "info" as const,
	},
	{
		id: 3,
		user: "Sistema",
		action: "alerta de vencimiento",
		target: "Contrato #789",
		time: "Hace 1 hora",
		status: "warning" as const,
	},
	{
		id: 4,
		user: "Ana Martínez",
		action: "completó solicitud",
		target: "Permiso de edificación",
		time: "Hace 2 horas",
		status: "success" as const,
	},
];

const progressItems = [
	{
		label: "Documentos procesados",
		value: 78,
		total: 100,
		color: "#7928ca",
	},
	{ label: "Solicitudes atendidas", value: 45, total: 60, color: "#0891b2" },
	{ label: "Presupuesto ejecutado", value: 65, total: 100, color: "#059669" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardPage() {
	const { isDarkMode } = useAppTheme();
	const [loading, setLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Simular carga de datos
	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 1200);
		return () => clearTimeout(timer);
	}, []);

	// Actualizar hora
	useEffect(() => {
		const interval = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(interval);
	}, []);

	const greeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return "Buenos días";
		if (hour < 18) return "Buenas tardes";
		return "Buenas noches";
	};

	if (loading) {
		return <SkeletonPage variant="dashboard" />;
	}

	return (
		<Box>
			{/* Welcome Card */}
			<WelcomeCard sx={{ mb: 4 }}>
				<CardContent sx={{ p: 4 }}>
					<Grid container spacing={3} alignItems="center">
						<Grid size={{ xs: 12, md: 8 }}>
							<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
								{greeting()}, Administrador
							</Typography>
							<Typography
								variant="body1"
								sx={{ opacity: 0.9, maxWidth: 500, mb: 2 }}
							>
								Tienes 5 tareas pendientes y 3 documentos por revisar. El
								sistema ha procesado 156 transacciones hoy.
							</Typography>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								<Badge color="success" size="small">
									Sistema operativo
								</Badge>
								<Badge color="info" size="small">
									Última sincronización: 10:45 AM
								</Badge>
							</Stack>
						</Grid>
						<Grid
							size={{ xs: 12, md: 4 }}
							sx={{
								display: "flex",
								justifyContent: { xs: "flex-start", md: "flex-end" },
							}}
						>
							<Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
								<Typography
									variant="h3"
									fontWeight={700}
									sx={{ lineHeight: 1 }}
								>
									{currentTime.toLocaleTimeString("es-CL", {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8 }}>
									{currentTime.toLocaleDateString("es-CL", {
										weekday: "long",
										day: "numeric",
										month: "long",
									})}
								</Typography>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</WelcomeCard>

			{/* Stats Grid */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<StatCard
						label="Documentos Hoy"
						value="156"
						icon={<FileText />}
						trend="up"
						trendValue="+12%"
						trendLabel="vs. ayer"
						color="primary"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<StatCard
						label="Solicitudes Pendientes"
						value="23"
						icon={<ClipboardList />}
						trend="down"
						trendValue="-5%"
						trendLabel="esta semana"
						color="secondary"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<StatCard
						label="Ingresos del Mes"
						value="$12.4M"
						icon={<DollarSign />}
						trend="up"
						trendValue="+8.5%"
						trendLabel="vs. mes anterior"
						color="success"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, lg: 3 }}>
					<StatCard
						label="Usuarios Activos"
						value="48"
						icon={<Users />}
						trend="neutral"
						trendValue="0%"
						trendLabel="sin cambios"
						color="info"
					/>
				</Grid>
			</Grid>

			{/* Main Content Grid */}
			<Grid container spacing={3}>
				{/* Quick Actions */}
				<Grid size={{ xs: 12, lg: 8 }}>
					<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
						Acciones Rápidas
					</Typography>
					<Grid container spacing={2}>
						{quickActions.map((action) => (
							<Grid key={action.label} size={{ xs: 12, sm: 6 }}>
								<QuickActionCard elevation={0}>
									<CardContent sx={{ p: 2.5 }}>
										<Stack direction="row" spacing={2} alignItems="center">
											<QuickActionIcon iconColor={action.color}>
												<action.icon size={22} />
											</QuickActionIcon>
											<Box sx={{ flex: 1 }}>
												<Typography variant="subtitle2" fontWeight={600}>
													{action.label}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{action.description}
												</Typography>
											</Box>
											<ArrowUpRight
												size={18}
												style={{ opacity: 0.4 }}
											/>
										</Stack>
									</CardContent>
								</QuickActionCard>
							</Grid>
						))}
					</Grid>

					{/* Progress Section */}
					<Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
						Progreso del Mes
					</Typography>
					<Grid container spacing={2}>
						{progressItems.map((item) => (
							<Grid key={item.label} size={{ xs: 12, sm: 4 }}>
								<ProgressCard elevation={0}>
									<Stack spacing={1.5}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Typography variant="body2" fontWeight={500}>
												{item.label}
											</Typography>
											<Typography
												variant="body2"
												fontWeight={700}
												sx={{ color: item.color }}
											>
												{item.value}%
											</Typography>
										</Stack>
										<LinearProgress
											variant="determinate"
											value={item.value}
											sx={{
												height: 8,
												borderRadius: 4,
												bgcolor: alpha(item.color, 0.12),
												"& .MuiLinearProgress-bar": {
													bgcolor: item.color,
													borderRadius: 4,
												},
											}}
										/>
										<Typography variant="caption" color="text.secondary">
											{item.value} de {item.total} completado
										</Typography>
									</Stack>
								</ProgressCard>
							</Grid>
						))}
					</Grid>
				</Grid>

				{/* Activity Feed */}
				<Grid size={{ xs: 12, lg: 4 }}>
					<Card
						elevation={0}
						sx={{
							borderRadius: 3,
							border: 1,
							borderColor: "divider",
							height: "100%",
						}}
					>
						<CardContent sx={{ p: 0 }}>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								sx={{ p: 2.5, pb: 2 }}
							>
								<Typography variant="h6" fontWeight={600}>
									Actividad Reciente
								</Typography>
								<Activity size={20} style={{ opacity: 0.5 }} />
							</Stack>

							<Box sx={{ px: 1 }}>
								{recentActivity.map((activity, index) => (
									<ActivityItem key={activity.id}>
										<ActivityDot status={activity.status} />
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography variant="body2" sx={{ mb: 0.5 }}>
												<Box
													component="span"
													sx={{ fontWeight: 600 }}
												>
													{activity.user}
												</Box>{" "}
												{activity.action}{" "}
												<Box
													component="span"
													sx={{
														color: "primary.main",
														fontWeight: 500,
													}}
												>
													{activity.target}
												</Box>
											</Typography>
											<Stack
												direction="row"
												alignItems="center"
												spacing={0.5}
											>
												<Clock size={12} style={{ opacity: 0.5 }} />
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{activity.time}
												</Typography>
											</Stack>
										</Box>
									</ActivityItem>
								))}
							</Box>

							<Box sx={{ p: 2, pt: 1 }}>
								<Typography
									variant="body2"
									color="primary.main"
									sx={{
										fontWeight: 500,
										cursor: "pointer",
										textAlign: "center",
										"&:hover": { textDecoration: "underline" },
									}}
								>
									Ver toda la actividad
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}
