'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardBody, StatCard, Badge, Button, Input, Modal, EmptyState, Table } from '@/components/ui';
import { useWallet } from '@/hooks/useWallet';

const QUICK_AMOUNTS = [100, 200, 500, 1000];

function txBadge(type) {
  return type === 'recharge'
    ? <Badge variant="success">+ Recharge</Badge>
    : <Badge variant="warning">− Fare</Badge>;
}

export default function WalletPage() {
  const { wallet, transactions, loading, recharging, rechargeWallet } = useWallet();
  const [open, setOpen]     = useState(false);
  const [amount, setAmount] = useState('');
  const [amtErr, setAmtErr] = useState('');

  const handleRecharge = async () => {
    const val = parseFloat(amount);
    if (!val || val < 1) { setAmtErr('Enter a valid amount (min ₹1)'); return; }
    setAmtErr('');
    await rechargeWallet(val);
    setOpen(false);
    setAmount('');
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-slate-100">Wallet</h1>
        <p className="text-slate-400 mt-1">Manage your balance and view transaction history</p>
      </div>

      {/* Balance hero */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-900 to-violet-950 border border-brand-700/50 p-8">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl" />

          <div className="relative z-10 flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-sm text-brand-300 font-medium uppercase tracking-widest mb-2">Current Balance</p>
              {loading ? (
                <div className="h-12 w-44 shimmer rounded-xl" />
              ) : (
                <p className="text-5xl font-bold font-display text-white">
                  ₹<span className="tabular-nums">{wallet?.walletBalance?.toFixed(2) ?? '0.00'}</span>
                </p>
              )}
              <p className="text-brand-400 text-sm mt-2 font-mono">
                RFID: {wallet?.rfidUID ?? '—'}
              </p>
            </div>
            <Button variant="amber" size="lg" onClick={() => setOpen(true)}>
              ⚡ Recharge Wallet
            </Button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Total Recharged"
          value={loading ? '...' : `₹${transactions.filter(t=>t.type==='recharge').reduce((s,t)=>s+t.amount,0).toFixed(2)}`}
          icon="📥"
          color="green"
          loading={loading}
        />
        <StatCard
          label="Total Spent on Fares"
          value={loading ? '...' : `₹${transactions.filter(t=>t.type==='deduction').reduce((s,t)=>s+t.amount,0).toFixed(2)}`}
          icon="📤"
          color="amber"
          loading={loading}
        />
      </div>

      {/* Transaction history */}
      <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <Card>
          <CardHeader title="Transaction History" icon="📋" subtitle="Recent 10 transactions" />
          <CardBody>
            <Table
              headers={['Type', 'Amount', 'Before', 'After', 'Description', 'Date']}
              loading={loading}
              rows={transactions.map(tx => [
                txBadge(tx.type),
                <span key="amt" className={`font-bold font-mono ${tx.type === 'recharge' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {tx.type === 'recharge' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </span>,
                <span key="before" className="font-mono text-slate-400">₹{tx.balanceBefore.toFixed(2)}</span>,
                <span key="after"  className="font-mono text-slate-200">₹{tx.balanceAfter.toFixed(2)}</span>,
                <span key="desc"   className="text-slate-400 text-xs max-w-[160px] truncate block">{tx.description}</span>,
                new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              ])}
              emptyState={<EmptyState icon="💳" title="No transactions yet" subtitle="Recharge your wallet to get started." />}
            />
          </CardBody>
        </Card>
      </div>

      {/* Recharge Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setAmount(''); setAmtErr(''); }} title="⚡ Recharge Wallet">
        <div className="space-y-5">
          <p className="text-sm text-slate-400">Choose a preset amount or enter a custom value.</p>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${amount === String(a)
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-surface-hover border-surface-border text-slate-300 hover:border-brand-600 hover:text-brand-300'}`}
              >
                ₹{a}
              </button>
            ))}
          </div>

          <Input
            label="Custom amount (₹)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            error={amtErr}
            icon="₹"
          />

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-300 text-center">
              New balance after recharge:{' '}
              <span className="font-bold font-mono">
                ₹{((wallet?.walletBalance || 0) + parseFloat(amount)).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="success" fullWidth loading={recharging} onClick={handleRecharge}>
              Confirm Recharge
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
