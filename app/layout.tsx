import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'מה אוכלים הערב?',
  description: 'גלגל המזל של המשפחה',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.className} bg-gray-50 min-h-screen text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
