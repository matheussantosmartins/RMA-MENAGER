import { http, HttpResponse } from 'msw';
import type { User } from '../types/user';

export const FIXTURE_ADMIN: User = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Admin Teste',
  email: 'admin@rmamanager.com',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === FIXTURE_ADMIN.email && body.password === 'Password123!') {
      return HttpResponse.json({ user: FIXTURE_ADMIN, accessToken: 'fake-access-token' });
    }

    return HttpResponse.json({ message: 'E-mail ou senha inválidos' }, { status: 401 });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({ message: 'Refresh token ausente' }, { status: 401 });
  }),

  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/auth/me', () => HttpResponse.json(FIXTURE_ADMIN)),

  http.get('/api/rmas', () =>
    HttpResponse.json({
      items: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          rmaNumber: 'RMA-2026-00001',
          serialNumber: 'SN-0001',
          issueDescription: 'Produto não liga',
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: { id: 'c1', name: 'Ana Silva' },
          product: { id: 'p1', name: 'Notebook Pro 14"' },
          assignedTo: null,
        },
      ],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    }),
  ),
];
