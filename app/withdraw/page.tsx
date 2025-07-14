
import { ProtectedRoute } from '@/components/auth/protected-route';
import { WithdrawContent } from './_components/withdraw-content';

export default function WithdrawPage() {
  return (
    <ProtectedRoute>
      <WithdrawContent />
    </ProtectedRoute>
  );
}
