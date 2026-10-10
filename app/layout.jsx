import '@fontsource/jost/latin-300.css';
import '@fontsource/jost/latin-400.css';
import '@fontsource/jost/latin-500.css';
import '@fontsource/jost/latin-600.css';
import '@fontsource/manrope/latin-300.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/barlow-condensed/latin-300.css';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-300.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AppearanceProvider } from '@/components/Appearance';
import { appearanceScript } from '@/lib/appearance.mjs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { site } from '@/lib/site';

export const metadata = {
  title: `${site.name} — ${site.role}`,
  description: `${site.name} — engineer, builder, content creator.`,
};

export const viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f6f7f5' }, { media: '(prefers-color-scheme: dark)', color: '#101210' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: appearanceScript }} /></head>
      <body>
        <AppearanceProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </AppearanceProvider>
      </body>
    </html>
  );
}
