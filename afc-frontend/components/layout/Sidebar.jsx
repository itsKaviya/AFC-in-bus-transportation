'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/wallet',    icon: '◎', label: 'Wallet' },
  { href: '/trips',     icon: '⇌', label: 'Trip History' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full shrink-0 border-b border-surface-border bg-surface-card lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      {/* Logo */}
      <div className="border-b border-surface-border px-4 py-4 sm:px-6 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-lg bus-pulse">
            🚌
          </div>
          <div>
            <p className="font-bold text-slate-100 font-display leading-none">AFC</p>
            <p className="text-xs text-slate-400 mt-0.5">Fare Collection</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:space-y-1 lg:py-5">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'}`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-surface-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{user?.rfidUID}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400 lg:justify-start"
        >
          <span>⎋</span> Sign out
        </button>
      </div>
    </aside>
  );
}
