import { useState } from 'react';
import { useAuth } from '@/store/auth';
import { useRouter, Link } from '@/store/router';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(name, email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (mode === 'signup') {
        setSuccess(true);
        setTimeout(() => navigate('/account'), 1500);
      } else {
        navigate('/account');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 animate-fade-in-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400 transition-transform hover:scale-110">
            <Zap className="h-6 w-6 text-ink-950" fill="currentColor" />
          </div>
          <span className="font-display text-2xl font-bold text-ink-100">SNEAKORA</span>
        </Link>

        <div className="mt-8 rounded-3xl border border-ink-700 bg-ink-900 p-8 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          {/* Tabs */}
          <div className="flex gap-2 rounded-full bg-ink-800 p-1">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all ${mode === 'signin' ? 'bg-accent-400 text-ink-950' : 'text-ink-400'}`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all ${mode === 'signup' ? 'bg-accent-400 text-ink-950' : 'text-ink-400'}`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {success ? (
            <div className="mt-8 flex flex-col items-center text-center animate-bounce-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-400">
                <Check className="h-8 w-8 text-ink-950" strokeWidth={3} />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-ink-100">Account Created!</h2>
              <p className="mt-2 text-sm text-ink-400">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="text-sm font-semibold text-ink-100">Name</label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-xl border border-ink-700 bg-ink-800 pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-ink-100">Email</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-ink-700 bg-ink-800 pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-100">Password</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-ink-700 bg-ink-800 pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent-400 focus:outline-none"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="animate-fade-in-up">
                  <label className="text-sm font-semibold text-ink-100">Confirm password</label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-ink-700 bg-ink-800 pl-11 pr-4 py-3.5 text-sm text-ink-100 placeholder:text-ink-500 transition-colors focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/20"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-400 py-4 text-sm font-bold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'signin' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}</>
                ) : (
                  <>{mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="text-center text-xs text-ink-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                  className="font-bold text-accent-400 hover:underline"
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>

              <div className="pt-2 text-center">
                <Link to="/shop" className="text-xs text-ink-500 hover:text-ink-300">
                  Continue as guest →
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
