
import { ProtectedRoute } from '@/components/auth/protected-route';
import { TransferContent } from './_components/transfer-content';

export default function TransferPage() {
  return (
    <ProtectedRoute>
      <TransferContent />
    </ProtectedRoute>
  );
}
