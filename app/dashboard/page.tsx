
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardContent } from './_components/dashboard-content';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
