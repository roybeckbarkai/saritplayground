import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'מה לאכול?',
  description: 'בחירת ארוחות לילדים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} bg-amber-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
