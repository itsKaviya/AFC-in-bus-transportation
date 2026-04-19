'use client';
import { useState, useEffect, useCallback } from 'react';
import { getWallet, recharge as rechargeApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export function useWallet() {
  const [wallet, setWallet]               = useState(null);
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [recharging, setRecharging]       = useState(false);
  const { addToast } = useToast();

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getWallet();
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load wallet', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const rechargeWallet = useCallback(async (amount) => {
    try {
      setRecharging(true);
      const res = await rechargeApi(amount);
      setWallet(prev => ({ ...prev, walletBalance: res.data.walletBalance }));
      setTransactions(prev => [res.data.transaction, ...prev]);
      addToast(`₹${amount} added to wallet!`, 'success');
      return res;
    } catch (err) {
      addToast(err.response?.data?.message || 'Recharge failed', 'error');
      throw err;
    } finally {
      setRecharging(false);
    }
  }, [addToast]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  return { wallet, transactions, loading, recharging, fetchWallet, rechargeWallet };
}
