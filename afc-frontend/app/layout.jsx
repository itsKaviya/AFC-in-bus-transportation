import { Space_Grotesk, JetBrains_Mono, Syne } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'AFC System — Automated Fare Collection',
  description: 'Smart bus ticketing with RFID & GPS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${space.variable} ${mono.variable} ${syne.variable} font-sans bg-surface text-slate-100 antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
