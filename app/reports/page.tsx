
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ReportsContent } from './_components/reports-content';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
