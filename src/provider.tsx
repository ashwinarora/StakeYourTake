'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ThemeProvider } from 'next-themes'
import { config } from '@/config/wagmi'
import { Toaster } from '@/components/ui/sonner'


const queryClient = new QueryClient()

export const Provider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
