import { Component, type ReactNode } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  alpha,
} from "@mui/material";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  microfrontendName?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary para Microfrontends
 * Captura errores en componentes hijos y muestra un fallback elegante
 * sin tumbar toda la aplicación
 */
export class MicrofrontendErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log para debugging y potencial envío a servicio de monitoreo
    console.error(
      `[MF Error Boundary] ${this.props.microfrontendName || "Unknown"}:`,
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );

    // Aquí podrías enviar a Sentry, LogRocket, etc.
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  handleNavigateHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onNavigateHome?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: 4,
              maxWidth: 480,
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              background: alpha(theme.palette.error.main, 0.02),
            })}
          >
            <Box
              sx={(theme) => ({
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                background: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              })}
            >
              <AlertTriangle size={32} />
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Error en el módulo
            </Typography>

            {this.props.microfrontendName && (
              <Typography
                variant="body2"
                sx={(theme) => ({
                  mb: 2,
                  px: 2,
                  py: 0.5,
                  display: "inline-block",
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.dark,
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                })}
              >
                {this.props.microfrontendName}
              </Typography>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              Ha ocurrido un error inesperado en este módulo. El resto de la
              aplicación sigue funcionando normalmente.
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box
                sx={(theme) => ({
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[900], 0.03),
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: "left",
                  maxHeight: 120,
                  overflow: "auto",
                })}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    m: 0,
                    color: "text.secondary",
                  }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="medium"
                startIcon={<RefreshCw size={18} />}
                onClick={this.handleRetry}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Reintentar
              </Button>

              {this.props.onNavigateHome && (
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<Home size={18} />}
                  onClick={this.handleNavigateHome}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Ir al inicio
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default MicrofrontendErrorBoundary;
