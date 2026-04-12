import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/ThemeProvider"

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#18181a",
}

export const metadata: Metadata = {
  title: "Niki's Brain",
  description: "Personal digital OS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Niki's Brain",
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('theme-mode');
              var resolved;
              if (stored === 'dark') {
                resolved = 'dark';
              } else if (stored === 'light') {
                resolved = 'light';
              } else {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.classList.remove('dark', 'light');
              document.documentElement.classList.add(resolved);
            } catch(e) {}
          })();
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        ` }} />
      </head>
      <body className={`${jakartaSans.variable} ${dmSerif.variable} bg-notion-bg text-notion-text antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
