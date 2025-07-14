'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useIsClient } from '@/hooks/use-local-storage';

export const AuthDebugPanel: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const isClient = useIsClient();
  const [token, setToken] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
  }, [isClient, user]);

  if (!isClient) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
        style={{ fontSize: '12px' }}
      >
        🐛
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
          <div className="mb-2 font-bold text-blue-400">Auth Debug Panel</div>
          
          <div className="space-y-1">
            <div>
              <span className="text-gray-400">Loading:</span>{' '}
              <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                {loading ? 'true' : 'false'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Is Client:</span>{' '}
              <span className={isClient ? 'text-green-400' : 'text-red-400'}>
                {isClient ? 'true' : 'false'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Authenticated:</span>{' '}
              <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? 'true' : 'false'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Token:</span>{' '}
              <span className={token ? 'text-green-400' : 'text-red-400'}>
                {token ? `${token.substring(0, 10)}...` : 'null'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">User:</span>{' '}
              <span className={user ? 'text-green-400' : 'text-red-400'}>
                {user ? user.name : 'null'}
              </span>
            </div>
            
            {user && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-gray-400">User ID: {user.id}</div>
                <div className="text-gray-400">Email: {user.email}</div>
              </div>
            )}
            
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-gray-400">URL: {window.location.pathname}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
