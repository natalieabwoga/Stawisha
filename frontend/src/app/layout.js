import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Stawisha | Continuity of Care',
  description: 'Your recovery doesn\'t take a vacation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
