/**
 * DashboardPage — CIVITAS v3
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │ WelcomeCard (gradient jade→indigo)               │
 * ├──────────┬──────────┬──────────┬────────────────┤
 * │ KPI 1    │ KPI 2    │ KPI 3    │ KPI 4          │
 * │ featured │          │          │                │
 * ├────────────────────────┬─────────────────────────┤
 * │ Tareas Pendientes      │ Actividad Reciente      │
 * │ Ejecución Presupuest.  │ Indicadores Económicos  │
 * └────────────────────────┴─────────────────────────┘
 */

import { Box, Typography, keyframes, styled, useTheme } from "@mui/material";
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  WelcomeCard,
  KpiCard,
  TaskCard,
  StatusChip,
  QuickStatsCard,
} from "mf_ui/components";
import { ActivityFeed, BudgetChart } from "mf_ui/components";
import { SkeletonPage } from "mf_ui/components";
import { useAppSelector, selectNombreCompleto } from "mf_store/store";
import type { ActivityItem as ActivityItemType } from "mf_ui/components";

// ============================================================================
// ANIMATIONS
// ============================================================================
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================
const ContentInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: "100%",
  [theme.breakpoints.up("xl")]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down("sm")]: {
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
  },
}));

const KpiGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1.5),
  },
}));

const MainGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 360px",
  gap: theme.spacing(3),
  animation: `${fadeInUp} 0.5s ease 0.2s both`,
  [theme.breakpoints.up("xl")]: {
    gridTemplateColumns: "1fr 400px",
  },
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "1fr",
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)({
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontWeight: 600,
  fontSize: "1.125rem",
  letterSpacing: "-0.02em",
});

const SectionAction = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: theme.palette.primary.main,
  cursor: "pointer",
  "&:hover": { opacity: 0.7 },
}));

const AsideColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  [theme.breakpoints.down("lg")]: {
    flexDirection: "row",
    "& > *": { flex: 1 },
  },
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    "& > *": { flex: "none" },
  },
}));

const TaskList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
}));

// ============================================================================
// MOCK DATA
// ============================================================================
const mockTasks = [
  {
    id: "1",
    title: "Revisar decreto N-2024-0145",
    module: "Contabilidad",
    statusLabel: "Urgente",
    statusVariant: "urgente" as const,
    time: "María G. - hace 10 min",
    due: "Vence hoy",
    dueVariant: "urgent" as const,
    dotColor: "error" as const,
  },
  {
    id: "2",
    title: "Aprobar liquidación de remuneraciones - Marzo 2026",
    module: "Remuneraciones",
    statusLabel: "Pendiente",
    statusVariant: "pendiente" as const,
    time: "Ana M. - hace 1 hora",
    due: "Vence mañana",
    dueVariant: "today" as const,
    dotColor: "warning" as const,
  },
  {
    id: "3",
    title: "Verificar conciliación bancaria febrero",
    module: "Contabilidad",
    statusLabel: "En revisión",
    statusVariant: "en-revision" as const,
    time: "Sistema - hace 3 horas",
    dotColor: "info" as const,
  },
];

const mockActivities: ActivityItemType[] = [
  {
    id: "1",
    user: "María González",
    action: "aprobó el decreto",
    target: "N-2024-0145",
    time: "Hace 10 min",
    dotColor: "success",
  },
  {
    id: "2",
    user: "Carlos Pérez",
    action: "subió documento a",
    target: "Licitaciones",
    time: "Hace 1 hora",
    dotColor: "info",
  },
  {
    id: "3",
    user: "Sistema",
    action: "alerta de vencimiento",
    target: "Contrato #789",
    time: "Hace 3 horas",
    dotColor: "warning",
  },
  {
    id: "4",
    user: "Ana Martínez",
    action: "completó solicitud",
    target: "Permiso edificación",
    time: "Hace 5 horas",
    dotColor: "success",
  },
  {
    id: "5",
    user: "Sistema",
    action: "respaldo automático",
    target: "completado",
    time: "Hace 6 horas",
    dotColor: "info",
  },
];

const mockChartData = [
  { label: "Ene", budget: 85, executed: 78 },
  { label: "Feb", budget: 90, executed: 72 },
  { label: "Mar", budget: 100, executed: 68 },
  { label: "Abr", budget: 75, executed: 55 },
  { label: "May", budget: 80, executed: 62 },
  { label: "Jun", budget: 95, executed: 45 },
];

const mockQuickStats = [
  { label: "UF", value: "$38.726,05" },
  { label: "UTM", value: "$67.294" },
  { label: "Dólar", value: "$923,50" },
  { label: "Euro", value: "$1.012,30" },
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function DashboardPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const nombreCompleto = useAppSelector(selectNombreCompleto);
  const displayName = nombreCompleto
    ? nombreCompleto.split(" ")[0]
    : "Usuario";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, [currentTime]);

  const timeStr = currentTime.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = currentTime.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) {
    return <SkeletonPage variant="dashboard" />;
  }

  return (
    <ContentInner>
      {/* Welcome Card */}
      <Box sx={{ mb: 3 }}>
        <WelcomeCard
          greeting={`${greeting}, ${displayName}`}
          message="Tienes 5 tareas pendientes y 3 documentos por revisar. El sistema ha procesado 156 transacciones hoy."
          badges={[
            { label: "Sistema operativo", dot: true },
            { label: `Sync: ${timeStr}` },
          ]}
          time={timeStr}
          date={dateStr}
        />
      </Box>

      {/* KPI Grid */}
      <KpiGrid>
        <KpiCard
          label="Presupuesto Ejecutado"
          value="$2.847M"
          icon={<TrendingUp size={20} />}
          iconColor="jade"
          trend={{ value: "+12.4%", direction: "up" }}
          trendLabel="vs mes anterior"
          progress={{ value: 73, label: "del total asignado" }}
          featured
          animationDelay="0.04s"
        />
        <KpiCard
          label="Ingresos del Mes"
          value="$1.200M"
          icon={<ArrowDownLeft size={20} />}
          iconColor="green"
          trend={{ value: "+8.5%", direction: "up" }}
          trendLabel="vs mes anterior"
          animationDelay="0.08s"
        />
        <KpiCard
          label="Egresos del Mes"
          value="$890K"
          icon={<ArrowUpRight size={20} />}
          iconColor="red"
          trend={{ value: "-5.2%", direction: "down" }}
          trendLabel="vs mes anterior"
          animationDelay="0.12s"
        />
        <KpiCard
          label="Documentos Hoy"
          value="156"
          icon={<FileText size={20} />}
          iconColor="blue"
          trend={{ value: "+8", direction: "up" }}
          trendLabel="vs ayer"
          animationDelay="0.16s"
        />
      </KpiGrid>

      {/* Main Grid: Content + Aside */}
      <MainGrid>
        {/* Left Column */}
        <Box>
          {/* Tareas Pendientes */}
          <SectionHeader>
            <SectionTitle>Tareas Pendientes</SectionTitle>
            <SectionAction>Ver todas</SectionAction>
          </SectionHeader>

          <TaskList>
            {mockTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                module={task.module}
                status={
                  <StatusChip
                    variant={task.statusVariant}
                    label={task.statusLabel}
                  />
                }
                time={task.time}
                due={task.due}
                dueVariant={task.dueVariant}
                dotColor={task.dotColor}
              />
            ))}
          </TaskList>

          {/* Ejecución Presupuestaria */}
          <BudgetChart
            title="Ejecución Presupuestaria 2026"
            subtitle="Presupuestado vs Ejecutado por mes"
            data={mockChartData}
            summary={{
              budgeted: "$15.200M",
              executed: "$11.100M",
              percentage: "73%",
            }}
          />
        </Box>

        {/* Aside Column */}
        <AsideColumn>
          <ActivityFeed items={mockActivities} />
          <QuickStatsCard
            title="Indicadores Económicos"
            items={mockQuickStats}
          />
        </AsideColumn>
      </MainGrid>
    </ContentInner>
  );
}
