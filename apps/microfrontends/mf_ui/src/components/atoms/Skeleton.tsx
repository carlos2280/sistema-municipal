/**
 * Skeleton Components - Átomos
 *
 * Componentes de esqueleto para estados de carga
 * con animaciones elegantes y sutiles
 */

import {
  Box,
  Skeleton as MuiSkeleton,
  Stack,
  styled,
  keyframes,
} from "@mui/material";

// ============================================================================
// ANIMATIONS
// ============================================================================

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[200]
      : theme.palette.grey[800],
  "&::after": {
    background: `linear-gradient(
      90deg,
      transparent,
      ${theme.palette.mode === "light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.05)"},
      transparent
    )`,
    animation: `${shimmer} 1.5s ease-in-out infinite`,
    backgroundSize: "200% 100%",
  },
}));

// ============================================================================
// BASE SKELETON
// ============================================================================

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: "text" | "rectangular" | "rounded" | "circular";
  animation?: "pulse" | "wave" | false;
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = "rounded",
  animation = "wave",
  className,
}: SkeletonProps) {
  return (
    <StyledSkeleton
      width={width}
      height={height}
      variant={variant}
      animation={animation}
      className={className}
    />
  );
}

// ============================================================================
// SKELETON TEXT
// ============================================================================

interface SkeletonTextProps {
  lines?: number;
  width?: number | string;
  lastLineWidth?: number | string;
  spacing?: number;
}

export function SkeletonText({
  lines = 3,
  width = "100%",
  lastLineWidth = "60%",
  spacing = 1,
}: SkeletonTextProps) {
  return (
    <Stack spacing={spacing} sx={{ width }}>
      {Array.from({ length: lines }).map((_, index) => (
        <StyledSkeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : "100%"}
          height={20}
        />
      ))}
    </Stack>
  );
}

// ============================================================================
// SKELETON CIRCLE
// ============================================================================

interface SkeletonCircleProps {
  size?: number;
}

export function SkeletonCircle({ size = 40 }: SkeletonCircleProps) {
  return (
    <StyledSkeleton variant="circular" width={size} height={size} />
  );
}

// ============================================================================
// SKELETON CARD
// ============================================================================

interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: number;
  hasActions?: boolean;
}

export function SkeletonCard({
  hasImage = true,
  imageHeight = 140,
  hasActions = true,
}: SkeletonCardProps) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      })}
    >
      {hasImage && (
        <StyledSkeleton
          variant="rectangular"
          width="100%"
          height={imageHeight}
          animation="wave"
        />
      )}

      <Box sx={{ p: 2 }}>
        {/* Title */}
        <StyledSkeleton
          variant="text"
          width="70%"
          height={28}
          sx={{ mb: 1 }}
        />

        {/* Subtitle */}
        <StyledSkeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />

        {/* Content lines */}
        <SkeletonText lines={2} spacing={0.5} />

        {/* Actions */}
        {hasActions && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <StyledSkeleton variant="rounded" width={80} height={36} />
            <StyledSkeleton variant="rounded" width={80} height={36} />
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// ============================================================================
// SKELETON TABLE ROW
// ============================================================================

interface SkeletonTableRowProps {
  columns?: number;
  height?: number;
}

export function SkeletonTableRow({
  columns = 4,
  height = 48,
}: SkeletonTableRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        height,
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <StyledSkeleton
          key={index}
          variant="text"
          width={`${100 / columns}%`}
          height={20}
        />
      ))}
    </Stack>
  );
}

// ============================================================================
// SKELETON PAGE
// ============================================================================

interface SkeletonPageProps {
  /** Tipo de página */
  variant?: "default" | "dashboard" | "list" | "detail" | "form";
}

export function SkeletonPage({ variant = "default" }: SkeletonPageProps) {
  // Dashboard variant
  if (variant === "dashboard") {
    return (
      <Box>
        {/* Welcome Card Skeleton */}
        <Box
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[200]} 100%)`,
          }}
        >
          <StyledSkeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
          <StyledSkeleton variant="text" width={400} height={24} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1}>
            <StyledSkeleton variant="rounded" width={120} height={28} />
            <StyledSkeleton variant="rounded" width={180} height={28} />
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <StyledSkeleton variant="text" width="50%" height={16} />
                <StyledSkeleton variant="rounded" width={48} height={48} />
              </Stack>
              <StyledSkeleton variant="text" width="40%" height={36} sx={{ mb: 1 }} />
              <Stack direction="row" alignItems="center" spacing={1}>
                <StyledSkeleton variant="rounded" width={60} height={24} />
                <StyledSkeleton variant="text" width={60} height={16} />
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Quick Actions + Activity */}
        <Stack direction="row" spacing={3}>
          <Box sx={{ flex: 2 }}>
            <StyledSkeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
            <Stack direction="row" flexWrap="wrap" spacing={2} useFlexGap>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: "calc(50% - 8px)",
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <StyledSkeleton variant="rounded" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <StyledSkeleton variant="text" width="60%" height={20} />
                      <StyledSkeleton variant="text" width="40%" height={16} />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <StyledSkeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
            {[1, 2, 3, 4].map((i) => (
              <Stack key={i} direction="row" spacing={2} sx={{ mb: 2 }}>
                <StyledSkeleton variant="circular" width={8} height={8} />
                <Box sx={{ flex: 1 }}>
                  <StyledSkeleton variant="text" width="90%" height={18} />
                  <StyledSkeleton variant="text" width="30%" height={14} />
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  }

  // Form variant
  if (variant === "form") {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <StyledSkeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <StyledSkeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
            <StyledSkeleton variant="rounded" width="100%" height={56} />
          </Box>
        ))}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <StyledSkeleton variant="rounded" width={100} height={42} />
          <StyledSkeleton variant="rounded" width={100} height={42} />
        </Stack>
      </Box>
    );
  }

  // Detail variant
  if (variant === "detail") {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <StyledSkeleton variant="rounded" width={120} height={120} />
          <Box sx={{ flex: 1 }}>
            <StyledSkeleton variant="text" width={300} height={36} sx={{ mb: 1 }} />
            <StyledSkeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1}>
              <StyledSkeleton variant="rounded" width={80} height={28} />
              <StyledSkeleton variant="rounded" width={80} height={28} />
            </Stack>
          </Box>
        </Stack>
        <SkeletonText lines={5} spacing={1} />
      </Box>
    );
  }

  // List variant
  if (variant === "list") {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <StyledSkeleton variant="text" width={200} height={32} />
          <Stack direction="row" spacing={1}>
            <StyledSkeleton variant="rounded" width={200} height={40} />
            <StyledSkeleton variant="rounded" width={100} height={40} />
          </Stack>
        </Stack>
        <Box sx={{ borderRadius: 2, border: 1, borderColor: "divider", overflow: "hidden" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonTableRow key={i} columns={5} />
          ))}
        </Box>
      </Box>
    );
  }

  // Default variant
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <StyledSkeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
          <StyledSkeleton variant="text" width={300} height={20} />
        </Box>
        <Stack direction="row" spacing={1}>
          <StyledSkeleton variant="rounded" width={100} height={40} />
          <StyledSkeleton variant="rounded" width={100} height={40} />
        </Stack>
      </Stack>

      {/* Stats row */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <StyledSkeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <StyledSkeleton variant="text" width="40%" height={32} />
          </Box>
        ))}
      </Stack>

      {/* Table */}
      <Box sx={{ borderRadius: 2, border: 1, borderColor: "divider", overflow: "hidden" }}>
        {/* Table header */}
        <Box sx={{ bgcolor: "action.hover", p: 2 }}>
          <Stack direction="row" spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <StyledSkeleton key={i} variant="text" width={100} height={20} />
            ))}
          </Stack>
        </Box>

        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonTableRow key={i} columns={5} />
        ))}
      </Box>
    </Box>
  );
}

export default Skeleton;
