import { rest } from 'msw';
import { v4 as uuidv4 } from 'uuid';

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
};

export const handlers = [
  // Auth endpoints
  rest.get('/api/auth/session', (req, res, ctx) => {
    const token = req.cookies.auth_token;
    if (!token) {
      return res(ctx.status(401), ctx.json({ message: 'Authentication required' }));
    }
    return res(ctx.json({ user: mockUser }));
  }),

  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.cookie('auth_token', 'mock-token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
        ctx.json({ user: mockUser })
      );
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),

  rest.post('/api/auth/signup', async (req, res, ctx) => {
    const { email } = await req.json();
    if (email === 'existing@example.com') {
      return res(ctx.status(409), ctx.json({ message: 'Email already registered' }));
    }
    return res(
      ctx.status(201),
      ctx.cookie('auth_token', 'mock-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      }),
      ctx.json({ user: { ...mockUser, email } })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.cookie('auth_token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0,
      }),
      ctx.json({ message: 'Logged out successfully' })
    );
  }),

  // Chat endpoints
  rest.post('/api/chat/generate', async (req, res, ctx) => {
    const { query } = await req.json();
    return res(
      ctx.json({
        response: `Mock response to: ${query}`,
        context: [
          { id: uuidv4(), relevance: 0.9 },
          { id: uuidv4(), relevance: 0.8 },
        ],
      })
    );
  }),

  rest.post('/api/chat/knowledge', async (req, res, ctx) => {
    return res(ctx.json({ message: 'Content added successfully' }));
  }),

  rest.get('/api/chat/knowledge/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('query');
    return res(
      ctx.json([
        {
          content: `Mock content related to: ${query}`,
          score: 0.9,
          metadata: { source: 'test' },
        },
      ])
    );
  }),
]; 