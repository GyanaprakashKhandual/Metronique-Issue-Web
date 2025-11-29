import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bug Tracker API Documentation',
            version: '1.0.0',
            description: 'Complete API documentation for Bug Tracker application',
            contact: {
                name: 'API Support',
                email: 'support@bugtracker.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            },
            {
                url: 'https://api.bugtracker.com',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Bearer token for authentication'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        firstName: {
                            type: 'string',
                            description: 'First name'
                        },
                        lastName: {
                            type: 'string',
                            description: 'Last name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email address'
                        },
                        phone: {
                            type: 'string',
                            description: 'Phone number'
                        },
                        profileImage: {
                            type: 'string',
                            description: 'Profile image URL'
                        },
                        isEmailVerified: {
                            type: 'boolean',
                            description: 'Email verification status'
                        },
                        mfaEnabled: {
                            type: 'boolean',
                            description: 'MFA status'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'suspended', 'deleted'],
                            description: 'Account status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        lastLogin: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last login timestamp'
                        }
                    }
                },
                File: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'File ID'
                        },
                        filename: {
                            type: 'string',
                            description: 'Original filename'
                        },
                        uploadedFilename: {
                            type: 'string',
                            description: 'Uploaded filename on server'
                        },
                        fileUrl: {
                            type: 'string',
                            description: 'File URL'
                        },
                        mimeType: {
                            type: 'string',
                            description: 'MIME type'
                        },
                        fileType: {
                            type: 'string',
                            enum: ['image', 'video', 'document'],
                            description: 'File category'
                        },
                        size: {
                            type: 'number',
                            description: 'File size in bytes'
                        },
                        sizeFormatted: {
                            type: 'string',
                            description: 'Formatted file size'
                        },
                        uploadedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Upload timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        error: {
                            type: 'string',
                            description: 'Error details'
                        }
                    }
                }
            }
        }
    },
    apis: [
        './src/routes/users.route.js',
        './src/routes/upload.route.js'
    ]
};

const specs = swaggerJsdoc(options);

export default specs;