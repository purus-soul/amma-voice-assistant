import './globals.css';

export const metadata = {
  title: 'Amma Voice Assistant | PMMVY Guidance',
  description: 'AI Voice Navigator for First-Time Rural Women Users across Tamil, Hindi, Telugu, and Malayalam',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
