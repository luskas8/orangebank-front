
import { ProtectedRoute } from '@/components/auth/protected-route';
import { InvestmentsContent } from './_components/investments-content';

export default function InvestmentsPage() {
  return (
    <ProtectedRoute>
      <InvestmentsContent />
    </ProtectedRoute>
  );
}
