'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, Calendar,
} from 'lucide-react';
import { login } from '@/lib/auth';
import { loginHero } from '@/data/login-hero';
import { MyPodLogo } from './MyPodLogo';

type Pending = '' | 'signin';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.98 10.98 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function MicrosoftIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 21 21" width={size} height={size} aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// Floating particles on the success screen
const PARTICLES = [
  { x: '20%', y: '25%', r: 3, delay: 0.5  },
  { x: '75%', y: '18%', r: 2, delay: 0.7  },
  { x: '12%', y: '65%', r: 2, delay: 0.6  },
  { x: '85%', y: '72%', r: 3, delay: 0.8  },
  { x: '50%', y: '12%', r: 2, delay: 0.9  },
  { x: '40%', y: '82%', r: 2, delay: 0.55 },
  { x: '90%', y: '40%', r: 3, delay: 0.65 },
  { x: '8%',  y: '38%', r: 2, delay: 0.75 },
];

export function LoginFormCard() {
  const router = useRouter();
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [remember, setRemember]       = useState(true);
  const [error, setError]             = useState('');
  const [fieldErr, setFieldErr]       = useState({ email: '', password: '' });
  const [pending, setPending]         = useState<Pending>('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const loading = pending !== '';
  const card = loginHero.loginCard;

  function validate() {
    const e = { email: '', password: '' };
    const id = email.trim();
    if (!id) e.email = 'Email or username is required';
    else if (!isValidEmail(id) && id.length < 3) e.email = 'Enter a valid email or username';
    if (!password) e.password = 'Password is required';
    setFieldErr(e);
    return !e.email && !e.password;
  }

  function handleLogin(ev: React.FormEvent) {
    ev.preventDefault();
    setError('');
    if (loading || !validate()) return;
    setPending('signin');
    setTimeout(() => {
      const res = login(email, password);
      if (res.ok) {
        setLoginSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1400);
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.');
        setPending('');
      }
    }, 300);
  }

  function handleSocialMockup() {
    // Visual mockup only — not functional
  }

  const fieldBase =
    'w-full pl-11 py-3 rounded-2xl border text-[14px] text-gray-700 transition-all focus:outline-none focus:ring-4 bg-white';

  return (
    <>
      {/* ── Login success full-screen transition ── */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            key="success-overlay"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, #0a0120 0%, #1e0550 40%, #4c1d95 75%, #6d28d9 100%)',
            }}
          >
            {/* Background stars */}
            {PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ left: p.x, top: p.y, width: p.r * 2, height: p.r * 2, background: 'white' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.8, 0.4], scale: [0, 1.4, 1] }}
                transition={{ delay: p.delay, duration: 0.6, ease: 'backOut' }}
              />
            ))}

            {/* Soft glow ring behind logo */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 220, height: 220,
                background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22, duration: 0.5, ease: 'easeOut' }}
            />

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <MyPodLogo size={82} glow />
            </motion.div>

            {/* Checkmark badge */}
            <motion.div
              className="mt-5 flex items-center justify-center rounded-full"
              style={{
                width: 48, height: 48,
                background: 'rgba(110,231,183,0.15)',
                border: '1.5px solid rgba(110,231,183,0.55)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.38, duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <CheckCircle2 size={22} style={{ color: '#6ee7b7' }} />
            </motion.div>

            {/* Welcome text */}
            <motion.div
              className="text-center mt-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.38, ease: 'easeOut' }}
            >
              <div className="text-white font-extrabold text-[1.4rem] tracking-tight">
                Welcome back
              </div>
              <div className="text-purple-300/80 text-[13.5px] mt-1.5 font-medium">
                Entering your workspace…
              </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-8 rounded-full overflow-hidden"
              style={{ width: 140, height: 3, background: 'rgba(255,255,255,0.12)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.25 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a78bfa, #6ee7b7)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.65, duration: 0.65, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form card ── */}
      <div
        className="bg-white rounded-[28px] px-7 pt-8 pb-7"
        style={{ boxShadow: '0 24px 60px rgba(109,40,201,0.13), 0 2px 6px rgba(109,40,201,0.06)' }}
      >
        <div className="flex justify-center mb-4">
          <MyPodLogo size={60} glow />
        </div>

        <h1 className="text-[1.6rem] font-extrabold text-purple-950 text-center tracking-tight leading-tight mb-1">
          {card.title}
        </h1>
        <p className="text-gray-400 text-[13px] text-center mb-5 leading-snug">{card.subtitle}</p>

        <form onSubmit={handleLogin} className="space-y-3" noValidate>
          <div>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b0b8cc' }} />
              <input
                type="text"
                aria-label="Email or username"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })); }}
                placeholder="Email or username"
                autoComplete="username"
                className={[
                  fieldBase, 'pr-4',
                  fieldErr.email
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                    : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100/70',
                ].join(' ')}
              />
            </div>
            <FieldError msg={fieldErr.email} />
          </div>

          <div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b0b8cc' }} />
              <input
                type={showPw ? 'text' : 'password'}
                aria-label="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })); }}
                placeholder="Password"
                autoComplete="current-password"
                className={[
                  fieldBase, 'pr-12',
                  fieldErr.password
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                    : 'border-gray-200 focus:border-purple-400 focus:ring-purple-100/70',
                ].join(' ')}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:opacity-70"
                style={{ color: '#b0b8cc' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <FieldError msg={fieldErr.password} />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-[12.5px] text-gray-600">Remember me</span>
            </label>
            <span className="text-[12.5px] text-purple-600 font-medium cursor-pointer hover:text-purple-800 transition">
              Forgot password?
            </span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="global-err"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-2.5 rounded-2xl"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.012 }}
            whileTap={loading ? {} : { scale: 0.988 }}
            className="w-full py-3 rounded-2xl text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#6d28c9,#9d6cf5)', boxShadow: '0 10px 26px rgba(109,40,201,0.32)' }}
          >
            {pending === 'signin'
              ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
              : <><span>Sign In</span><ArrowRight size={14} /></>}
          </motion.button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1" style={{ background: '#eeecf6' }} />
          <span className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wider">or continue with</span>
          <div className="h-px flex-1" style={{ background: '#eeecf6' }} />
        </div>

        {/* Social — visual mockup only */}
        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            type="button"
            onClick={handleSocialMockup}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-[13.5px] font-semibold text-gray-600"
          >
            <GoogleIcon />
            Google
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSocialMockup}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-[13.5px] font-semibold text-gray-600"
          >
            <MicrosoftIcon />
            Microsoft
          </motion.button>
        </div>

        <div className="mt-3.5 flex items-start gap-3 rounded-2xl px-3.5 py-3"
          style={{ background: 'linear-gradient(135deg,#f3eeff,#ede8ff)', border: '1px solid #e0d8f8' }}>
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
            <Calendar size={14} color="white" strokeWidth={2} />
          </div>
          <div>
            <div className="text-purple-900 font-semibold text-[12px] leading-snug">{loginHero.weekStart.title}</div>
            <div className="text-purple-500/80 text-[11px] mt-0.5 leading-snug">{loginHero.weekStart.sub}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          key="err"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          style={{ overflow: 'hidden' }}
          className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-xs"
        >
          <AlertCircle size={11} className="flex-shrink-0" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default LoginFormCard;
