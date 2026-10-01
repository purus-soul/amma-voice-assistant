import './globals.css';

export const metadata = {
  title: 'Amma Voice Assistant | PMMVY Guidance',
  description: 'AI Voice Navigator for First-Time Rural Women Users across Tamil, Hindi, Telugu, and Malayalam',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
