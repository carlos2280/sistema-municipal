import {
	Box,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Stack,
	TextField,
	Typography,
	styled,
} from "@mui/material";
import { Building2, Layers } from "lucide-react";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { TSchemaCredenciales } from "../../../types/login.zod";
import type { AreaOption, SistemaOption } from "../types";

const StyledTextField = styled(TextField)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: 8,
		"&:hover fieldset": {
			borderColor: theme.palette.primary.main,
		},
		"&.Mui-focused fieldset": {
			borderWidth: 2,
		},
	},
}));

interface AreaSystemStepProps {
	areas: AreaOption[];
	sistemas: SistemaOption[];
}

export const AreaSystemStep = memo(function AreaSystemStep({
	areas,
	sistemas,
}: AreaSystemStepProps) {
	const { control, watch } = useFormContext<TSchemaCredenciales>();
	const selectedArea = watch("areaId");

	return (
		<Stack spacing={2.5}>
			<Controller
				name="areaId"
				control={control}
				render={({ field, fieldState: { invalid, error } }) => (
					<StyledTextField
						{...field}
						select
						fullWidth
						label="Área de trabajo"
						value={field.value ?? ""}
						error={invalid}
						helperText={error?.message}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Building2 size={18} style={{ opacity: 0.5 }} />
									</InputAdornment>
								),
							},
						}}
					>
						{areas.map((area) => (
							<MenuItem key={area.id} value={area.id}>
								{area.nombre}
							</MenuItem>
						))}
					</StyledTextField>
				)}
			/>

			{selectedArea && sistemas.length > 0 && (
				<Controller
					name="sistemaId"
					control={control}
					render={({ field, fieldState: { invalid, error } }) => (
						<StyledTextField
							{...field}
							select
							fullWidth
							label="Sistema"
							value={field.value ?? ""}
							error={invalid}
							helperText={error?.message}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<Layers size={18} style={{ opacity: 0.5 }} />
										</InputAdornment>
									),
								},
							}}
						>
							{sistemas.map((sistema) => (
								<MenuItem key={sistema.id} value={sistema.id}>
									{sistema.nombre}
								</MenuItem>
							))}
						</StyledTextField>
					)}
				/>
			)}

			{selectedArea && sistemas.length === 0 && (
				<Box sx={{ py: 2 }}>
					<LinearProgress sx={{ borderRadius: 1 }} />
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 1, textAlign: "center" }}
					>
						Cargando sistemas...
					</Typography>
				</Box>
			)}
		</Stack>
	);
});
