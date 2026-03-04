import { AppError } from "@/libs/middleware/AppError";
import * as configuracionService from "@/services/configuracion.service";
import type { MfaPolicy } from "@/services/configuracion.service";
import type { RequestHandler } from "express-serve-static-core";

export const getMfaPolicy: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = req.user?.tenantSlug;
    if (!tenantSlug) return next(new AppError("Tenant no identificado", 401));

    const mfaPolicy = await configuracionService.getMfaPolicy(tenantSlug);
    res.status(200).json({ data: { mfaPolicy } });
  } catch (error) {
    next(error);
  }
};

export const updateMfaPolicy: RequestHandler = async (req, res, next) => {
  try {
    const tenantSlug = req.user?.tenantSlug;
    if (!tenantSlug) return next(new AppError("Tenant no identificado", 401));

    const { mfaPolicy } = req.body as { mfaPolicy?: string };
    const validPolicies: MfaPolicy[] = ["required", "optional", "disabled"];
    if (!mfaPolicy || !validPolicies.includes(mfaPolicy as MfaPolicy)) {
      return next(
        new AppError("Política inválida. Valores: required | optional | disabled", 400),
      );
    }

    await configuracionService.updateMfaPolicy(tenantSlug, mfaPolicy as MfaPolicy);
    res.status(200).json({ message: "Política MFA actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};
