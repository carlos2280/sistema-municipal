/**
 * AppLoader - Molécula
 *
 * Componente de carga elegante para la aplicación
 */

import { Box, Typography, alpha, keyframes, styled } from "@mui/material";

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const dotBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

// ============================================================================
// TYPES
// ============================================================================

interface AppLoaderProps {
  /** Mensaje a mostrar */
  message?: string;
  /** Variante de loader */
  variant?: "default" | "minimal" | "branded";
  /** Si ocupa toda la pantalla */
  fullScreen?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const LoaderContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "fullScreen",
})<{ fullScreen?: boolean }>(({ theme, fullScreen }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  ...(fullScreen && {
    position: "fixed",
    inset: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: theme.zIndex.modal + 1,
  }),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const LoadingBar = styled(Box)(({ theme }) => ({
  width: 180,
  height: 4,
  borderRadius: 2,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  overflow: "hidden",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `linear-gradient(90deg,
      transparent 0%,
      ${theme.palette.primary.main} 50%,
      transparent 100%
    )`,
    backgroundSize: "200% 100%",
    animation: `${shimmer} 1.5s ease-in-out infinite`,
  },
}));

const DotsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
}));

const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "delay",
})<{ delay: number }>(({ theme, delay }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  animation: `${dotBounce} 1.4s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const MessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  letterSpacing: "0.02em",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function AppLoader({
  message = "Cargando...",
  variant = "default",
  fullScreen = true,
}: AppLoaderProps) {
  if (variant === "minimal") {
    return (
      <LoaderContainer fullScreen={fullScreen}>
        <DotsContainer>
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </DotsContainer>
        {message && (
          <MessageText variant="body2">{message}</MessageText>
        )}
      </LoaderContainer>
    );
  }

  if (variant === "branded") {
    return (
      <LoaderContainer fullScreen={fullScreen}>
        <LogoContainer>
          <img
            src="/logo-criscar-icon.svg"
            alt="CrisCar"
            width={36}
            height={36}
            style={{ opacity: 0.9 }}
          />
        </LogoContainer>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            CrisCar
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Sistema Municipal
          </Typography>
        </Box>
        <LoadingBar />
        {message && (
          <MessageText variant="body2">{message}</MessageText>
        )}
      </LoaderContainer>
    );
  }

  // Default variant
  return (
    <LoaderContainer fullScreen={fullScreen}>
      <LoadingBar />
      <DotsContainer>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </DotsContainer>
      {message && (
        <MessageText variant="body2">{message}</MessageText>
      )}
    </LoaderContainer>
  );
}

export default AppLoader;
