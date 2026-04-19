'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl bus-pulse">🚌</div>
        <div className="w-8 h-8 border-2 rounded-full border-brand-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
