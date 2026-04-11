import app from "./app";
import { logger } from "./lib/logger";
import { ensureDirectories, cleanupOldSessions } from "./services/ffmpeg.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Ensure upload/frames directories exist at startup
await ensureDirectories();

// Auto-cleanup old sessions every 30 minutes (1 hour max age)
setInterval(() => {
  cleanupOldSessions(3600000).catch(() => {});
}, 30 * 60 * 1000);

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Set longer timeouts for long-running operations like frame extraction
// Socket timeout: 30 minutes (1800 seconds) - frame extraction is CPU intensive
server.setTimeout(30 * 60 * 1000);
server.keepAliveTimeout = 35 * 60 * 1000;
server.headersTimeout = 35 * 60 * 1000;
