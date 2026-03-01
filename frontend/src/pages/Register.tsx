import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';
import { Button, Input } from '../components/primitives';
import { useToast } from '../components/primitives';

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', display_name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (form.password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        display_name: form.display_name || undefined,
      });
      addToast('Account created successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">DevIntel</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Start measuring what matters</h1>
          <p className="text-white/80 text-lg">
            Join thousands of developers using AI-powered intelligence to track growth, identify skill gaps,
            and accelerate their careers.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Connect your GitHub in one click',
              'Get your DevScore in minutes',
              'Upload resume for AI analysis',
              'Track your growth over time',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">DevIntel</span>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-surface-500">Start unlocking developer intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username" value={form.username} onChange={update('username')} placeholder="johndoe" required />
              <Input label="Display name" value={form.display_name} onChange={update('display_name')} placeholder="John Doe" />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required autoComplete="email" />
            <Input label="Password" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required hint="At least 8 characters" autoComplete="new-password" />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={update('confirm')} placeholder="••••••••" required autoComplete="new-password" />

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Create account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200 dark:border-surface-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-50 dark:bg-surface-950 text-surface-500">Or</span>
              </div>
            </div>
            <a
              href="/api/auth/github"
              className="mt-4 flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign up with GitHub
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
