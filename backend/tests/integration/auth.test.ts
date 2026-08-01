import bcrypt from 'bcrypt';
import request from 'supertest';
import { prismaMock } from '../setup/prismaMock';
import { createApp } from '@/app';

const app = createApp();

const FIXTURE_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Admin Teste',
  email: 'admin@rmamanager.com',
  role: 'ADMIN' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth routes', () => {
  describe('POST /api/auth/login', () => {
    it('retorna 400 quando o corpo é inválido', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('retorna 401 quando o e-mail não existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ninguem@rmamanager.com', password: 'qualquer123' });

      expect(res.status).toBe(401);
    });

    it('retorna 401 quando a senha está incorreta', async () => {
      const passwordHash = await bcrypt.hash('SenhaCorreta123', 10);
      prismaMock.user.findUnique.mockResolvedValue({ ...FIXTURE_USER, passwordHash });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: FIXTURE_USER.email, password: 'SenhaErrada' });

      expect(res.status).toBe(401);
    });

    it('retorna 200, access token e cookie de refresh quando as credenciais são válidas', async () => {
      const passwordHash = await bcrypt.hash('SenhaCorreta123', 10);
      prismaMock.user.findUnique.mockResolvedValue({ ...FIXTURE_USER, passwordHash });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: FIXTURE_USER.email, password: 'SenhaCorreta123' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user.email).toBe(FIXTURE_USER.email);
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna 401 sem token de acesso', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('retorna o perfil do usuário autenticado', async () => {
      const passwordHash = await bcrypt.hash('SenhaCorreta123', 10);
      prismaMock.user.findUnique.mockResolvedValue({ ...FIXTURE_USER, passwordHash });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: FIXTURE_USER.email, password: 'SenhaCorreta123' });

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe(FIXTURE_USER.email);
      expect(meRes.body.passwordHash).toBeUndefined();
    });
  });
});
