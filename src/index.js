import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import env from './configs/environment.config.js';
import connectDB from './configs/db.config.js';
import specs from './configs/swagger.config.js';

import userRoutes from './routes/users.route.js';
import fileUploadRoutes from './routes/upload.route.js';

env.validateEnvironment();

const app = express();
app.use(express.json());

const uploadDir = process.env.UPLOAD_FOLDER || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static('uploads'));
const server = http.createServer(app);

app.use(helmet({
    contentSecurityPolicy: env.isProduction(),
    crossOriginEmbedderPolicy: env.isProduction()
}));

const allowedOrigins = [
    'http://localhost:3000',
    'https://issue.metronique.vercel.app',
    'https://www.issue.metronique.com',
    env.security.corsOrigin
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`[SERVER] CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400
}));

app.use(compression());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

app.use((req, res, next) => {
    try {
        if (req.body) req.body = mongoSanitize.sanitize(req.body);
        if (req.params) req.params = mongoSanitize.sanitize(req.params);
    } catch (err) {
        console.error(`[SERVER] Mongo sanitization error: ${err.message}`);
    }
    next();
});

if (env.isDevelopment()) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(session({
    secret: env.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.session.cookie.secure,
        httpOnly: env.session.cookie.httpOnly,
        sameSite: env.session.cookie.sameSite,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
    windowMs: env.security.rateLimit.windowMs,
    max: env.security.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true
    },
    customCss: '.swagger-ui .topbar { display: none }'
}));

app.get('/health', async (req, res) => {
    const dbHealth = await connectDB.checkDBHealth();
    const dbStats = connectDB.getConnectionStats();

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.node.env,
        uptime: process.uptime(),
        database: dbHealth,
        stats: dbStats,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    });
});

const API_VERSION = process.env.API_VERSION || 'v1';

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'Bug Tracker API',
        version: API_VERSION,
        environment: env.node.env,
        timestamp: new Date().toISOString(),
        documentation: '/api-docs'
    });
});

app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/files`, fileUploadRoutes);

app.use((req, res) => {
    console.log(`[SERVER] 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

app.use((err, req, res, next) => {
    console.error(`[SERVER] Error on ${req.method} ${req.originalUrl}: ${err.message}`);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        console.log(`[SERVER] Duplicate entry detected: ${field}`);
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry found',
            field
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: env.isProduction() ? 'Internal server error' : err.message,
        ...(env.isDevelopment() && { stack: err.stack })
    });
});

const startServer = async () => {
    try {
        console.log('[SERVER] Starting server initialization...');

        await connectDB();
        console.log('[SERVER] Database connected successfully');

        const PORT = env.node.port;
        const HOST = env.node.host;

        server.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(60));
            console.log(`[SERVER] Environment: ${env.node.env.toUpperCase()}`);
            console.log(`[SERVER] Server URL: http://${HOST}:${PORT}`);
            console.log(`[SERVER] Health Check: http://${HOST}:${PORT}/health`);
            console.log(`[SERVER] API Endpoint: http://${HOST}:${PORT}/api`);
            console.log(`[SERVER] API Documentation: http://${HOST}:${PORT}/api-docs`);
            console.log(`[SERVER] API Version: ${API_VERSION}`);
            console.log('='.repeat(60));
            console.log('');
        });
    } catch (error) {
        console.error(`[SERVER] Failed to start: ${error.message}`);
        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    console.log(`\n[SERVER] ${signal} received - initiating graceful shutdown...`);

    server.close(async () => {
        console.log('[SERVER] HTTP server closed');

        try {
            await connectDB.disconnectDB();
            console.log('[SERVER] Database connections closed');
            console.log('[SERVER] Shutdown completed successfully');
            process.exit(0);
        } catch (error) {
            console.error(`[SERVER] Error during shutdown: ${error.message}`);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('[SERVER] Forced shutdown - timeout exceeded');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER] Unhandled Promise Rejection:', reason);
    if (env.isProduction()) {
        gracefulShutdown('UNHANDLED_REJECTION');
    }
});

process.on('uncaughtException', (error) => {
    console.error('[SERVER] Uncaught Exception:', error.message);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}

export default app;