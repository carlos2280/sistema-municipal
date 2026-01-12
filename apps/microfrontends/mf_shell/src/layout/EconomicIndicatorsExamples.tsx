import { Box, CircularProgress, Stack } from "@mui/material";
import { useObtenerIndicadoresQuery } from "mf_store/store";
import { useMemo } from "react";
import EconomicIndicators from "../component/EconomicIndicators";

interface CurrencyData {
	code: string;
	name: string;
	value: number;
	previousValue: number;
	lastUpdate: string;
	trend: "up" | "down" | "stable";
}

export const EconomicIndicatorsExamples = () => {
	// Obtener datos reales desde la API
	const { data: indicadores, isLoading } = useObtenerIndicadoresQuery();

	// Transformar los datos de la API al formato que espera el componente
	const { ufData, usdData } = useMemo(() => {
		if (!indicadores) {
			return { ufData: undefined, usdData: undefined };
		}

		// Para calcular tendencia, comparamos con el valor anterior (mock por ahora)
		// En producción, podrías almacenar el valor previo o hacer otra llamada
		const ufData: CurrencyData = {
			code: "UF",
			name: "Unidad de Fomento",
			value: indicadores.uf,
			previousValue: indicadores.uf * 0.999, // Mock: asumimos 0.1% de diferencia
			lastUpdate: indicadores.fecha,
			trend: indicadores.uf > indicadores.uf * 0.999 ? "up" : "down",
		};

		const usdData: CurrencyData = {
			code: "USD",
			name: "Dólar Americano",
			value: indicadores.usd,
			previousValue: indicadores.usd * 1.001, // Mock: asumimos 0.1% de diferencia inversa
			lastUpdate: indicadores.fecha,
			trend: indicadores.usd < indicadores.usd * 1.001 ? "down" : "up",
		};

		return { ufData, usdData };
	}, [indicadores]);

	// Mostrar loading mientras se cargan los datos
	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" p={2}>
				<CircularProgress size={24} />
			</Box>
		);
	}

	return (
		<Stack spacing={3} sx={{ p: 0 }}>
			<Box>
				<EconomicIndicators compact uf={ufData} usd={usdData} />
			</Box>
		</Stack>
	);
};
