'use client';
import { motion } from 'framer-motion';
import { Target, BarChart2, Shield, Zap, Sparkles } from 'lucide-react';
import { loginHero, type HeroStatIcon } from '@/data/login-hero';
import { MyPodLogo } from './MyPodLogo';
import { LifeWeeksCard } from './LifeWeeksCard';
import { MotivationalQuote } from './MotivationalQuote';

const STAT_ICONS: Record<HeroStatIcon, React.ElementType> = {
  focus: Target,
  track: BarChart2,
  build: Shield,
  live: Zap,
};

const STAT_STYLES: Record<HeroStatIcon, { grad: string; glow: string; chipBorder: string }> = {
  focus: { grad: 'linear-gradient(135deg,#f97316,#fbbf24)', glow: 'rgba(251,191,36,0.55)',  chipBorder: 'rgba(251,191,36,0.25)' },
  track: { grad: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', glow: 'rgba(6,182,212,0.55)',   chipBorder: 'rgba(6,182,212,0.25)'  },
  build: { grad: 'linear-gradient(135deg,#8b5cf6,#c084fc)', glow: 'rgba(139,92,246,0.55)',  chipBorder: 'rgba(167,139,250,0.30)' },
  live:  { grad: 'linear-gradient(135deg,#ec4899,#f472b6)', glow: 'rgba(236,72,153,0.55)',  chipBorder: 'rgba(244,114,182,0.25)' },
};

// Stars — circular glowing dots, sizes vary for depth
const STARS = [
  { top: '7%',  left: '7%',  r: 2.0, delay: 0    },
  { top: '19%', left: '78%', r: 1.5, delay: 0.5  },
  { top: '38%', left: '11%', r: 1.8, delay: 0.9  },
  { top: '57%', left: '72%', r: 1.2, delay: 1.3  },
  { top: '74%', left: '20%', r: 2.2, delay: 0.7  },
  { top: '14%', left: '50%', r: 1.5, delay: 1.1  },
  { top: '85%', left: '58%', r: 1.3, delay: 0.3  },
  { top: '29%', left: '35%', r: 1.0, delay: 1.6  },
  { top: '44%', left: '88%', r: 1.8, delay: 0.2  },
  { top: '66%', left: '44%', r: 1.2, delay: 1.8  },
  { top: '10%', left: '63%', r: 1.0, delay: 0.8  },
  { top: '52%', left: '5%',  r: 1.4, delay: 1.4  },
];

// Shooting stars
const SHOOTING_STARS = [
  { top: '4%',  left: '8%',  delay: 0,   repeatDelay: 7,  duration: 1.1  },
  { top: '12%', left: '55%', delay: 2.5, repeatDelay: 9,  duration: 0.95 },
  { top: '6%',  left: '30%', delay: 5,   repeatDelay: 11, duration: 1.2  },
  { top: '18%', left: '72%', delay: 1.2, repeatDelay: 8,  duration: 1.0  },
  { top: '2%',  left: '42%', delay: 7,   repeatDelay: 13, duration: 0.85 },
];

// Clouds — blurred drifting mist blobs
const CLOUDS = [
  { width: 280, height: 52, top: '54%', duration: 52, delay: 0   },
  { width: 210, height: 40, top: '61%', duration: 67, delay: -22 },
  { width: 240, height: 46, top: '49%', duration: 44, delay: -10 },
  { width: 190, height: 36, top: '67%', duration: 74, delay: -38 },
];

export function LoginHero() {
  const h = loginHero;

  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="hidden lg:flex w-[67%] relative overflow-hidden flex-col justify-between p-12 xl:p-14"
      style={{
        backgroundColor: '#1a0545',
        backgroundImage: 'url(/login-hero.png)',
        backgroundSize: '165%',
        backgroundPosition: '44% 50%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay 1 — top darkener for brand text readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(5,1,20,0.90) 0%, rgba(5,1,20,0.52) 18%, rgba(5,1,20,0.08) 36%, transparent 50%)',
      }} />
      {/* Overlay 2 — bottom darkener for chips + quote */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(5,1,20,0.85) 0%, rgba(5,1,20,0.35) 20%, transparent 40%)',
      }} />
      {/* Overlay 3 — left/right edge vignette; center fully open */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 78% at 44% 50%, transparent 38%, rgba(5,1,20,0.45) 75%, rgba(5,1,20,0.68) 100%)',
      }} />

      {/* Animated clouds */}
      {CLOUDS.map((c, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute pointer-events-none rounded-full z-[2]"
          style={{
            top: c.top,
            left: 0,
            width: c.width,
            height: c.height,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.16) 0%, rgba(200,190,255,0.07) 55%, transparent 100%)',
            filter: 'blur(18px)',
          }}
          initial={{ x: 0 }}
          animate={{ x: [0, 160, 0], opacity: [0.55, 0.80, 0.55] }}
          transition={{
            x:       { duration: c.duration, repeat: Infinity, ease: 'linear',     delay: c.delay },
            opacity: { duration: c.duration / 2, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
          }}
        />
      ))}

      {/* Shooting stars */}
      {SHOOTING_STARS.map((ss, i) => (
        <motion.div
          key={`ss-${i}`}
          className="absolute pointer-events-none z-[3]"
          style={{
            top: ss.top, left: ss.left,
            width: 90, height: 1.5,
            background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)',
            rotate: '40deg',
            transformOrigin: 'left center',
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: [0, 0, 340], y: [0, 0, 300], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: ss.duration, repeat: Infinity, delay: ss.delay,
            repeatDelay: ss.repeatDelay, ease: 'easeIn', times: [0, 0.04, 0.75, 1],
          }}
        />
      ))}

      {/* Stars — round glowing dots, not squares */}
      {STARS.map((st, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute pointer-events-none rounded-full z-[3]"
          style={{
            top: st.top,
            left: st.left,
            width:  st.r * 2,
            height: st.r * 2,
            background: 'white',
            // Static glow — no animation on box-shadow (not GPU-accelerated)
            boxShadow: `0 0 ${st.r * 3}px ${st.r}px rgba(255,255,255,0.55), 0 0 ${st.r * 6}px ${st.r * 2}px rgba(180,160,255,0.25)`,
          }}
          animate={{ opacity: [0.15, 0.95, 0.15], scale: [0.85, 1.3, 0.85] }}
          transition={{ duration: 2.4 + st.delay * 0.5, repeat: Infinity, delay: st.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Top: brand + headline */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <MyPodLogo size={46} />
          <div>
            <div className="text-white font-extrabold text-[1.4rem] tracking-tight leading-none">{h.appName}</div>
            <div className="text-purple-200/80 text-xs font-medium mt-0.5">{h.tagline}</div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          className="font-extrabold text-white leading-[1.08] tracking-tight mb-4"
          style={{ fontSize: 'clamp(2.4rem,3.4vw,3.2rem)' }}
        >
          {h.heroTitle.map((line) =>
            line === h.heroAccentLine ? (
              <span
                key={line}
                className="block"
                style={{
                  background: 'linear-gradient(100deg,#6ee7b7,#67e8f9)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {line}
              </span>
            ) : (
              <span key={line} className="block">{line}</span>
            )
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-purple-200/85 text-[14.5px] mb-4 leading-relaxed max-w-[400px]"
        >
          {h.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.45 }}
          className="flex items-center gap-2 text-purple-200/70 text-[13px]"
        >
          <Sparkles size={13} className="text-purple-200" />
          {h.motivationalLine}
        </motion.div>
      </div>

      {/* Center: 4,000 weeks card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="relative z-10 my-8"
      >
        <LifeWeeksCard title={h.lifeWeeksTitle} weeks={h.lifeWeeks} sparkline={h.lifeSparkline} />
      </motion.div>

      {/* Bottom: feature chips + quote */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.45 }}
          className="grid grid-cols-4 gap-2.5 mb-7"
        >
          {h.heroStats.map(({ id, label, sub, icon }) => {
            const Icon = STAT_ICONS[icon];
            const st = STAT_STYLES[icon];
            return (
              <div
                key={id}
                className="flex flex-col items-center gap-2 rounded-[16px] py-3.5 px-2"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: `1px solid ${st.chipBorder}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                  style={{ background: st.grad, boxShadow: `0 4px 16px ${st.glow}` }}
                >
                  <Icon size={17} color="white" strokeWidth={2.2} />
                </div>
                <div className="text-white font-bold text-[11.5px] leading-none tracking-wide">{label}</div>
                <div className="text-white/50 text-[9.5px] leading-none">{sub}</div>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72, duration: 0.45 }}
        >
          <MotivationalQuote line1={h.weeklyQuote.line1} line2={h.weeklyQuote.line2} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default LoginHero;
