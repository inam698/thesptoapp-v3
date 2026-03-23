"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ToastProvider from "@/components/ui/Toast";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>The Spot App - Admin</title>
        <meta name="description" content="Admin dashboard for The Spot App" />

        {/* Viewport — critical for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9B6DAE" />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spot Admin" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/* Android / favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/icon.png" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ToastProvider />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
