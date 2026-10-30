import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { generateSlug } from './slug';

export async function createDynamicQr(targetUrl: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.dynamicQr.create({ data: { slug: generateSlug(), targetUrl } });
    } catch (error) {
      const collision = error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('slug');
      if (!collision || attempt === 4) throw error;
    }
  }
  throw new Error('Could not allocate a dynamic QR slug');
}
