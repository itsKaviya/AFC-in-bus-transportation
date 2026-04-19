'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      await loginUser(form.email, form.password);
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-900 via-surface to-violet-950 flex-col items-center justify-center p-12">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6 bus-pulse">🚌</div>
          <h1 className="text-4xl font-bold font-display gradient-text mb-4">AFC System</h1>
          <p className="text-slate-400 text-lg max-w-xs">Smart automated fare collection powered by RFID & GPS technology.</p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '⚡', title: 'Instant Tap', desc: 'RFID-based tap-in & out' },
              { icon: '📍', title: 'GPS Tracking', desc: 'Haversine fare calculation' },
              { icon: '💳', title: 'Smart Wallet', desc: 'Auto deduction on exit' },
              { icon: '📊', title: 'Trip History', desc: 'Full journey analytics' },
            ].map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-semibold text-slate-200 text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-3xl">🚌</span>
            <span className="text-xl font-bold font-display gradient-text">AFC System</span>
          </div>

          <h2 className="text-3xl font-bold font-display text-slate-100 mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              icon="✉"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              icon="🔒"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign in to dashboard
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-surface-card border border-surface-border rounded-xl">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-xs text-slate-500 font-mono">Email: demo@afc.com</p>
            <p className="text-xs text-slate-500 font-mono">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
