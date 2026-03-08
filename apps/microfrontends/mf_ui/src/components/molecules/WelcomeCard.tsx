/**
 * Welcome Card - Molecula
 *
 * Banner de bienvenida para el dashboard con gradiente,
 * badges de estado y reloj en tiempo real.
 */

import { Box, Typography, alpha, styled, keyframes, useTheme } from "@mui/material";
import { palette } from "../../theme/tokens";

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export interface WelcomeCardProps {
  /** Saludo principal, e.g. "Buenos dias, Carlos" */
  greeting: string;
  /** Mensaje secundario descriptivo */
  message: string;
  /** Badges de estado */
  badges?: Array<{ label: string; dot?: boolean }>;
  /** Hora actual, e.g. "14:32" */
  time?: string;
  /** Fecha formateada, e.g. "viernes 6 de marzo" */
  date?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CardRoot = styled(Box)(({ theme }) => {
  const isLight = theme.palette.mode === "light";

  return {
    background: isLight
      ? `linear-gradient(135deg, ${palette.jade[600]} 0%, ${palette.indigo[500]} 100%)`
      : `linear-gradient(135deg, ${palette.jade[700]} 0%, ${palette.indigo[600]} 100%)`,
    borderRadius: 20,
    padding: theme.spacing(4),
    color: "#ffffff",
    overflow: "hidden",
    position: "relative" as const,
    animation: `${fadeInUp} 0.5s ease-out`,

    // Radial gradient overlay
    "&::before": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      right: 0,
      width: "50%",
      height: "100%",
      background: `radial-gradient(circle at top right, ${alpha("#ffffff", 0.07)}, transparent 70%)`,
      pointerEvents: "none",
    },

    // Top highlight line
    "&::after": {
      content: '""',
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      background: `linear-gradient(90deg, transparent, ${alpha("#ffffff", 0.2)}, transparent)`,
      pointerEvents: "none",
    },

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  };
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(3),
  position: "relative" as const,
  zIndex: 1,

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column" as const,
  },
}));

const BadgeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap" as const,
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const StyledBadge = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: alpha("#ffffff", 0.15),
  backdropFilter: "blur(4px)",
  color: "#ffffff",
}));

const BadgeDot = styled(Box)(() => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: "#34d399",
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const TimeBlock = styled(Box)(({ theme }) => ({
  textAlign: "right" as const,
  flexShrink: 0,

  [theme.breakpoints.down("sm")]: {
    textAlign: "left" as const,
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function WelcomeCard({ greeting, message, badges, time, date }: WelcomeCardProps) {
  const theme = useTheme();

  return (
    <CardRoot>
      <ContentWrapper>
        {/* Texto de bienvenida */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h2"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "1.375rem", sm: "1.625rem" },
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
            }}
          >
            {greeting}
          </Typography>

          <Typography
            sx={{
              color: alpha("#ffffff", 0.88),
              fontSize: "0.875rem",
              lineHeight: 1.6,
              maxWidth: 460,
              mt: 1,
            }}
          >
            {message}
          </Typography>

          {badges && badges.length > 0 && (
            <BadgeContainer>
              {badges.map((badge, index) => (
                <StyledBadge key={index}>
                  {badge.dot && <BadgeDot />}
                  {badge.label}
                </StyledBadge>
              ))}
            </BadgeContainer>
          )}
        </Box>

        {/* Hora y fecha */}
        {(time || date) && (
          <TimeBlock>
            {time && (
              <Typography
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                  color: "#ffffff",
                }}
              >
                {time}
              </Typography>
            )}

            {date && (
              <Typography
                sx={{
                  color: alpha("#ffffff", 0.75),
                  fontSize: "0.8125rem",
                  textTransform: "capitalize",
                  mt: 0.25,
                }}
              >
                {date}
              </Typography>
            )}
          </TimeBlock>
        )}
      </ContentWrapper>
    </CardRoot>
  );
}

export default WelcomeCard;
