import { prisma } from '../../lib/prisma';

const MONTHS_TO_TRACK = 6;
const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function getRmasPerMonth() {
  const now = new Date();
  const months = Array.from({ length: MONTHS_TO_TRACK }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_TRACK - 1 - i), 1);
    return monthDate;
  });

  const counts = await Promise.all(
    months.map((monthStart) => {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
      return prisma.rma.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      });
    }),
  );

  return months.map((monthStart, i) => ({
    month: `${MONTH_LABELS[monthStart.getMonth()]}/${monthStart.getFullYear()}`,
    count: counts[i],
  }));
}

async function getAverageResolutionDays() {
  const closedRmas = await prisma.rma.findMany({
    where: { status: 'CLOSED' },
    select: { createdAt: true, updatedAt: true },
  });

  if (closedRmas.length === 0) {
    return 0;
  }

  const totalDays = closedRmas.reduce((sum, rma) => {
    const diffMs = rma.updatedAt.getTime() - rma.createdAt.getTime();
    return sum + diffMs / (1000 * 60 * 60 * 24);
  }, 0);

  return Number((totalDays / closedRmas.length).toFixed(1));
}

export async function getDashboardStats() {
  const [
    total,
    byStatusRaw,
    byPriorityRaw,
    rmasThisMonth,
    avgResolutionDays,
    recentRmas,
    rmasPerMonth,
  ] = await Promise.all([
    prisma.rma.count(),
    prisma.rma.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.rma.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.rma.count({ where: { createdAt: { gte: startOfMonth(new Date()) } } }),
    getAverageResolutionDays(),
    prisma.rma.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rmaNumber: true,
        status: true,
        priority: true,
        createdAt: true,
        customer: { select: { name: true } },
        product: { select: { name: true } },
      },
    }),
    getRmasPerMonth(),
  ]);

  const byStatus = Object.fromEntries(byStatusRaw.map((row) => [row.status, row._count._all]));
  const byPriority = Object.fromEntries(
    byPriorityRaw.map((row) => [row.priority, row._count._all]),
  );

  return {
    totalRmas: total,
    rmasThisMonth,
    avgResolutionDays,
    byStatus,
    byPriority,
    recentRmas,
    rmasPerMonth,
  };
}
