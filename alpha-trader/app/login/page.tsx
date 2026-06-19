'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { isAuthenticated } from '@/lib/auth';
import { loginHero } from '@/data/login-hero';
import { LoginHero } from '@/components/login/LoginHero';
import { LoginFormCard } from '@/components/login/LoginFormCard';
import { MyPodLogo } from '@/components/login/MyPodLogo';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#f0ecff' }}>
      {/* Left motivational hero (desktop) */}
      <LoginHero />

      {/* Right login column */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6" style={{ background: '#f0ecff' }}>
        {/* Mobile brand (hero is hidden below lg) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-7">
          <MyPodLogo size={36} />
          <div>
            <div className="text-purple-900 font-extrabold text-lg tracking-tight leading-none">{loginHero.appName}</div>
            <div className="text-purple-400 text-[11px] font-medium mt-0.5">{loginHero.tagline}</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: 'easeOut' }}
          className="w-full max-w-[400px]"
        >
          <LoginFormCard />

          {/* Footer */}
          <div className="mt-5 text-center space-y-1">
            <p className="text-[11.5px] text-gray-400">{loginHero.footer.brand}</p>
            <p className="text-[11px]">
              {loginHero.footer.links.map((label, i) => (
                <span key={label}>
                  {i > 0 && <span className="text-gray-300 mx-1.5">·</span>}
                  <span className="text-gray-300 cursor-pointer hover:text-gray-500 transition">{label}</span>
                </span>
              ))}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
