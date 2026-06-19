import type { Variants } from 'framer-motion';

export const cardEntrance: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.05 } },
};

export const rowEntrance: Variants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0,
    transition: { duration: 0.32, ease: 'easeOut' } },
};

export const rowStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.35, ease: 'easeOut' } },
};

export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 8px 24px rgba(124,92,191,0.13)' },
  transition:  { type: 'spring' as const, stiffness: 340, damping: 24 },
};

export const tapScale = { whileTap: { scale: 0.97 } };

export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8,
    transition: { duration: 0.22, ease: 'easeIn' } },
};
