import { Button, Card } from "@mui/material";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FormProvider } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLoginFormFlow } from "../../hook/useLoginFormFlow";
import AuthWrapper1 from "./AuthWrapper1";
import FormAreaWithModule from "./form/FormAreaWithModule";
import FormCredentialSteep from "./form/FormCredentialSteep";

export default function Login() {
	const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
	const { activeStep, areas, sistemas, methods, handleNext } =
		useLoginFormFlow();
	return (
		<AuthWrapper1>
			<Grid
				container
				direction="column"
				sx={{ justifyContent: "flex-end", minHeight: "100vh" }}
			>

				<Grid size={12}>
					<Grid
						container
						sx={{
							justifyContent: "center",
							alignItems: "center",
							minHeight: "calc(100vh - 68px)",
						}}
					>
						<Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
							<Card
								sx={{
									p: 4,
									maxWidth: 400,
								}}
							>
								<FormProvider {...methods}>
									<Grid
										container
										spacing={2}
										sx={{ alignItems: "center", justifyContent: "center" }}
									>
										<Grid sx={{ mb: 1 }}>
											<Link to="#" aria-label="logo">
												{/* <Logo /> */}
											</Link>
											<img
												src="/logo_02.svg"
												width={80}
												alt="Logo Municipalidad"
											/>
										</Grid>
										<Grid size={12}>
											<Grid
												container
												direction={{ xs: "column-reverse", md: "row" }}
												sx={{ alignItems: "center", justifyContent: "center" }}
											>
												<Grid>
													<Stack
														spacing={1}
														sx={{
															alignItems: "center",
															justifyContent: "center",
														}}
													>
														<Typography
															gutterBottom
															variant={downMD ? "h3" : "h2"}
															sx={{
																color: "primary.main",
																fontSize: "1.5rem",
																fontWeight: 400,
															}}
														>
															Municipalidad de Antuco
														</Typography>
													</Stack>
												</Grid>
											</Grid>
										</Grid>

										<Grid size={12}>
											<Grid
												container
												direction={{ xs: "column-reverse", md: "row" }}
												sx={{ alignItems: "center", justifyContent: "center" }}
											>
												<Grid>
													<Stack
														spacing={1}
														sx={{
															alignItems: "center",
															justifyContent: "center",
														}}
													>
														<Typography
															gutterBottom
															variant={downMD ? "h3" : "h2"}
															sx={{
																color: "secondary.main",
																fontSize: "1.25rem",
																fontWeight: 600,
															}}
														>
															Hola, bienvenido
														</Typography>
														<Typography
															variant="caption"
															sx={{
																fontSize: "16px",
																textAlign: { xs: "center", md: "inherit" },
															}}
														>
															Ingrese sus credenciales para continuar
														</Typography>
													</Stack>
												</Grid>
											</Grid>
										</Grid>
										<Grid size={12}>
											{/* <AuthLogin /> */}
											{activeStep === 0 && <FormCredentialSteep />}
											{activeStep === 1 && (
												<FormAreaWithModule areas={areas} sistemas={sistemas} />
											)}
										</Grid>
										<Grid size={12}>
											<Divider />
										</Grid>

										<Button
											size="large"
											fullWidth
											variant="contained"
											disabled={!methods.formState.isValid}
											onClick={handleNext}
										>
											{activeStep === 0 ? "Continuar" : "Ingresar"}
										</Button>

										{/* <Grid size={12}>
                                            <Grid container direction="column" sx={{ alignItems: 'center' }} size={12}>
                                                <Typography component={Link} to="/register" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                                                    Don&apos;t have an account?
                                                </Typography>
                                            </Grid>
                                        </Grid> */}
									</Grid>
								</FormProvider>
							</Card>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</AuthWrapper1>
	);
}
