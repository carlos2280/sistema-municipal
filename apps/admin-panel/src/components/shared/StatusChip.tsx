import Chip from "@mui/material/Chip";
import type { EstadoSuscripcion } from "../../types";

const ESTADO_CONFIG: Record<
  EstadoSuscripcion,
  { label: string; color: "success" | "info" | "warning" | "error" }
> = {
  activa: { label: "Activa", color: "success" },
  trial: { label: "Trial", color: "info" },
  suspendida: { label: "Suspendida", color: "warning" },
  cancelada: { label: "Cancelada", color: "error" },
};

interface Props {
  estado: EstadoSuscripcion;
  size?: "small" | "medium";
}

export default function StatusChip({ estado, size = "small" }: Props) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: estado,
    color: "default" as const,
  };
  return <Chip label={config.label} color={config.color} size={size} />;
}
