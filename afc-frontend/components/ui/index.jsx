'use client';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', fullWidth = false
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const variants = {
    primary:  'bg-brand-600 hover:bg-brand-500 text-white focus:ring-brand-500 shadow-lg shadow-brand-900/30',
    secondary:'bg-surface-card hover:bg-surface-hover text-slate-200 border border-surface-border focus:ring-slate-500',
    ghost:    'hover:bg-surface-card text-slate-300 hover:text-white focus:ring-slate-500',
    danger:   'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 focus:ring-red-500',
    success:  'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
    amber:    'bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold focus:ring-amber-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          className={`w-full bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500
            focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors
            ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', glow = false }) {
  return (
    <div className={`bg-surface-card border border-surface-border rounded-2xl ${glow ? 'glow-blue' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between p-6 pb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <div>
          <h3 className="font-semibold text-slate-100 font-display">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default:     'bg-slate-700 text-slate-300',
    success:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    danger:      'bg-red-500/15 text-red-400 border border-red-500/30',
    warning:     'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    info:        'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    purple:      'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, trend, color = 'blue', loading = false }) {
  const colors = {
    blue:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   border: 'border-brand-500/20' },
    green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
    purple: { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
    red:    { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-surface-card border ${c.border} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider truncate">{label}</p>
        {loading
          ? <div className="h-7 w-24 shimmer rounded mt-1" />
          : <p className={`text-2xl font-bold font-display ${c.text} mt-0.5`}>{value}</p>
        }
        {trend && <p className="text-xs text-slate-500 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="text-slate-300 font-semibold mb-1">{title}</h4>
      {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, rows, loading, emptyState }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-surface-border/50">
                {headers.map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 shimmer rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-slate-500">
                {emptyState || 'No data found'}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-slate-300 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h3 className="font-semibold text-slate-100 font-display">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
