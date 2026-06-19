'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { initColorTheme } from '@/lib/colorTheme';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-[#f5f3ff] dark:bg-[#0c0d1a]">
      <Sidebar />
      <main
        className={`min-w-0 overflow-auto transition-all duration-300 bg-[#f5f3ff] dark:bg-[#0c0d1a] ${collapsed ? 'lg:ml-20' : 'lg:ml-[200px]'}`}
      >
        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 pb-24 sm:px-5 lg:px-6 lg:py-6 lg:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      initColorTheme();
      setReady(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (ready === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f3ff' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>
            <span className="text-white font-bold">A</span>
          </div>
          <div className="text-purple-400 text-sm">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
