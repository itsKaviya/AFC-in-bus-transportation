'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardBody, Badge, StatCard, Button, EmptyState, Table } from '@/components/ui';
import { useTrips } from '@/hooks/useTrips';

const STATUS_FILTERS = ['', 'completed', 'in-progress', 'failed'];

function statusBadge(status) {
  if (status === 'completed')   return <Badge variant="success">✓ Completed</Badge>;
  if (status === 'in-progress') return <Badge variant="info">⟳ In Progress</Badge>;
  return <Badge variant="danger">✕ Failed</Badge>;
}

export default function TripsPage() {
  const [filter, setFilter]     = useState('');
  const [page, setPage]         = useState(1);
  const { trips, pagination, loading, fetchTrips } = useTrips();

  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
    fetchTrips(1, f);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchTrips(p, filter);
  };

  const completed = trips.filter(t => t.status === 'completed');
  const totalFare = completed.reduce((s, t) => s + (t.fare?.totalFare || 0), 0);
  const totalKm   = completed.reduce((s, t) => s + (t.distanceKm || 0), 0);
  const avgFare   = completed.length ? totalFare / completed.length : 0;

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-slate-100">Trip History</h1>
        <p className="text-slate-400 mt-1">All your journeys in one place</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <StatCard label="Completed Trips" value={completed.length}     icon="✅" color="green"  loading={loading} />
        <StatCard label="Total Distance"  value={`${totalKm.toFixed(1)} km`}  icon="📍" color="blue"   loading={loading} />
        <StatCard label="Total Fare Paid" value={`₹${totalFare.toFixed(2)}`}  icon="💸" color="amber"  loading={loading} />
        <StatCard label="Avg. Fare"       value={`₹${avgFare.toFixed(2)}`}    icon="📊" color="purple" loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <span className="text-sm text-slate-400 mr-1">Filter:</span>
        {STATUS_FILTERS.map(f => (
          <button
            key={f || 'all'}
            onClick={() => handleFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${filter === f
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-surface-card border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
          >
            {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <Card>
          <CardHeader title="Journeys" icon="⇌" subtitle={`${pagination?.total ?? 0} total trips`} />
          <CardBody>
            <Table
              headers={['Status', 'Date', 'Distance', 'Duration', 'Fare Breakdown', 'Total Fare']}
              loading={loading}
              rows={trips.map(trip => [
                statusBadge(trip.status),
                <div key="date">
                  <p className="text-slate-200 text-sm">
                    {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(trip.tapIn?.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {trip.tapOut && ` → ${new Date(trip.tapOut.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>,
                trip.distanceKm != null
                  ? <span key="dist" className="font-mono text-sky-400">{trip.distanceKm} km</span>
                  : <span key="dist" className="text-slate-500">—</span>,
                trip.duration != null
                  ? <span key="dur"  className="font-mono text-slate-300">{trip.duration} min</span>
                  : <span key="dur"  className="text-slate-500">—</span>,
                trip.fare ? (
                  <div key="fare-detail" className="text-xs font-mono text-slate-400">
                    <p>Base: ₹{trip.fare.baseFare}</p>
                    <p>Dist: ₹{trip.fare.distanceFare?.toFixed(2)}</p>
                  </div>
                ) : <span key="fare-detail" className="text-slate-500">—</span>,
                trip.fare?.totalFare != null
                  ? <span key="total" className="font-bold font-mono text-amber-400 text-base">₹{trip.fare.totalFare.toFixed(2)}</span>
                  : <span key="total" className="text-slate-500">—</span>,
              ])}
              emptyState={
                <EmptyState icon="🚌" title="No trips found" subtitle="Start your first trip by tapping in at a bus stop." />
              }
            />

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} trips
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary" size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePage(page - 1)}
                  >← Prev</Button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                        ${p === page ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-surface-hover'}`}
                    >{p}</button>
                  ))}
                  <Button
                    variant="secondary" size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => handlePage(page + 1)}
                  >Next →</Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
