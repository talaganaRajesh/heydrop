import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hey Drop - Share anything instantly',
  description: 'Easily share files, text, or notes with anyone instantly and securely. No login required. Created by Talagana Rajesh.',
  generator: 'Next.js',
  applicationName: 'Hey Drop',
  authors: [{ name: 'Talagana Rajesh', url: 'https://talaganarajesh.vercel.app/' }],
  keywords: ['file sharing', 'text sharing', 'Hey Drop', 'Talagana Rajesh', 'instant sharing', 'no login', 'secure file transfer','Hey drop by talagana rajesh','talagana rajesh new project','hey drop rajesh','talagana rajesh file sharing website'],
  creator: 'Talagana Rajesh',
  publisher: 'Talagana Rajesh',
  metadataBase: new URL('https://heydrop.vercel.app'), // Replace with your deployed domain

  openGraph: {
    title: 'Hey Drop - Share anything instantly',
    description: 'Send files or text quickly without any login or signup. One-click sharing!',
    url: 'https://heydrop.vercel.app', // Replace with your live site URL
    siteName: 'Hey Drop',
    images: [
      {
        url: '/favicon.png', // Replace with your real OG image
        width: 1200,
        height: 630,
        alt: 'Hey Drop preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Hey Drop - Share anything instantly',
    description: 'One-click sharing of files and text. Fast, secure, and login-free.',
    creator: '@Rajeshtalagana', // Replace if you have one
    images: ['/favicon.png'],
  },

  icons: {
    icon: '/favicon.png', // Dummy favicon path, replace with actual image path
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },

  themeColor: '#ffffff',
  colorScheme: 'light dark',
  manifest: '/site.webmanifest', // Add a webmanifest if needed
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  )
}
