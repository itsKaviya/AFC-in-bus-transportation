'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Modal, Input } from '@/components/ui';

export default function TapPanel({ activeTrip, tapping, onTapIn, onTapOut }) {
  const { user } = useAuth();
  const [open, setOpen]   = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coordErrors, setCoordErrors] = useState({});

  const getGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        setGpsLoading(false);
      },
      () => {
        // fallback: Delhi coords for demo
        setCoords({ lat: '28.6139', lng: '77.2090' });
        setGpsLoading(false);
      }
    );
  };

  const validate = () => {
    const e = {};
    if (!coords.lat) e.lat = 'Latitude required';
    if (!coords.lng) e.lng = 'Longitude required';
    return e;
  };

  const handleAction = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setCoordErrors(errs); return; }
    setCoordErrors({});
    try {
      if (activeTrip) {
        await onTapOut(user.rfidUID, parseFloat(coords.lat), parseFloat(coords.lng));
      } else {
        await onTapIn(user.rfidUID, parseFloat(coords.lat), parseFloat(coords.lng));
      }
      setOpen(false);
      setCoords({ lat: '', lng: '' });
    } catch (_) {}
  };

  const isOut = !!activeTrip;

  return (
    <>
      <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:justify-between
        ${isOut
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-brand-500/10 border-brand-500/30'}`}>
        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${isOut ? 'bg-emerald-500/20' : 'bg-brand-500/20'}`}>
            {isOut ? '🟢' : '🔵'}
          </div>
          <div className="min-w-0">
            <p className={`font-bold font-display text-lg ${isOut ? 'text-emerald-300' : 'text-brand-300'}`}>
              {isOut ? 'Trip In Progress' : 'Ready to Ride'}
            </p>
            <p className="text-sm text-slate-400">
              {isOut
                ? `Started at ${new Date(activeTrip.tapIn?.timestamp).toLocaleTimeString()}`
                : 'Tap your RFID card to start a trip'}
            </p>
          </div>
        </div>

        <Button
          variant={isOut ? 'success' : 'primary'}
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => { setOpen(true); setCoords({ lat: '', lng: '' }); }}
        >
          {isOut ? 'Tap Out ⇢' : '⇠ Tap In'}
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isOut ? '🟢 Tap Out — End Trip' : '🔵 Tap In — Start Trip'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {isOut
              ? 'Confirm your exit location to calculate fare.'
              : 'Confirm your boarding location to start your trip.'}
          </p>

          <Button variant="secondary" size="sm" onClick={getGPS} loading={gpsLoading} fullWidth>
            📍 Use Current GPS Location
          </Button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Latitude" type="number" step="0.000001"
              placeholder="28.6139"
              value={coords.lat} onChange={e => setCoords(c => ({ ...c, lat: e.target.value }))}
              error={coordErrors.lat} />
            <Input label="Longitude" type="number" step="0.000001"
              placeholder="77.2090"
              value={coords.lng} onChange={e => setCoords(c => ({ ...c, lng: e.target.value }))}
              error={coordErrors.lng} />
          </div>

          {coords.lat && coords.lng && (
            <div className="bg-surface-hover border border-surface-border rounded-xl p-3">
              <p className="text-xs text-slate-400 font-mono">
                📍 ({parseFloat(coords.lat).toFixed(4)}, {parseFloat(coords.lng).toFixed(4)})
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant={isOut ? 'success' : 'primary'} fullWidth loading={tapping} onClick={handleAction}>
              {isOut ? 'Confirm Tap Out' : 'Confirm Tap In'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
