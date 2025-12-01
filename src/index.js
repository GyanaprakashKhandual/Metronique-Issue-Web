import http from "http";
import app from "./app.js";
import { environment, validateEnvironment } from "./configs/environment.config.js";
import { connectDB, disconnectDB } from "./configs/db.config.js";

const ENV = process.env.NODE_ENV || "development";
const IS_PROD = ENV === "production";

validateEnvironment();

const env = environment;
const server = http.createServer(app);

const startServer = async () => {
    const startTime = Date.now();

    try {
        console.log(`[SERVER] Starting server in ${ENV} mode...`);

        await connectDB();

        const PORT = env.node?.port || 5000;
        const HOST = env.node?.host || "localhost";

        server.listen(PORT, HOST, () => {
            const duration = Date.now() - startTime;

            console.log("=".repeat(70));
            console.log(`[SERVER] ✓ Server running on http://${HOST}:${PORT}`);
            console.log(`[SERVER] Environment: ${ENV}`);
            console.log(`[SERVER] Started in ${duration}ms`);
            console.log(`[SERVER] Health: http://${HOST}:${PORT}/health`);
            if (!IS_PROD) {
                console.log(`[SERVER] API Docs: http://${HOST}:${PORT}/api-docs`);
            }
            console.log(`[SERVER] Process ID: ${process.pid}`);
            console.log("=".repeat(70));
        });

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`[SERVER] Port ${PORT} is already in use`);
            } else {
                console.error(`[SERVER] Server error:`, error.message);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error(`[SERVER] Failed to start server:`, error.message);
        if (!IS_PROD) {
            console.error(`[SERVER] Error details:`, error);
        }
        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    console.log(`\n[SERVER] ${signal} received, shutting down gracefully...`);

    const shutdownTimeout = setTimeout(() => {
        console.error(`[SERVER] Forced shutdown after timeout`);
        process.exit(1);
    }, 30000);

    try {
        console.log(`[SERVER] Closing HTTP server...`);
        server.close(async () => {
            clearTimeout(shutdownTimeout);

            console.log(`[SERVER] HTTP server closed`);

            await disconnectDB();

            console.log(`[SERVER] ✓ Shutdown complete`);
            process.exit(0);
        });

        setTimeout(() => {
            console.log(`[SERVER] Forcing remaining connections to close...`);
            server.closeAllConnections?.();
        }, 5000);

    } catch (error) {
        clearTimeout(shutdownTimeout);
        console.error(`[SERVER] Error during shutdown:`, error.message);
        process.exit(1);
    }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
    console.error(`[FATAL] Uncaught exception:`, error);
    gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
    console.error(`[FATAL] Unhandled rejection at:`, promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
});

startServer();

export { server };