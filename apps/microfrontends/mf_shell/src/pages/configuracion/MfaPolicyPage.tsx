import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import { ShieldAlert, ShieldCheck, ShieldOff, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MfaPolicy } from "mf_store/store";
import {
	useGetMfaPolicyQuery,
	useUpdateMfaPolicyMutation,
	useGetUsuariosMfaQuery,
	useResetUsuarioMfaMutation,
} from "mf_store/store";

// ─── helpers ──────────────────────────────────────────────────────────────────

const POLICY_OPTIONS: { value: MfaPolicy; label: string; description: string }[] = [
	{
		value: "required",
		label: "Obligatorio",
		description: "Todos los usuarios deben configurar MFA antes de ingresar.",
	},
	{
		value: "optional",
		label: "Opcional",
		description: "Los usuarios pueden habilitar MFA voluntariamente.",
	},
	{
		value: "disabled",
		label: "Desactivado",
		description: "MFA deshabilitado para todos los usuarios.",
	},
];

const PolicyIcon = ({ policy }: { policy: MfaPolicy }) => {
	if (policy === "required") return <ShieldCheck size={20} />;
	if (policy === "optional") return <ShieldAlert size={20} />;
	return <ShieldOff size={20} />;
};

const policyColor = (policy: MfaPolicy) => {
	if (policy === "required") return "success";
	if (policy === "optional") return "warning";
	return "error";
};

// ─── component ────────────────────────────────────────────────────────────────

export default function MfaPolicyPage() {
	const { data: currentPolicy, isLoading: loadingPolicy } = useGetMfaPolicyQuery();
	const [updatePolicy, { isLoading: saving }] = useUpdateMfaPolicyMutation();

	const { data: usuarios, isLoading: loadingUsuarios } = useGetUsuariosMfaQuery();
	const [resetMfa] = useResetUsuarioMfaMutation();

	const [selectedPolicy, setSelectedPolicy] = useState<MfaPolicy | null>(null);

	const effectivePolicy = selectedPolicy ?? currentPolicy ?? "optional";
	const hasChange = selectedPolicy !== null && selectedPolicy !== currentPolicy;

	const handleSave = async () => {
		if (!selectedPolicy) return;
		try {
			await updatePolicy(selectedPolicy).unwrap();
			setSelectedPolicy(null);
			toast.success("Política MFA actualizada.");
		} catch {
			toast.error("Error al guardar la política.");
		}
	};

	const handleReset = async (usuarioId: number, email: string) => {
		try {
			await resetMfa(usuarioId).unwrap();
			toast.success(`MFA reiniciado para ${email}.`);
		} catch {
			toast.error("Error al reiniciar MFA.");
		}
	};

	return (
		<Box>
			<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
				Autenticación de dos factores (MFA)
			</Typography>

			{/* ── Política MFA ── */}
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, mb: 4 }}>
				<CardContent sx={{ p: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
						<Typography variant="h6" fontWeight={600}>
							Política del municipio
						</Typography>
						{loadingPolicy ? (
							<CircularProgress size={18} />
						) : (
							<Chip
								size="small"
								label={POLICY_OPTIONS.find((o) => o.value === currentPolicy)?.label ?? "—"}
								color={policyColor(currentPolicy ?? "optional")}
								icon={<PolicyIcon policy={currentPolicy ?? "optional"} />}
							/>
						)}
					</Stack>

					<FormControl disabled={loadingPolicy || saving}>
						<RadioGroup
							value={effectivePolicy}
							onChange={(e) => setSelectedPolicy(e.target.value as MfaPolicy)}
						>
							{POLICY_OPTIONS.map((opt) => (
								<FormControlLabel
									key={opt.value}
									value={opt.value}
									control={<Radio />}
									label={
										<Box>
											<Typography variant="body2" fontWeight={600}>
												{opt.label}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{opt.description}
											</Typography>
										</Box>
									}
									sx={{ mb: 1, alignItems: "flex-start" }}
								/>
							))}
						</RadioGroup>
					</FormControl>

					<Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
						<Button
							variant="contained"
							disabled={!hasChange || saving}
							onClick={handleSave}
							startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
						>
							Guardar
						</Button>
					</Stack>
				</CardContent>
			</Card>

			{/* ── Usuarios MFA ── */}
			<Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
						Estado MFA por usuario
					</Typography>

					{loadingUsuarios ? (
						<Stack alignItems="center" py={4}>
							<CircularProgress />
						</Stack>
					) : (
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell>Usuario</TableCell>
									<TableCell>Email</TableCell>
									<TableCell align="center">MFA activo</TableCell>
									<TableCell align="center">Verificado</TableCell>
									<TableCell align="right">Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(usuarios ?? []).map((u) => (
									<TableRow key={u.id} hover>
										<TableCell>{u.nombreCompleto}</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell align="center">
											<Chip
												size="small"
												label={u.mfaEnabled ? "Sí" : "No"}
												color={u.mfaEnabled ? "success" : "default"}
											/>
										</TableCell>
										<TableCell align="center">
											<Chip
												size="small"
												label={u.mfaVerified ? "Sí" : "No"}
												color={u.mfaVerified ? "success" : "default"}
											/>
										</TableCell>
										<TableCell align="right">
											{u.mfaEnabled && (
												<Button
													size="small"
													variant="outlined"
													color="warning"
													startIcon={<RotateCcw size={14} />}
													onClick={() => handleReset(u.id, u.email)}
												>
													Reiniciar
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
								{!loadingUsuarios && (usuarios ?? []).length === 0 && (
									<TableRow>
										<TableCell colSpan={5} align="center">
											<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
												No hay usuarios registrados.
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
