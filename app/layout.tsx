import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'eSports WhatsApp Manager',
  description: 'Manage eSports group ops and WhatsApp messaging',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>eSports WhatsApp Manager</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">? {new Date().getFullYear()} eSports Ops</footer>
        </div>
      </body>
    </html>
  );
}
