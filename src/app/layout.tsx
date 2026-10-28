import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CAMPUS — Smart Campus Directory & Timetable',
    template: '%s · CAMPUS',
  },
  description:
    'Live availability for 63 classrooms, labs and study spaces across campus — derived from the official timetable with AC and socket telemetry.',
  applicationName: 'CAMPUS',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#121211' },
  ],
};

/**
 * Theme bootstrap runs BEFORE first paint (blocking inline script) so the
 * correct .dark class is applied without a flash. Storage key is namespaced.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('jainspace-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
