import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'JainSpace — find a seat, not a fight',
    template: '%s · JainSpace',
  },
  description:
    'Live availability for every classroom, lab and study space on campus — derived from the real timetable, confirmed by students.',
  applicationName: 'JainSpace',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0A09' },
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
