// =============================================================================
// COMPONENTS — MERIDIAN
// =============================================================================

// Componentes existentes
export { PageHeader } from "./PageHeader";
export { StyledCard } from "./StyledCard";

// Theme Customizer
export { ThemeCustomizer, ThemeCustomizerButton } from "./ThemeCustomizer";

// =============================================================================
// ATOMIC DESIGN — Átomos
// =============================================================================
export {
	LoadingSpinner,
	Skeleton,
	SkeletonText,
	SkeletonCircle,
	SkeletonCard,
	SkeletonPage,
	SkeletonTableRow,
	Badge,
	IconButton,
	Logo,
	StatusDot,
	Divider,
	StatusChip,
	MeridianLogo,
	ClockDisplay,
} from "./atoms";
export type {
	StatusChipProps,
	MeridianLogoProps,
	ClockDisplayProps,
} from "./atoms";

// =============================================================================
// ATOMIC DESIGN — Moléculas
// =============================================================================
export {
	AppLoader,
	EmptyState,
	InfoCard,
	StatCard,
	SearchInput,
	UserAvatar,
	WelcomeCard,
	KpiCard,
	TaskCard,
	QuickStatsCard,
} from "./molecules";
export type {
	WelcomeCardProps,
	KpiCardProps,
	TaskCardProps,
	QuickStatsCardProps,
	QuickStatItem,
} from "./molecules";

// =============================================================================
// ATOMIC DESIGN — Organismos
// =============================================================================
export { DataTable, BudgetChart, ActivityFeed } from "./organisms";
export type {
	Column,
	PaginationConfig,
	DataTableProps,
	BudgetChartProps,
	ChartBarData,
	ActivityFeedProps,
	ActivityItem,
} from "./organisms";

// =============================================================================
// FORMULARIOS
// =============================================================================
export { FormField, SelectField } from "./forms";
export type { FormFieldProps, SelectFieldProps, SelectOption } from "./forms";
