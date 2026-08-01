import { PrismaClient, RmaPriority, RmaStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingRmaCount = await prisma.rma.count();
  if (existingRmaCount > 0) {
    console.log('Seed já aplicado anteriormente, pulando.');
    return;
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rmamanager.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@rmamanager.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'tecnico@rmamanager.com' },
    update: {},
    create: {
      name: 'Técnico Exemplo',
      email: 'tecnico@rmamanager.com',
      passwordHash,
      role: 'TECHNICIAN',
    },
  });

  const customers = await Promise.all(
    [
      {
        name: 'Ana Silva',
        email: 'ana.silva@example.com',
        phone: '11988887777',
        address: 'São Paulo, SP',
      },
      {
        name: 'Bruno Costa',
        email: 'bruno.costa@example.com',
        phone: '21977776666',
        address: 'Rio de Janeiro, RJ',
      },
      {
        name: 'Carla Souza',
        email: 'carla.souza@example.com',
        phone: '31966665555',
        address: 'Belo Horizonte, MG',
      },
    ].map((c) => prisma.customer.create({ data: c })),
  );

  const products = await Promise.all(
    [
      { sku: 'SKU-NB-001', name: 'Notebook Pro 14"', brand: 'TechBrand', category: 'Notebooks' },
      { sku: 'SKU-MO-002', name: 'Mouse Wireless X', brand: 'TechBrand', category: 'Periféricos' },
      { sku: 'SKU-MN-003', name: 'Monitor 27" 4K', brand: 'VisionCo', category: 'Monitores' },
    ].map((p) => prisma.product.create({ data: p })),
  );

  const rmaSeeds: Array<{
    customerId: string;
    productId: string;
    serialNumber: string;
    issueDescription: string;
    status: RmaStatus;
    priority: RmaPriority;
  }> = [
    {
      customerId: customers[0].id,
      productId: products[0].id,
      serialNumber: 'SN-0001',
      issueDescription: 'Notebook não liga após atualização de firmware.',
      status: 'PENDING',
      priority: 'HIGH',
    },
    {
      customerId: customers[1].id,
      productId: products[1].id,
      serialNumber: 'SN-0002',
      issueDescription: 'Mouse com clique duplo indevido.',
      status: 'IN_REPAIR',
      priority: 'LOW',
    },
    {
      customerId: customers[2].id,
      productId: products[2].id,
      serialNumber: 'SN-0003',
      issueDescription: 'Monitor com manchas na tela.',
      status: 'CLOSED',
      priority: 'MEDIUM',
    },
  ];

  for (const [i, seed] of rmaSeeds.entries()) {
    const rma = await prisma.rma.create({
      data: {
        rmaNumber: `RMA-2026-${String(i + 1).padStart(5, '0')}`,
        customerId: seed.customerId,
        productId: seed.productId,
        serialNumber: seed.serialNumber,
        issueDescription: seed.issueDescription,
        status: seed.status,
        priority: seed.priority,
        assignedToId: technician.id,
        createdById: admin.id,
      },
    });

    await prisma.rmaStatusHistory.create({
      data: {
        rmaId: rma.id,
        fromStatus: null,
        toStatus: 'PENDING',
        changedById: admin.id,
        note: 'RMA criado.',
      },
    });

    if (rma.status !== 'PENDING') {
      await prisma.rmaStatusHistory.create({
        data: {
          rmaId: rma.id,
          fromStatus: 'PENDING',
          toStatus: rma.status,
          changedById: technician.id,
          note: `Status atualizado para ${rma.status}.`,
        },
      });
    }
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
