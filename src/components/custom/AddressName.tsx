"use client"

import React from 'react'
import { useEnsName } from 'wagmi'
import { sepolia } from 'wagmi/chains'

type AddressNameProps = {
  address?: `0x${string}` | string
  className?: string
  title?: string
}

function shorten(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function AddressName({ address, className, title }: AddressNameProps) {
  const checksummed = (address || '') as `0x${string}`
  const { data: ensName } = useEnsName({
    address: checksummed,
    chainId: sepolia.id,
    query: { enabled: Boolean(address) },
  })

  const display = ensName || (address ? shorten(String(address)) : '')

  return (
    <span className={className} title={title || (address ? String(address) : undefined)}>
      {display}
    </span>
  )
}


