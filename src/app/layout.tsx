import type { Metadata } from 'next';
import { Geist, Geist_Mono, Science_Gothic } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const scienceGothic = Science_Gothic({
  variable: '--font-science-gothic',
  subsets: ['latin'],
  weight: ['400', '700'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    template: '%s | OBScure',
    default: 'OBScure',
  },
  description: 'Documentation for the OBScure Electron application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${scienceGothic.variable}`} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${scienceGothic.variable} antialiased`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}