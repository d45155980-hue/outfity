'use client';

import { useEffect, useState, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from '@/store/store';
import { loadUser } from '@/store/slices/authSlice';
import { fetchNotifications, addNotification } from '@/store/slices/notificationSlice';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

function useSSE(user: any) {
  const dispatch = useDispatch<AppDispatch>();
  const setMaintenanceRef = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('outfity_token') : null;
    const url = token ? `${API_BASE_URL}/sse/orders?token=${encodeURIComponent(token)}` : `${API_BASE_URL}/sse/orders`;
    const es = new EventSource(url);

    es.addEventListener('site_updated', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.maintenance === 'boolean' && setMaintenanceRef.current) {
          setMaintenanceRef.current(data.maintenance);
        }
      } catch {}
    });

    es.addEventListener('new_notification', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.forAdmin && user?.role !== 'admin') return;
        if (data.user && data.user !== user?._id && data.user !== user?.id) return;
        dispatch(addNotification(data));
      } catch {}
    });

    es.onerror = () => {};
    return () => es.close();
  }, [dispatch, user]);

  return setMaintenanceRef;
}

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<boolean | null>(null);
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);
  const setMaintenanceRef = useSSE(user);

  useEffect(() => {
    setMaintenanceRef.current = setMaintenance;
  }, [setMaintenanceRef]);

  useEffect(() => {
    api.get('/site/status')
      .then(({ data }) => setMaintenance(data.maintenance))
      .catch(() => setMaintenance(false));
  }, []);

  if (maintenance === null || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenance && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white px-6">
        <div className="max-w-md text-center space-y-6">
          <svg className="w-16 h-16 mx-auto text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-1.5-1.5m0 0l-1.5-1.5m1.5 1.5l1.5-1.5m-1.5 1.5l-1.5 1.5M15.5 12h.01M8.5 12h.01M12 8.5h.01M12 15.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight">Work in Progress</h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            We are currently doing some maintenance. We will be back shortly.
          </p>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-stone-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => { dispatch(loadUser()); }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <MaintenanceGuard>
          {children}
        </MaintenanceGuard>
      </AuthInitializer>
    </Provider>
  );
}
