import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const frontendOrigin = process.env["FRONTEND_ORIGIN"]?.trim();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "timexframe-api" });
});

app.get("/", (_req, res) => {
  if (frontendOrigin) {
    res.redirect(frontendOrigin);
    return;
  }

  res.status(200).json({
    ok: true,
    service: "timexframe-api",
    message:
      "API server is running. Open the frontend app URL to use the website.",
  });
});

app.use("/api", router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof err === "object" && err && "status" in err && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : typeof err === "object" && err && "statusCode" in err && typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;

  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code?: unknown }).code)
      : undefined;

  if (status === 413 || code === "LIMIT_FILE_SIZE" || code === "entity.too.large") {
    res.status(413).json({
      error: "Upload failed",
      message:
        "This video is too large for the current web upload limit. Please choose a smaller file and try again.",
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected server error.";
  logger.error({ err }, "Unhandled request error");

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : "Request failed",
    message,
  });
});

export default app;
