/**
 * Activity Feed - Organismo
 *
 * Feed de actividad reciente para sidebar de dashboard
 */

import { Box, Link, Typography, alpha, styled, useTheme } from "@mui/material";
import { Activity, Clock } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  dotColor: "success" | "info" | "warning" | "error";
}

export interface ActivityFeedProps {
  /** Titulo del feed */
  title?: string;
  /** Lista de actividades */
  items: ActivityItem[];
  /** Handler para "Ver toda la actividad" */
  onViewAll?: () => void;
}

// ============================================================================
// DOT COLOR MAP
// ============================================================================

const dotColorMap: Record<ActivityItem["dotColor"], string> = {
  success: "#059669",
  info: "#2563eb",
  warning: "#d97706",
  error: "#dc2626",
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Card = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  overflow: "hidden",
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 20px 12px",
}));

const Title = styled(Typography)(() => ({
  fontWeight: 600,
  fontSize: "1rem",
  letterSpacing: "-0.01em",
}));

const ItemRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: 12,
  padding: "12px 8px",
  borderRadius: 8,
  margin: "0 12px",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "dotColor",
})<{ dotColor: string }>(({ dotColor }) => ({
  width: 9,
  height: 9,
  borderRadius: "50%",
  backgroundColor: dotColor,
  flexShrink: 0,
  marginTop: 6,
}));

const Footer = styled(Box)(() => ({
  padding: "8px 20px 16px",
  textAlign: "center",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function ActivityFeed({
  title = "Actividad Reciente",
  items,
  onViewAll,
}: ActivityFeedProps) {
  const theme = useTheme();

  return (
    <Card>
      {/* Header */}
      <Header>
        <Title>{title}</Title>
        <Activity
          size={18}
          strokeWidth={1.5}
          color={theme.palette.text.secondary}
        />
      </Header>

      {/* Activity list */}
      <Box>
        {items.map((item) => (
          <ItemRow key={item.id}>
            <Dot dotColor={dotColorMap[item.dotColor]} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "text.primary",
                  lineHeight: 1.5,
                }}
              >
                <Box component="strong" sx={{ fontWeight: 600 }}>
                  {item.user}
                </Box>{" "}
                {item.action}{" "}
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  {item.target}
                </Box>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  mt: 0.25,
                  color: "text.disabled",
                  fontSize: "0.6875rem",
                }}
              >
                <Clock size={12} strokeWidth={1.5} />
                <Typography
                  component="span"
                  sx={{ fontSize: "inherit", color: "inherit" }}
                >
                  {item.time}
                </Typography>
              </Box>
            </Box>
          </ItemRow>
        ))}
      </Box>

      {/* Footer */}
      {onViewAll && (
        <Footer>
          <Link
            component="button"
            variant="body2"
            onClick={onViewAll}
            underline="hover"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Ver toda la actividad
          </Link>
        </Footer>
      )}
    </Card>
  );
}

export default ActivityFeed;
