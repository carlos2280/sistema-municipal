// =============================================================================
// COMPONENTS - Sistema Municipal CrisCar
// =============================================================================

// Componentes existentes
export { PageHeader } from "./PageHeader";
export { StyledCard } from "./StyledCard";

// Theme Customizer
export { ThemeCustomizer, ThemeCustomizerButton } from "./ThemeCustomizer";

// =============================================================================
// ATOMIC DESIGN - Átomos
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
} from "./atoms";

// =============================================================================
// ATOMIC DESIGN - Moléculas
// =============================================================================
export {
  AppLoader,
  EmptyState,
  InfoCard,
  StatCard,
  SearchInput,
  UserAvatar,
} from "./molecules";

// =============================================================================
// ATOMIC DESIGN - Organismos
// =============================================================================
export { DataTable } from "./organisms";
export type { Column, PaginationConfig, DataTableProps } from "./organisms";

// =============================================================================
// FORMULARIOS
// =============================================================================
export { FormField, SelectField } from "./forms";
export type { FormFieldProps, SelectFieldProps, SelectOption } from "./forms";
