export type ColorTheme = 'purple' | 'mono' | 'blue' | 'green' | 'orange';

export const STYLE_TAG_ID = 'alpha-color-theme-css';

const THEME_CSS: Record<ColorTheme, string> = {
  purple: '',
  mono: `
    :root,[data-color-theme="mono"]{
      --primary-gradient:linear-gradient(135deg,#1f2937,#6b7280);
      --primary-gradient-soft:linear-gradient(135deg,#6b7280,#9ca3af);
      --color-primary:#374151;
      --color-primary-light:#f3f4f6;
    }
    body{background:linear-gradient(160deg,#f7f8fa 0%,#e9ecf0 100%) fixed !important;}
    .bg-purple-50{background-color:#f3f4f6 !important;}
    .bg-purple-100{background-color:#e5e7eb !important;}
    .bg-purple-200\\/60{background-color:rgba(209,213,219,0.65) !important;}
    .text-purple-900{color:#111827 !important;}
    .text-purple-700{color:#374151 !important;}
    .text-purple-600{color:#4b5563 !important;}
    .text-purple-400{color:#9ca3af !important;}
    .text-purple-300{color:#d1d5db !important;}
    .border-purple-50{border-color:#e5e7eb !important;}
    .border-purple-100{border-color:#d1d5db !important;}
    .hover\\:bg-purple-50:hover{background-color:rgba(243,244,246,0.7) !important;}
    .bg-purple-600{background-color:#374151 !important;}
    .hover\\:bg-purple-700:hover{background-color:#1f2937 !important;}
    ::-webkit-scrollbar-thumb{background:#9ca3af;}
    ::-webkit-scrollbar-thumb:hover{background:#6b7280;}
  `,
  blue: `
    :root,[data-color-theme="blue"]{
      --primary-gradient:linear-gradient(135deg,#1d4ed8,#38bdf8);
      --primary-gradient-soft:linear-gradient(135deg,#60a5fa,#93c5fd);
      --color-primary:#2563eb;
      --color-primary-light:#dbeafe;
    }
    body{background:linear-gradient(160deg,#f0f6ff 0%,#dbeafe 100%) fixed !important;}
    .bg-purple-50{background-color:#eff6ff !important;}
    .bg-purple-100{background-color:#dbeafe !important;}
    .bg-purple-200\\/60{background-color:rgba(191,219,254,0.65) !important;}
    .text-purple-900{color:#1e3a8a !important;}
    .text-purple-700{color:#1d4ed8 !important;}
    .text-purple-600{color:#2563eb !important;}
    .text-purple-400{color:#60a5fa !important;}
    .text-purple-300{color:#93c5fd !important;}
    .border-purple-50{border-color:#dbeafe !important;}
    .border-purple-100{border-color:#bfdbfe !important;}
    .hover\\:bg-purple-50:hover{background-color:rgba(239,246,255,0.7) !important;}
    .bg-purple-600{background-color:#2563eb !important;}
    .hover\\:bg-purple-700:hover{background-color:#1d4ed8 !important;}
    ::-webkit-scrollbar-thumb{background:#93c5fd;}
    ::-webkit-scrollbar-thumb:hover{background:#60a5fa;}
  `,
  green: `
    :root,[data-color-theme="green"]{
      --primary-gradient:linear-gradient(135deg,#047857,#34d399);
      --primary-gradient-soft:linear-gradient(135deg,#34d399,#6ee7b7);
      --color-primary:#059669;
      --color-primary-light:#d1fae5;
    }
    body{background:linear-gradient(160deg,#f0fdf6 0%,#d1fae5 100%) fixed !important;}
    .bg-purple-50{background-color:#f0fdf4 !important;}
    .bg-purple-100{background-color:#dcfce7 !important;}
    .bg-purple-200\\/60{background-color:rgba(187,247,208,0.65) !important;}
    .text-purple-900{color:#052e16 !important;}
    .text-purple-700{color:#047857 !important;}
    .text-purple-600{color:#059669 !important;}
    .text-purple-400{color:#34d399 !important;}
    .text-purple-300{color:#6ee7b7 !important;}
    .border-purple-50{border-color:#d1fae5 !important;}
    .border-purple-100{border-color:#a7f3d0 !important;}
    .hover\\:bg-purple-50:hover{background-color:rgba(240,253,244,0.7) !important;}
    .bg-purple-600{background-color:#059669 !important;}
    .hover\\:bg-purple-700:hover{background-color:#047857 !important;}
    ::-webkit-scrollbar-thumb{background:#6ee7b7;}
    ::-webkit-scrollbar-thumb:hover{background:#34d399;}
  `,
  orange: `
    :root,[data-color-theme="orange"]{
      --primary-gradient:linear-gradient(135deg,#c2410c,#fb923c);
      --primary-gradient-soft:linear-gradient(135deg,#fb923c,#fbbf24);
      --color-primary:#ea580c;
      --color-primary-light:#fed7aa;
    }
    body{background:linear-gradient(160deg,#fff8f0 0%,#ffedd5 100%) fixed !important;}
    .bg-purple-50{background-color:#fff7ed !important;}
    .bg-purple-100{background-color:#ffedd5 !important;}
    .bg-purple-200\\/60{background-color:rgba(254,215,170,0.65) !important;}
    .text-purple-900{color:#7c2d12 !important;}
    .text-purple-700{color:#c2410c !important;}
    .text-purple-600{color:#ea580c !important;}
    .text-purple-400{color:#fb923c !important;}
    .text-purple-300{color:#fdba74 !important;}
    .border-purple-50{border-color:#fed7aa !important;}
    .border-purple-100{border-color:#fdba74 !important;}
    .hover\\:bg-purple-50:hover{background-color:rgba(255,247,237,0.7) !important;}
    .bg-purple-600{background-color:#ea580c !important;}
    .hover\\:bg-purple-700:hover{background-color:#c2410c !important;}
    ::-webkit-scrollbar-thumb{background:#fdba74;}
    ::-webkit-scrollbar-thumb:hover{background:#fb923c;}
  `,
};

export function applyColorTheme(theme: ColorTheme) {
  const root = document.documentElement;

  // Set data attribute
  if (theme === 'purple') {
    root.removeAttribute('data-color-theme');
  } else {
    root.setAttribute('data-color-theme', theme);
  }

  // Inject or update the <style> tag
  let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = STYLE_TAG_ID;
    document.head.appendChild(tag);
  }
  tag.textContent = THEME_CSS[theme];

  // Persist
  try { localStorage.setItem('colorTheme', theme); } catch {}

  // Notify chart components to re-read theme colors
  try { window.dispatchEvent(new CustomEvent('alpha-theme-change', { detail: theme })); } catch {}
}

export function initColorTheme() {
  try {
    const saved = (localStorage.getItem('colorTheme') as ColorTheme) || 'purple';
    applyColorTheme(saved);
    return saved;
  } catch {
    return 'purple' as ColorTheme;
  }
}
