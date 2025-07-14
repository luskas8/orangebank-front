
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DepositContent } from './_components/deposit-content';

export default function DepositPage() {
  return (
    <ProtectedRoute>
      <DepositContent />
    </ProtectedRoute>
  );
}
