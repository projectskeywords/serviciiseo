import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Fraunces } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'StrategyProbe — Analiza Concurenților Online Gratuit',
  description: 'Analizează-ți site-ul față de concurenți în câteva secunde. Scor de performanță, SEO, accesibilitate și plan de acțiune gratuit.',
  keywords: 'analiza concurenti, competitor analyzer, seo checker, performanta site, strategyprobe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
