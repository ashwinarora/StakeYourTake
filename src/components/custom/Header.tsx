"use client"

import React from 'react'
import { useAccount, useConnect, useBalance, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'

function Header() {
  const router = useRouter()
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId,
    query: { enabled: Boolean(address) }
  })

  return (
    <div>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1 text-white">
            <button 
              onClick={() => router.push('/')}
              className="-m-1.5 p-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              StakeYourTake          
            </button>
          </div>
          <div className="flex lg:hidden">
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-3">
            {!isConnected ? (
              <button
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                disabled={isPending}
                className="rounded-md border border-indigo-500/60 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-500 hover:bg-indigo-500/20 disabled:opacity-60"
              >
                {isPending ? 'Connecting…' : 'Connect Wallet'}
              </button>
            ) : (
              <>
                <div
                  className="rounded-md border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-sm font-medium text-white"
                  title={balanceData?.symbol || ''}
                >
                  {isBalanceLoading
                    ? '…'
                    : balanceData
                      ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
                      : ''}
                </div>
                <div
                  className="rounded-md border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-sm font-medium text-white"
                  title={address || ''}
                >
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs hover:cursor-pointer font-semibold text-rose-400 hover:bg-rose-500/20"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </nav>

      </header>
    </div>
  )
}

export default Header