"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import GlobalToastTracker from '@/components/GlobalToastTracker';
import { useAppState } from '@/lib/app-state';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isLoggedIn && pathname !== '/login') {
        router.push('/login');
      } else if (isLoggedIn && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isLoggedIn, pathname, router, mounted]);

  if (!mounted) {
    return <div style={{ background: 'var(--bg-body)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 600 }}>Loading...</div>; // Prevents hydration mismatch
  }

  // Se for a página de login, não exibe sidebar nem topbar
  if (!isLoggedIn || pathname === '/login') {
    return (
      <div className="layout-container" style={{ display: 'block' }}>
        {children}
        <GlobalToastTracker />
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-container animate-fade-in">
          {children}
        </main>
      </div>
      <GlobalToastTracker />
    </div>
  );
}
