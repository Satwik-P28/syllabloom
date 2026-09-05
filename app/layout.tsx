import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://syllabloom.nex3sss.chatgpt.site';

export const metadata: Metadata = {
  title: 'Syllabloom — Open-source local TTS reader for text and PDFs',
  description:
    'Free private text-to-speech reader and Speechify alternative. Import TXT, Markdown, or text PDFs, listen with system voices, and keep documents on this device.',
  keywords: [
    'open source speechify alternative',
    'PDF text to speech',
    'local TTS reader',
    'accessible PDF reader',
    'privacy text to speech',
  ],
  authors: [{ name: 'Syllabloom contributors' }],
  category: 'education',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Syllabloom — Let every page find its voice',
    description: 'A private, local-first reader for documents and pasted text.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllabloom — Let every page find its voice',
    description: 'A private, local-first reader for documents and pasted text.',
    images: ['/og.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Syllabloom',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Private local-first TTS reader for text, Markdown, and text-based PDFs.',
  url: siteUrl,
  downloadUrl: 'https://github.com/Satwik-P28/syllabloom',
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
