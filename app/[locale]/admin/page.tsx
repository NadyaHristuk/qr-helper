import { setRequestLocale } from 'next-intl/server';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { canonicalPublicOrigin } from '@/lib/dynamic-qr/destination';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await isAdminAuthenticated())) {
    return <AdminLogin />;
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <AdminDashboard
      dynamicQrPublicOrigin={canonicalPublicOrigin()}
      initialOrders={orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }))}
    />
  );
}
