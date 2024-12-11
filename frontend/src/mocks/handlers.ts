import { rest } from 'msw';
import { API_URL } from '@services/api';

export const handlers = [
  // Auth handlers
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'fake-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    );
  }),

  // Persona handlers
  rest.get(`${API_URL}/personas`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Test Persona',
          description: 'A test persona',
          traits: ['friendly', 'helpful'],
        },
      ])
    );
  }),

  // Test handlers
  rest.get(`${API_URL}/tests`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Case',
          description: 'A test case',
          objective: 'Test objective',
          status: 'pending',
          personaId: '1',
        },
      ])
    );
  }),
];
