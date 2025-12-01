import mongoose from 'mongoose';

const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';
const IS_STAGING = ENV === 'staging';

const getMongoURI = () => {
    if (IS_PRODUCTION) {
        return process.env.MONGODB_URI_PROD;
    }
    if (IS_STAGING) {
        return process.env.MONGODB_URI_STAGING;
    }
    return process.env.MONGODB_URI_DEV;
};

const getConnectionOptions = () => ({
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 5,
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT) || 45000,
    connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT) || 10000,
    retryWrites: true,
    retryReads: true,
    appName: process.env.APP_NAME || 'BugTrackerAPI',
    monitorCommands: process.env.DEBUG_MONGO === 'true',
    autoIndex: !IS_PRODUCTION,
    family: 4
});

const setupConnectionListeners = () => {
    mongoose.connection.on('connected', () => {
        console.log(`[DATABASE] Connected to MongoDB [${ENV}]`);
        console.log(`[DATABASE] Host: ${mongoose.connection.host}`);
        console.log(`[DATABASE] Name: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error(`[DATABASE] Connection error:`, err.message);
        if (!IS_PRODUCTION) {
            console.error(`[DATABASE] Error details:`, err);
        }
    });

    mongoose.connection.on('disconnected', () => {
        console.warn(`[DATABASE] Disconnected from MongoDB`);
    });

    mongoose.connection.on('reconnected', () => {
        console.log(`[DATABASE] Reconnected to MongoDB`);
    });

    mongoose.connection.on('reconnectFailed', () => {
        console.error(`[DATABASE] Failed to reconnect to MongoDB`);
    });
};

const setupGracefulShutdown = () => {
    const shutdown = async (signal) => {
        console.log(`\n[DATABASE] ${signal} received, closing MongoDB connection...`);
        try {
            await mongoose.connection.close();
            console.log(`[DATABASE] Connection closed gracefully`);
            process.exit(0);
        } catch (err) {
            console.error(`[DATABASE] Error during shutdown:`, err.message);
            process.exit(1);
        }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2'));
};

const createIndexes = async () => {
    const startTime = Date.now();
    console.log(`[DATABASE] Creating indexes...`);

    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        const indexOperations = [];

        if (collectionNames.includes('documents')) {
            indexOperations.push(
                db.collection('documents').createIndex({ title: 'text', 'content.text': 'text' }),
                db.collection('documents').createIndex({ workspace: 1, owner: 1 }),
                db.collection('documents').createIndex({ workspace: 1, createdAt: -1 })
            );
        }

        if (collectionNames.includes('folders')) {
            indexOperations.push(
                db.collection('folders').createIndex({ name: 'text', description: 'text' })
            );
        }

        if (collectionNames.includes('templates')) {
            indexOperations.push(
                db.collection('templates').createIndex({ name: 'text', description: 'text' })
            );
        }

        if (collectionNames.includes('activities')) {
            indexOperations.push(
                db.collection('activities').createIndex({ workspace: 1, createdAt: -1 }),
                db.collection('activities').createIndex({ actor: 1, createdAt: -1 })
            );
        }

        if (collectionNames.includes('comments')) {
            indexOperations.push(
                db.collection('comments').createIndex({ document: 1, createdAt: -1 })
            );
        }

        if (collectionNames.includes('notifications')) {
            indexOperations.push(
                db.collection('notifications').createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
            );
        }

        if (collectionNames.includes('users')) {
            indexOperations.push(
                db.collection('users').createIndex({ email: 1 }, { unique: true }),
                db.collection('users').createIndex({ 'workspaces.workspace': 1 })
            );
        }

        if (collectionNames.includes('workspaces')) {
            indexOperations.push(
                db.collection('workspaces').createIndex({ slug: 1 }, { unique: true }),
                db.collection('workspaces').createIndex({ owner: 1 })
            );
        }

        await Promise.all(indexOperations);

        const duration = Date.now() - startTime;
        console.log(`[DATABASE] Indexes created successfully (${duration}ms)`);
    } catch (error) {
        console.error(`[DATABASE] Index creation failed:`, error.message);
        if (!IS_PRODUCTION) {
            console.error(`[DATABASE] Index error details:`, error);
        }
    }
};

const connectDB = async () => {
    const startTime = Date.now();

    try {
        const mongoURI = getMongoURI();

        if (!mongoURI) {
            throw new Error('MongoDB URI not configured for current environment');
        }

        console.log(`[DATABASE] Connecting to MongoDB...`);
        console.log(`[DATABASE] Environment: ${ENV}`);

        const options = getConnectionOptions();
        const connection = await mongoose.connect(mongoURI, options);

        setupConnectionListeners();
        setupGracefulShutdown();

        const duration = Date.now() - startTime;
        console.log(`[DATABASE] Connection established (${duration}ms)`);

        if (!IS_PRODUCTION) {
            await createIndexes();
        }

        return connection;
    } catch (error) {
        console.error(`[DATABASE] Connection failed:`, error.message);
        if (!IS_PRODUCTION) {
            console.error(`[DATABASE] Connection error details:`, error);
        }
        process.exit(1);
    }
};

const checkDBHealth = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return {
                status: 'unhealthy',
                connected: false,
                state: getConnectionState()
            };
        }

        const startTime = Date.now();
        const admin = mongoose.connection.db.admin();
        await admin.ping();
        const latency = Date.now() - startTime;

        return {
            status: 'healthy',
            connected: true,
            latency: `${latency}ms`,
            state: 'connected',
            database: mongoose.connection.name,
            host: mongoose.connection.host
        };
    } catch (error) {
        console.error(`[DATABASE] Health check failed:`, error.message);
        return {
            status: 'unhealthy',
            connected: false,
            error: error.message
        };
    }
};

const getConnectionState = () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
};

const getConnectionStats = () => {
    const connection = mongoose.connection;
    return {
        state: getConnectionState(),
        database: connection.name,
        host: connection.host,
        port: connection.port,
        models: connection.modelNames().length,
        collections: Object.keys(connection.collections).length,
        readyState: connection.readyState
    };
};

const disconnectDB = async () => {
    try {
        console.log(`[DATABASE] Disconnecting from MongoDB...`);
        await mongoose.disconnect();
        console.log(`[DATABASE] Disconnected successfully`);
    } catch (error) {
        console.error(`[DATABASE] Disconnect error:`, error.message);
        throw error;
    }
};

const resetConnection = async () => {
    try {
        console.log(`[DATABASE] Resetting connection...`);
        await disconnectDB();
        await connectDB();
        console.log(`[DATABASE] Connection reset successfully`);
    } catch (error) {
        console.error(`[DATABASE] Connection reset failed:`, error.message);
        throw error;
    }
};

export {
    connectDB,
    disconnectDB,
    checkDBHealth,
    getConnectionStats,
    getConnectionState,
    resetConnection
};