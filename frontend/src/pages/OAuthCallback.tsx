import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { Spinner } from '../components/primitives';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const errMsg = searchParams.get('error');

    if (errMsg) {
      setError(errMsg);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => {
          setError('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/login'), 3000);
        });
    } else {
      setError('Invalid callback parameters');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-surface-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Spinner size="lg" />
            <p className="text-sm text-surface-500">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}
