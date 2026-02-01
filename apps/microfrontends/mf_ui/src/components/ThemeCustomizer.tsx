/**
 * Theme Customizer - Sistema Municipal CrisCar
 *
 * Panel elegante para que el usuario personalice la apariencia
 * de la aplicación: colores, modo oscuro, bordes, etc.
 */

import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import {
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Check,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { useTheme, type ThemePreferences } from "../theme/ThemeProvider";
import { colorPresets } from "../theme/tokens";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

const ColorSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected" && prop !== "color",
})<{ selected?: boolean; color: string }>(({ theme, selected, color }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: color,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: selected
    ? `2px solid ${theme.palette.text.primary}`
    : `2px solid transparent`,
  boxShadow: selected ? `0 0 0 2px ${alpha(color, 0.3)}` : "none",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
  },
}));

const PresetCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 12,
  cursor: "pointer",
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.04)
    : "transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const ModeButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  borderRadius: 12,
  cursor: "pointer",
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.08)
    : "transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// ============================================================================
// TYPES
// ============================================================================

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const {
    preferences,
    isDarkMode,
    availablePresets,
    setMode,
    setPrimaryColor,
    setSecondaryColor,
    applyPreset,
    setBorderRadius,
    setFontScale,
    resetToDefaults,
  } = useTheme();

  // Color picker state
  const [customPrimary, setCustomPrimary] = useState(preferences.primaryColor);
  const [customSecondary, setCustomSecondary] = useState(preferences.secondaryColor);

  const handlePresetSelect = (presetName: string) => {
    applyPreset(presetName);
    const preset = colorPresets.find((p) => p.name === presetName);
    if (preset) {
      setCustomPrimary(preset.primary);
      setCustomSecondary(preset.secondary);
    }
  };

  const handleCustomColorChange = (
    type: "primary" | "secondary",
    color: string
  ) => {
    if (type === "primary") {
      setCustomPrimary(color);
      setPrimaryColor(color);
    } else {
      setCustomSecondary(color);
      setSecondaryColor(color);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 340,
          maxWidth: "100%",
        },
      }}
    >
      {/* Header */}
      <DrawerHeader>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Palette size={20} />
          <Typography variant="h6" fontWeight={600}>
            Personalizar
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ overflow: "auto", flex: 1 }}>
        {/* Mode Selection */}
        <Section>
          <SectionTitle>Modo de Color</SectionTitle>
          <Stack direction="row" spacing={1.5}>
            <ModeButton
              selected={preferences.mode === "light"}
              onClick={() => setMode("light")}
            >
              <Sun size={24} />
              <Typography variant="caption" sx={{ mt: 1, fontWeight: 500 }}>
                Claro
              </Typography>
            </ModeButton>
            <ModeButton
              selected={preferences.mode === "dark"}
              onClick={() => setMode("dark")}
            >
              <Moon size={24} />
              <Typography variant="caption" sx={{ mt: 1, fontWeight: 500 }}>
                Oscuro
              </Typography>
            </ModeButton>
            <ModeButton
              selected={preferences.mode === "system"}
              onClick={() => setMode("system")}
            >
              <Monitor size={24} />
              <Typography variant="caption" sx={{ mt: 1, fontWeight: 500 }}>
                Sistema
              </Typography>
            </ModeButton>
          </Stack>
        </Section>

        <Divider />

        {/* Color Presets */}
        <Section>
          <SectionTitle>Temas Predefinidos</SectionTitle>
          <Stack spacing={1.5}>
            {availablePresets.map((preset) => (
              <PresetCard
                key={preset.name}
                selected={preferences.presetName === preset.name}
                onClick={() => handlePresetSelect(preset.name)}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Stack direction="row" spacing={0.5}>
                    <Circle
                      size={16}
                      fill={preset.primary}
                      color={preset.primary}
                    />
                    <Circle
                      size={16}
                      fill={preset.secondary}
                      color={preset.secondary}
                    />
                    {preset.accent && (
                      <Circle
                        size={16}
                        fill={preset.accent}
                        color={preset.accent}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {preset.label}
                  </Typography>
                  {preferences.presetName === preset.name && (
                    <Check size={16} style={{ marginLeft: "auto" }} />
                  )}
                </Stack>
              </PresetCard>
            ))}
          </Stack>
        </Section>

        <Divider />

        {/* Custom Colors */}
        <Section>
          <SectionTitle>Colores Personalizados</SectionTitle>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Color Primario
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  component="input"
                  type="color"
                  value={customPrimary}
                  onChange={(e) =>
                    handleCustomColorChange("primary", e.target.value)
                  }
                  sx={{
                    width: 48,
                    height: 48,
                    border: "none",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&::-webkit-color-swatch-wrapper": {
                      padding: 0,
                    },
                    "&::-webkit-color-swatch": {
                      border: "none",
                      borderRadius: 8,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "action.hover",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {customPrimary.toUpperCase()}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Color Secundario
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  component="input"
                  type="color"
                  value={customSecondary}
                  onChange={(e) =>
                    handleCustomColorChange("secondary", e.target.value)
                  }
                  sx={{
                    width: 48,
                    height: 48,
                    border: "none",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&::-webkit-color-swatch-wrapper": {
                      padding: 0,
                    },
                    "&::-webkit-color-swatch": {
                      border: "none",
                      borderRadius: 8,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "action.hover",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {customSecondary.toUpperCase()}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Section>

        <Divider />

        {/* Border Radius */}
        <Section>
          <SectionTitle>Estilo de Bordes</SectionTitle>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={preferences.borderRadius}
              onChange={(e) =>
                setBorderRadius(
                  e.target.value as ThemePreferences["borderRadius"]
                )
              }
            >
              <FormControlLabel
                value="sharp"
                control={<Radio size="small" />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 24,
                        height: 16,
                        bgcolor: "primary.main",
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="body2">Angulares</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="default"
                control={<Radio size="small" />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 24,
                        height: 16,
                        bgcolor: "primary.main",
                        borderRadius: "4px",
                      }}
                    />
                    <Typography variant="body2">Predeterminado</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="rounded"
                control={<Radio size="small" />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 24,
                        height: 16,
                        bgcolor: "primary.main",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography variant="body2">Redondeados</Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="pill"
                control={<Radio size="small" />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 24,
                        height: 16,
                        bgcolor: "primary.main",
                        borderRadius: "12px",
                      }}
                    />
                    <Typography variant="body2">Píldora</Typography>
                  </Stack>
                }
              />
            </RadioGroup>
          </FormControl>
        </Section>

        <Divider />

        {/* Font Scale */}
        <Section>
          <SectionTitle>Tamaño de Fuente</SectionTitle>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={preferences.fontScale}
              onChange={(e) =>
                setFontScale(e.target.value as ThemePreferences["fontScale"])
              }
            >
              <FormControlLabel
                value="compact"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    Compacto
                  </Typography>
                }
              />
              <FormControlLabel
                value="default"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">Predeterminado</Typography>
                }
              />
              <FormControlLabel
                value="comfortable"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" sx={{ fontSize: "1.1rem" }}>
                    Cómodo
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Section>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<RotateCcw size={18} />}
          onClick={resetToDefaults}
          sx={{ textTransform: "none" }}
        >
          Restaurar Predeterminados
        </Button>
      </Box>
    </Drawer>
  );
}

// ============================================================================
// TRIGGER BUTTON
// ============================================================================

interface ThemeCustomizerButtonProps {
  onClick: () => void;
}

export function ThemeCustomizerButton({ onClick }: ThemeCustomizerButtonProps) {
  return (
    <Tooltip title="Personalizar tema" arrow>
      <IconButton
        onClick={onClick}
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.16),
          },
        })}
      >
        <Palette size={20} />
      </IconButton>
    </Tooltip>
  );
}

export default ThemeCustomizer;
