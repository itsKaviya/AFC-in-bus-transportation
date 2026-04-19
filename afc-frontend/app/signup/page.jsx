'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Input } from '@/components/ui';

export default function SignupPage() {
  const { signupUser } = useAuth();
  const { addToast }   = useToast();
  const [form, setForm]       = useState({ name: '', email: '', password: '', rfidUID: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2)     e.name     = 'Name must be at least 2 characters';
    if (!form.email)                             e.email    = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.rfidUID || form.rfidUID.length < 4)   e.rfidUID  = 'RFID UID must be at least 4 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      await signupUser(form.name, form.email, form.password, form.rfidUID);
    } catch (err) {
      addToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🚌</span>
            <span className="text-2xl font-bold font-display gradient-text">AFC System</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-slate-100">Create your account</h2>
          <p className="text-slate-400 mt-2">Register your RFID card and start riding</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Full name" placeholder="Arjun Sharma" value={form.name}
                  onChange={set('name')} error={errors.name} icon="👤" />
              </div>
              <div className="col-span-2">
                <Input label="Email address" type="email" placeholder="arjun@example.com"
                  value={form.email} onChange={set('email')} error={errors.email} icon="✉" />
              </div>
              <Input label="Password" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={set('password')} error={errors.password} icon="🔒" />
              <Input label="RFID Card UID" placeholder="e.g. A1B2C3D4"
                value={form.rfidUID} onChange={set('rfidUID')} error={errors.rfidUID} icon="📡" />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Create account & get started
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* RFID hint */}
        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
          <span className="text-amber-400 text-lg flex-shrink-0">📡</span>
          <p className="text-xs text-amber-300/80">
            Your RFID UID is printed on your transit card. It's a unique 8-16 character code. 
            In a real deployment this would be scanned automatically at registration kiosks.
          </p>
        </div>
      </div>
    </div>
  );
}
