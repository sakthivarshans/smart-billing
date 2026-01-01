import { AdminDashboardLayout } from '@/components/admin-dashboard-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
