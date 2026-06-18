import ThemeRegistry from './ThemeRegistry';

export const metadata = {
  title: 'Stawisha | Continuity of Care',
  description: 'Your recovery doesn\'t take a vacation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
