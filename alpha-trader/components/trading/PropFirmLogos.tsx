import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

/* ── FTMO ─────────────────────────────────────────────────────────────────
   Black rounded square + white "FTMO" wordmark                            */
export function FtmoLogo({ size = 36, ...props }: Props) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="none" {...props}>
      <rect width="36" height="36" rx="8" fill="#0a0a0a" />
      <text x="18" y="23" textAnchor="middle" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="9" fill="white" letterSpacing="0.5">FTMO</text>
    </svg>
  );
}

/* ── The 5%ers ────────────────────────────────────────────────────────────
   Orange gradient circle + white "5" + thin "%" superscript               */
export function FivePercentersLogo({ size = 36, ...props }: Props) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="none" {...props}>
      <defs>
        <linearGradient id="five-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#ff4500" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#five-grad)" />
      <text x="13" y="25" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="18" fill="white">5</text>
      <text x="24" y="18" fontFamily="Arial,sans-serif"
        fontWeight="700" fontSize="8" fill="white">%</text>
    </svg>
  );
}

/* ── TOPSTEP ──────────────────────────────────────────────────────────────
   Green square + white "TS" stacked letters                               */
export function TopstepLogo({ size = 36, ...props }: Props) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="none" {...props}>
      <defs>
        <linearGradient id="ts-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00c957" />
          <stop offset="100%" stopColor="#00a651" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#ts-grad)" />
      <text x="18" y="16" textAnchor="middle" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="10" fill="white">TOP</text>
      <text x="18" y="28" textAnchor="middle" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="10" fill="white">STEP</text>
    </svg>
  );
}

/* ── Apex Trader Funding ──────────────────────────────────────────────────
   Dark navy square + gold "A" chevron mark + "APEX" text                 */
export function ApexTraderLogo({ size = 36, ...props }: Props) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="none" {...props}>
      <defs>
        <linearGradient id="apex-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1f3c" />
          <stop offset="100%" stopColor="#0d1128" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#apex-grad)" />
      {/* Gold chevron "A" mark */}
      <polyline points="18,7 27,21 24,21 18,11 12,21 9,21" fill="#f5c842" />
      <rect x="12.5" y="18" width="11" height="2.5" fill="#f5c842" />
      <text x="18" y="31" textAnchor="middle" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="7" fill="#f5c842" letterSpacing="1">APEX</text>
    </svg>
  );
}

/* ── Generic fallback ─────────────────────────────────────────────────────*/
export function PropFirmLogo({ firm, color, logo, size = 36 }: {
  firm: string; color: string; logo: string; size?: number;
}) {
  switch (firm) {
    case 'FTMO':                 return <FtmoLogo size={size} />;
    case 'The 5%ers':            return <FivePercentersLogo size={size} />;
    case 'TOPSTEP':              return <TopstepLogo size={size} />;
    case 'Apex Trader Funding':  return <ApexTraderLogo size={size} />;
    default:
      return (
        <svg viewBox="0 0 36 36" width={size} height={size} fill="none">
          <rect width="36" height="36" rx="8" fill={color} />
          <text x="18" y="24" textAnchor="middle" fontFamily="Arial,sans-serif"
            fontWeight="900" fontSize="12" fill="white">{logo}</text>
        </svg>
      );
  }
}
