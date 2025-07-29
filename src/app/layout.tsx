import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { Squares } from '@/components/ui/squares-background';

export const metadata: Metadata = {
  title: 'Mindful Me',
  description: 'A web-based ADHD productivity and wellness platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-black">
        <div className="fixed inset-0 -z-10 h-full w-full">
            <Squares
                direction="diagonal"
                speed={0.2}
                squareSize={30}
                borderColor="#1a1a1a"
                hoverFillColor="#111"
            />
        </div>
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
