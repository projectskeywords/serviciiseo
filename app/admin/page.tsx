import type { Metadata } from 'next';
import AdminLoginClient from '@/components/admin/AdminLoginClient';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Admin — keywords.md',
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
