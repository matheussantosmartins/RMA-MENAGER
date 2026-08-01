import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { uploadsDir } from '../../middlewares/upload.middleware';
import { getRmaById } from './rma.service';

export async function addRmaImages(rmaId: string, files: Express.Multer.File[]) {
  await getRmaById(rmaId);

  if (files.length === 0) {
    throw ApiError.badRequest('Nenhuma imagem enviada');
  }

  await prisma.rmaImage.createMany({
    data: files.map((file) => ({
      rmaId,
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
    })),
  });

  return prisma.rmaImage.findMany({ where: { rmaId }, orderBy: { createdAt: 'asc' } });
}

export async function removeRmaImage(rmaId: string, imageId: string) {
  const image = await prisma.rmaImage.findUnique({ where: { id: imageId } });

  if (!image || image.rmaId !== rmaId) {
    throw ApiError.notFound('Imagem não encontrada');
  }

  await prisma.rmaImage.delete({ where: { id: imageId } });

  const diskFilename = path.basename(image.url);
  await fs.unlink(path.join(uploadsDir, diskFilename)).catch(() => undefined);
}
