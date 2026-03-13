import { randomUUID } from "node:crypto";
import pino from "pino";

export function createLogger(service: string) {
  return pino(
    { name: service },
    process.env.NODE_ENV === "production"
      ? undefined
      : pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }),
  );
}

// Tipos mínimos compatibles con cualquier versión de Express
type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
};
type ResponseLike = {
  setHeader(name: string, value: string): unknown;
};
type NextFn = () => void;

export function requestIdMiddleware(
  req: RequestLike,
  res: ResponseLike,
  next: NextFn,
): void {
  const requestId =
    (req.headers["x-request-id"] as string) || randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
