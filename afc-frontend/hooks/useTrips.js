'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTrips, tapIn as tapInApi, tapOut as tapOutApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export function useTrips() {
  const [trips, setTrips]               = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [tapping, setTapping]           = useState(false);
  const [activeTrip, setActiveTrip]     = useState(null);
  const { addToast } = useToast();

  const fetchTrips = useCallback(async (page = 1, status = '') => {
    try {
      setLoading(true);
      const res = await getTrips(page, 10, status);
      setTrips(res.data.trips);
      setPagination(res.data.pagination);

      // detect active trip
      const active = res.data.trips.find(t => t.status === 'in-progress');
      if (active) setActiveTrip(active);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleTapIn = useCallback(async (rfidUID, lat, lng) => {
    try {
      setTapping(true);
      const res = await tapInApi(rfidUID, lat, lng);
      setActiveTrip(res.data.trip);
      addToast('Tapped in! Trip started 🚌', 'success');
      fetchTrips();
      return res;
    } catch (err) {
      addToast(err.response?.data?.message || 'Tap-in failed', 'error');
      throw err;
    } finally {
      setTapping(false);
    }
  }, [addToast, fetchTrips]);

  const handleTapOut = useCallback(async (rfidUID, lat, lng) => {
    try {
      setTapping(true);
      const res = await tapOutApi(rfidUID, lat, lng);
      setActiveTrip(null);
      addToast(`Trip completed! Fare: ₹${res.data.fareDetails.totalFare}`, 'success');
      fetchTrips();
      return res;
    } catch (err) {
      addToast(err.response?.data?.message || 'Tap-out failed', 'error');
      throw err;
    } finally {
      setTapping(false);
    }
  }, [addToast, fetchTrips]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  return { trips, pagination, loading, tapping, activeTrip, fetchTrips, handleTapIn, handleTapOut };
}
