'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TapPanel from '@/components/TapPanel';
import { StatCard, Card, CardHeader, CardBody, Badge, EmptyState, Button } from '@/components/ui';
import { useWallet } from '@/hooks/useWallet';
import { useTrips } from '@/hooks/useTrips';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function statusBadge(status) {
  if (status === 'completed')  return <Badge variant="success">Completed</Badge>;
  if (status === 'in-progress') return <Badge variant="info">In Progress</Badge>;
  return <Badge variant="danger">Failed</Badge>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();
  const { trips, loading: tripsLoading, tapping, activeTrip, handleTapIn, handleTapOut } = useTrips();

  const completedTrips = trips.filter(t => t.status === 'completed');
  const totalFareSpent = completedTrips.reduce((s, t) => s + (t.fare?.totalFare || 0), 0);
  const totalKm        = completedTrips.reduce((s, t) => s + (t.distanceKm || 0), 0);

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="mt-1 text-slate-400">Here's your transit overview for today.</p>
      </div>

      {/* Tap Panel */}
      <div
        className="sticky top-3 z-30 mb-8 animate-fade-in rounded-3xl bg-surface/80 py-2 backdrop-blur-sm"
        style={{ animationDelay: '0.05s' }}
      >
        <TapPanel
          activeTrip={activeTrip}
          tapping={tapping}
          onTapIn={handleTapIn}
          onTapOut={handleTapOut}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Wallet Balance"
          value={walletLoading ? '...' : `₹${wallet?.walletBalance?.toFixed(2) ?? '0.00'}`}
          icon="💳"
          color="blue"
          loading={walletLoading}
        />
        <StatCard
          label="Total Trips"
          value={tripsLoading ? '...' : completedTrips.length}
          icon="🚌"
          color="purple"
          loading={tripsLoading}
        />
        <StatCard
          label="Total Fare Paid"
          value={tripsLoading ? '...' : `₹${totalFareSpent.toFixed(2)}`}
          icon="💸"
          color="amber"
          loading={tripsLoading}
        />
        <StatCard
          label="Total Distance"
          value={tripsLoading ? '...' : `${totalKm.toFixed(1)} km`}
          icon="📍"
          color="green"
          loading={tripsLoading}
        />
      </div>

      {/* Recent Trips */}
      <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <Card>
          <CardHeader
            title="Recent Trips"
            icon="⇌"
            subtitle="Your last 5 journeys"
            action={
              <Link href="/trips">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">View all →</Button>
              </Link>
            }
          />
          <CardBody>
            {tripsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 shimmer rounded-xl" />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <EmptyState icon="🚌" title="No trips yet" subtitle="Tap in at any bus stop to start your first journey." />
            ) : (
              <div className="space-y-2">
                {trips.slice(0, 5).map((trip, i) => (
                  <div
                    key={trip._id}
                    className="flex flex-col gap-4 p-4 transition-colors rounded-xl bg-surface-hover/50 hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 text-lg rounded-xl bg-surface-border">
                        {trip.status === 'completed' ? '✅' : trip.status === 'in-progress' ? '🔄' : '❌'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {trip.distanceKm ? `${trip.distanceKm} km` : 'In progress'}
                          {trip.duration ? ` · ${trip.duration} min` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      {statusBadge(trip.status)}
                      {trip.fare?.totalFare != null && (
                        <span className="font-mono text-sm font-bold text-amber-400">
                          ₹{trip.fare.totalFare.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
