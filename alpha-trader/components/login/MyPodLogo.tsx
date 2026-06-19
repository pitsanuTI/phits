'use client';

// Premium rounded-square "My Pod" app icon. Purple gradient background with a
// soft, modern white "P" letterform drawn as a vector so it stays crisp at any
// size. `glow` adds the elevated shadow used for the floating badge.

export function MyPodLogo({
  size = 48,
  glow = false,
  className = '',
}: {
  size?: number;
  glow?: boolean;
  className?: string;
}) {
  const radius = Math.round(size * 0.3);
  const stroke = Math.max(2, size * 0.11);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg,#7c3aed 0%,#9d6cf5 55%,#67c9ff 130%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: glow ? '0 14px 34px rgba(124,58,237,0.4)' : undefined,
      }}
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        {/* Stem + bowl of the "P" — round caps give it a soft premium feel. */}
        <path
          d="M17 11 V37 M17 11 H29 a8.5 8.5 0 0 1 0 17 H17"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small accent dot — the "pod" spark. */}
        <circle cx="33.5" cy="36" r={stroke * 0.6} fill="#bdf0d6" />
      </svg>
    </div>
  );
}

export default MyPodLogo;
