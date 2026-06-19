import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PHITS — Personal OS',
  description: 'Personal Operating System by Phitsanu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${plusJakarta.variable} ${inter.variable}`}>
      <head>
        {/* Noto Sans Thai for Thai script */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {/* Apply saved theme before paint to avoid flash */}
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}var ct=localStorage.getItem('colorTheme');if(ct&&ct!=='purple'){document.documentElement.setAttribute('data-color-theme',ct);}}catch(e){}})();`}</Script>
        {children}
      </body>
    </html>
  );
}
