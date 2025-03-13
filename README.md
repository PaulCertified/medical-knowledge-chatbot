# Medical Knowledge Chatbot

A sophisticated chatbot application that leverages AI to provide medical knowledge and information to users. This project uses modern web technologies and AI services to create an interactive and informative healthcare information platform.

## Features

- Real-time chat interface with AI-powered responses
- Medical knowledge base integration
- User authentication and session management
- Rate limiting and request validation
- Secure API endpoints
- Comprehensive error handling
- Logging and monitoring

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js for API routing
- JWT for authentication
- AWS DynamoDB for data storage
- Redis for caching and rate limiting
- AWS Bedrock for AI integration
- OpenSearch for knowledge base search
- Jest for testing

### Frontend
- React with TypeScript
- Material-UI for components
- React Query for state management
- React Testing Library for testing

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AWS account with appropriate permissions
- Redis server
- OpenSearch cluster

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PaulCertified/medical-knowledge-chatbot.git
cd medical-knowledge-chatbot
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend
cp .env.example .env
```
Edit the `.env` file with your configuration values.

## Configuration

The application requires several environment variables to be set. Check `.env.example` for the required variables:

- `NODE_ENV`: Application environment
- `PORT`: Server port
- `HOST`: Server host
- `JWT_SECRET`: Secret for JWT tokens
- `AWS_*`: AWS credentials and configuration
- `REDIS_URL`: Redis connection string
- Various other configuration options

## Running the Application

### Development Mode

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### Production Mode

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## API Documentation

The API endpoints are documented using OpenAPI/Swagger. Access the documentation at:
`http://localhost:3000/api-docs` when running the development server.

### Key Endpoints

- `/api/auth/*`: Authentication endpoints
- `/api/chat/*`: Chat interaction endpoints
- `/api/health`: Health check endpoint

## Security

- JWT-based authentication
- Rate limiting
- Input validation
- CORS protection
- Environment variable protection
- Secure password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Authors

- Paul Gipson (@PaulCertified)

## Acknowledgments

- AWS for cloud infrastructure
- OpenAI for AI technology inspiration
- The open-source community for various tools and libraries used in this project
