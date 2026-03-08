/**
 * StatusBar — Barra de estado inferior del shell CIVITAS v3
 *
 * Muestra: estado de conexión, sistema activo, hora en vivo, versión
 */

import { Box, Typography, keyframes, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppSelector, selectSistemaId } from "mf_store/store";

const pulseDot = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Root = styled(Box)(({ theme }) => ({
  height: 28,
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  padding: `0 ${theme.spacing(2)}`,
  gap: theme.spacing(2),
  fontSize: "0.6875rem",
  color: theme.palette.text.disabled,
  overflow: "hidden",
  whiteSpace: "nowrap",
  minWidth: 0,
  transition: theme.transitions.create(["background-color", "border-color"], {
    duration: theme.transitions.duration.standard,
  }),
}));

const StatusDot = styled("span")(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  animation: `${pulseDot} 2s infinite`,
  flexShrink: 0,
}));

const Separator = styled("span")(({ theme }) => ({
  color: theme.palette.divider,
  flexShrink: 0,
}));

const StatusItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexShrink: 0,
});

const SystemInfo = styled(Box)({
  flexShrink: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const RightSection = styled(Box)(({ theme }) => ({
  marginLeft: "auto",
  display: "flex",
  gap: theme.spacing(2),
  flexShrink: 0,
}));

const MonoText = styled(Typography)({
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: "inherit",
  color: "inherit",
});

export function StatusBar() {
  const sistemaId = useAppSelector(selectSistemaId);
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Root>
      <StatusItem>
        <StatusDot />
        <Box
          component="span"
          sx={{ display: { xs: "none", sm: "inline" } }}
        >
          Conectado
        </Box>
      </StatusItem>

      <Separator sx={{ display: { xs: "none", sm: "inline" } }}>|</Separator>

      <SystemInfo sx={{ display: { xs: "none", md: "block" } }}>
        {sistemaId ? `Sistema ${sistemaId}` : "Sin sistema seleccionado"}
      </SystemInfo>

      <RightSection>
        <MonoText>{time}</MonoText>
        <Separator sx={{ display: { xs: "none", sm: "inline" } }}>|</Separator>
        <MonoText
          sx={{
            fontSize: "0.625rem",
            display: { xs: "none", sm: "inline" },
          }}
        >
          v3.0.0
        </MonoText>
      </RightSection>
    </Root>
  );
}

function formatTime(): string {
  return new Date().toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
