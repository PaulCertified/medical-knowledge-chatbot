# Medical Knowledge Chatbot

A sophisticated medical chatbot that leverages AWS Bedrock and OpenSearch to provide accurate, context-aware responses to medical queries. Built with React, TypeScript, and Node.js.

![Medical Chatbot Demo](demo.gif)

## Features

- 🤖 AI-powered medical knowledge responses using AWS Bedrock (Claude)
- 🔍 Semantic search with OpenSearch for accurate information retrieval
- 💬 Real-time chat interface with markdown and code support
- 🔐 Secure user authentication and session management
- ⚡ Rate limiting and request throttling
- 📱 Responsive, modern UI design
- 📚 Comprehensive API documentation

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) for components
- Framer Motion for animations
- React Query for state management
- React Markdown for message formatting

### Backend
- Node.js with Express
- TypeScript
- AWS Bedrock for AI capabilities
- OpenSearch for vector search
- JWT for authentication
- Redis for rate limiting
- Swagger for API documentation

### Testing
- Jest for unit testing
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking
- Integration and end-to-end tests

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS account with Bedrock access
- OpenSearch domain
- Redis instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medical-chatbot.git
cd medical-chatbot
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:

Backend (.env):
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
OPENSEARCH_URL=your_opensearch_url
REDIS_URL=your_redis_url
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Start the development servers:

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm start
```

## Testing

Run the test suites:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Frontend
1. Build the frontend:
```bash
cd frontend
npm run build
```
2. Deploy to Vercel/Netlify using their respective CLI tools or GitHub integration

### Backend
1. Build the backend:
```bash
cd backend
npm run build
```
2. Deploy to AWS Elastic Beanstalk or similar service

## API Documentation

API documentation is available at `/api-docs` when running the backend server. It includes:
- Authentication endpoints
- Chat endpoints
- Knowledge base management
- Rate limiting information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- AWS Bedrock team for the AI capabilities
- OpenSearch for vector search functionality
- Material-UI team for the component library 