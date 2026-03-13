export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createErrorResponse(
  err: AppError | Error,
  requestId: string,
): ApiErrorResponse {
  if (err instanceof AppError) {
    return {
      success: false,
      code: err.code,
      message: err.message,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    success: false,
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
    requestId,
    timestamp: new Date().toISOString(),
  };
}
