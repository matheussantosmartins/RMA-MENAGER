import request from 'supertest';
import { RmaPriority, RmaStatus } from '@prisma/client';
import { prismaMock } from '../setup/prismaMock';
import { createApp } from '@/app';
import { signAccessToken } from '@/utils/jwt';

const app = createApp();

const USER_ID = '11111111-1111-4111-8111-111111111111';
const RMA_ID = '22222222-2222-4222-8222-222222222222';
const accessToken = signAccessToken({ sub: USER_ID, role: 'ADMIN' });

function authed(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string) {
  return request(app)[method](url).set('Authorization', `Bearer ${accessToken}`);
}

const BASE_RMA = {
  id: RMA_ID,
  rmaNumber: 'RMA-2026-00001',
  customerId: '33333333-3333-4333-8333-333333333333',
  productId: '44444444-4444-4444-8444-444444444444',
  serialNumber: 'SN-0001',
  issueDescription: 'Produto não liga',
  status: RmaStatus.PENDING,
  priority: RmaPriority.MEDIUM,
  resolutionNotes: null,
  assignedToId: null,
  createdById: USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: { id: '33333333-3333-4333-8333-333333333333', name: 'Cliente', email: 'c@x.com' },
  product: { id: '44444444-4444-4444-8444-444444444444', name: 'Produto', sku: 'SKU-1' },
  assignedTo: null,
  createdBy: { id: USER_ID, name: 'Admin' },
  images: [],
  statusHistory: [],
};

describe('RMA routes', () => {
  it('GET /api/rmas retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/api/rmas');
    expect(res.status).toBe(401);
  });

  it('GET /api/rmas retorna 400 para pageSize acima do limite', async () => {
    const res = await authed('get', '/api/rmas?pageSize=1000');
    expect(res.status).toBe(400);
  });

  it('GET /api/rmas retorna lista paginada', async () => {
    prismaMock.rma.findMany.mockResolvedValue([BASE_RMA] as never);
    prismaMock.rma.count.mockResolvedValue(1);

    const res = await authed('get', '/api/rmas');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('POST /api/rmas retorna 400 quando issueDescription é muito curta', async () => {
    const res = await authed('post', '/api/rmas').send({
      customerId: BASE_RMA.customerId,
      productId: BASE_RMA.productId,
      issueDescription: 'curto',
    });

    expect(res.status).toBe(400);
  });

  it('PATCH /api/rmas/:id/status rejeita transição inválida (PENDING -> CLOSED)', async () => {
    prismaMock.rma.findUnique.mockResolvedValue(BASE_RMA as never);

    const res = await authed('patch', `/api/rmas/${RMA_ID}/status`).send({
      status: 'CLOSED',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Transição de status inválida/);
  });

  it('PATCH /api/rmas/:id/status aceita transição válida (PENDING -> APPROVED)', async () => {
    prismaMock.rma.findUnique.mockResolvedValue(BASE_RMA as never);
    prismaMock.$transaction.mockImplementation(async (cb: never) =>
      (cb as (tx: unknown) => unknown)({
        rma: { update: jest.fn().mockResolvedValue({ ...BASE_RMA, status: RmaStatus.APPROVED }) },
        rmaStatusHistory: { create: jest.fn().mockResolvedValue({}) },
      }),
    );

    const res = await authed('patch', `/api/rmas/${RMA_ID}/status`).send({
      status: 'APPROVED',
      note: 'Aprovado para reparo',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('APPROVED');
  });
});
