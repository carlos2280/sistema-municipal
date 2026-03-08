import { Box, CircularProgress } from "@mui/material";
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
	const { data: indicadores, isLoading } = useObtenerIndicadoresQuery();

	const { ufData, usdData } = useMemo(() => {
		if (!indicadores) return { ufData: undefined, usdData: undefined };

		const ufData: CurrencyData = {
			code: "UF",
			name: "Unidad de Fomento",
			value: indicadores.uf,
			previousValue: indicadores.uf * 0.999,
			lastUpdate: indicadores.fecha,
			trend: "up",
		};

		const usdData: CurrencyData = {
			code: "USD",
			name: "Dólar Americano",
			value: indicadores.usd,
			previousValue: indicadores.usd * 1.001,
			lastUpdate: indicadores.fecha,
			trend: "down",
		};

		return { ufData, usdData };
	}, [indicadores]);

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
				<CircularProgress size={16} />
			</Box>
		);
	}

	return <EconomicIndicators compact uf={ufData} usd={usdData} />;
};
