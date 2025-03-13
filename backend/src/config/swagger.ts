import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medical Chatbot API',
      version,
      description: 'API documentation for HIPAA-compliant Medical Chatbot',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        ChatMessage: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Role of the message sender',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Response ID',
            },
            content: {
              type: 'string',
              description: 'Generated response',
            },
            role: {
              type: 'string',
              enum: ['assistant'],
              description: 'Role of the message sender',
            },
            usage: {
              type: 'object',
              properties: {
                input_tokens: {
                  type: 'number',
                  description: 'Number of input tokens',
                },
                output_tokens: {
                  type: 'number',
                  description: 'Number of output tokens',
                },
              },
            },
          },
        },
        DocumentMetadata: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'Source of the document',
            },
            category: {
              type: 'string',
              description: 'Category of the document',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of document creation',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 