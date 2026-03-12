import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface DeleteLineaDialogProps {
  open: boolean;
  cuentaCodigo?: string;
  cuentaNombre?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Molecule: diálogo de confirmación para eliminar una línea de detalle.
 */
const DeleteLineaDialog = ({
  open,
  cuentaCodigo,
  cuentaNombre,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteLineaDialogProps) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <DeleteOutlineIcon color="error" />
      Eliminar línea
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        ¿Eliminar la cuenta{" "}
        {cuentaCodigo && (
          <strong>
            {cuentaCodigo} — {cuentaNombre}
          </strong>
        )}{" "}
        del presupuesto? Esta acción no se puede deshacer.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onCancel} disabled={loading} color="inherit" size="small">
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={loading}
        size="small"
        startIcon={<DeleteOutlineIcon />}
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteLineaDialog;
