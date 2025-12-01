import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import passport from "passport";

import { environment, isProduction } from "./configs/environment.config.js";
import { checkDBHealth, getConnectionStats } from "./configs/db.config.js";
import specs from "./configs/swagger.config.js";
import "./configs/passport.config.js";

import userRoutes from "./routes/user.route.js";
import fileUploadRoutes from "./routes/upload.route.js";

const ENV = process.env.NODE_ENV || "development";
const IS_PROD = ENV === "production";
const IS_DEV = ENV === "development";

const env = environment;
const app = express();

const setupMiddlewares = () => {
    app.use(express.json({ limit: env.server?.bodyLimit || "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: env.server?.bodyLimit || "50mb" }));

    app.use(
        helmet({
            contentSecurityPolicy: IS_PROD,
            crossOriginEmbedderPolicy: IS_PROD,
            hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true } : false
        })
    );

    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://issue.metronique.vercel.app",
        "https://www.issue.metronique.com",
        env.security?.corsOrigin
    ].filter(Boolean);

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                console.warn(`[SECURITY] CORS blocked origin: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
            maxAge: IS_PROD ? 86400 : 600,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
        })
    );

    app.use(compression({ level: IS_PROD ? 6 : 1 }));
    app.use(cookieParser(env.session?.secret));

    if (IS_PROD) {
        app.use(morgan("combined", {
            skip: (req, res) => res.statusCode < 400
        }));
    } else {
        app.use(morgan("dev"));
    }

    app.use(
        session({
            secret: env.session?.secret || "default-secret-change-in-prod",
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: IS_PROD,
                httpOnly: true,
                sameSite: IS_PROD ? "strict" : "lax",
                maxAge: env.session?.maxAge || 24 * 60 * 60 * 1000
            },
            name: "sessionId"
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    const limiter = rateLimit({
        windowMs: env.security?.rateLimit?.windowMs || 15 * 60 * 1000,
        max: env.security?.rateLimit?.maxRequests || 100,
        message: {
            success: false,
            message: "Too many requests, please try again later"
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            const whitelist = ['127.0.0.1', '::1', 'localhost'];
            return IS_DEV && whitelist.includes(req.ip);
        }
    });
    app.use("/api", limiter);
};

const setupStaticFiles = () => {
    const uploadDir = env.upload?.folder || "./uploads";

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[APP] Created upload directory: ${uploadDir}`);
    }

    app.use("/uploads", express.static(uploadDir, {
        maxAge: IS_PROD ? "1d" : 0,
        etag: IS_PROD
    }));

    app.use(express.static(path.join(process.cwd(), "public"), {
        maxAge: IS_PROD ? "7d" : 0,
        etag: IS_PROD
    }));
};

const setupRoutes = () => {
    const API_VERSION = env.api?.version || "v1";
    const API_PREFIX = `/api/${API_VERSION}`;

    if (!IS_PROD) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }'
        }));
    }

    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "Bug Tracker API",
            version: API_VERSION,
            environment: ENV,
            timestamp: new Date().toISOString()
        });
    });

    app.get("/health", async (req, res) => {
        try {
            const health = await checkDBHealth();
            const stats = getConnectionStats();

            const statusCode = health.status === "healthy" ? 200 : 503;

            res.status(statusCode).json({
                success: health.status === "healthy",
                status: health.status,
                database: health,
                stats: stats,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString(),
                environment: ENV
            });
        } catch (error) {
            console.error(`[HEALTH] Health check failed:`, error.message);
            res.status(503).json({
                success: false,
                status: "unhealthy",
                error: IS_PROD ? "Service unavailable" : error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    app.get("/api", (req, res) => {
        res.json({
            success: true,
            message: "Bug Tracker API is running",
            version: API_VERSION,
            environment: ENV,
            endpoints: {
                health: "/health",
                docs: IS_PROD ? null : "/api-docs",
                users: `${API_PREFIX}/users`,
                files: `${API_PREFIX}/files`
            }
        });
    });

    app.use(`${API_PREFIX}/users`, userRoutes);
    app.use(`${API_PREFIX}/files`, fileUploadRoutes);
};

const setupErrorHandlers = () => {
    app.use((req, res) => {
        console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
        res.status(404).json({
            success: false,
            error: "Route not found",
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });

    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || err.status || 500;

        console.error(`[ERROR] ${statusCode} - ${err.message}`);

        if (!IS_PROD) {
            console.error(`[ERROR] Stack trace:`, err.stack);
        }

        res.status(statusCode).json({
            success: false,
            error: IS_PROD ? "Internal server error" : err.message,
            ...(IS_DEV && { stack: err.stack }),
            timestamp: new Date().toISOString()
        });
    });
};

setupMiddlewares();
setupStaticFiles();
setupRoutes();
setupErrorHandlers();

export default app;