# NitroLite Integration Guide

This document provides a comprehensive guide to integrating NitroLite for gasless transactions in the Budget Buddy application.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Implementation Guide](#implementation-guide)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)
9. [API Reference](#api-reference)
10. [FAQs](#faqs)

## Overview

NitroLite enables gasless transactions in your dApp, allowing users to interact with the blockchain without needing to hold native tokens for gas fees. This integration enhances user experience by removing friction from the transaction process.

## Prerequisites

- Node.js v18 or later
- npm or yarn package manager
- Web3 wallet (e.g., MetaMask, WalletConnect)
- Access to a NitroLite node (WebSocket URL)
- WalletConnect Project ID (from https://cloud.walletconnect.com/)

## Installation

1. Install the required dependencies:

```bash
npm install @erc7824/nitrolite ethers@^5.7.2 @web3modal/ethereum @web3modal/react wagmi viem
```

## Configuration

1. Create a `.env.local` file in your project root with the following variables:

```env
# NitroLite Configuration
NEXT_PUBLIC_NITROLITE_WS_URL=your_nitrolite_websocket_url
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_DEFAULT_CHAIN=sepolia  # or your preferred testnet
```

## Implementation Guide

### 1. Set Up Web3 Providers

Create `app/providers.tsx`:

```tsx
'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { NitroliteProvider } from '@/lib/nitrolite-provider'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
const chains = [mainnet, sepolia]

const wagmiConfig = defaultWagmiConfig({ 
  chains,
  projectId,
  appName: 'Budget Buddy'
})

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
  }
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )
}
```

### 2. Create NitroLite Provider

Create `lib/nitrolite-provider.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Nitrolite } from '@erc7824/nitrolite'
import { useAccount } from 'wagmi'

type NitroliteContextType = {
  nitrolite: Nitrolite | null
  isInitialized: boolean
  initialize: () => Promise<void>
}

const NitroliteContext = createContext<NitroliteContextType>({
  nitrolite: null,
  isInitialized: false,
  initialize: async () => {}
})

export function NitroliteProvider({ children }: { children: React.ReactNode }) {
  const [nitrolite, setNitrolite] = useState<Nitrolite | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { address } = useAccount()

  const initialize = async () => {
    try {
      const nl = new Nitrolite({
        wsUrl: process.env.NEXT_PUBLIC_NITROLITE_WS_URL!,
        chainId: 11155111, // Sepolia
        signer: address
      })
      
      await nl.init()
      setNitrolite(nl)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize Nitrolite:', error)
    }
  }

  useEffect(() => {
    if (address) {
      initialize()
    }
  }, [address])

  return (
    <NitroliteContext.Provider value={{ nitrolite, isInitialized, initialize }}>
      {children}
    </NitroliteContext.Provider>
  )
}

export const useNitrolite = () => useContext(NitroliteContext)
```

### 3. Update Root Layout

Update `app/layout.tsx`:

```tsx
import { Web3Provider } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
```

## Usage Examples

### Basic Transaction Component

Create `components/nitrolite-transaction.tsx`:

```tsx
'use client'

import { Button } from './ui/button'
import { useAccount } from 'wagmi'
import { useNitrolite } from '@/lib/nitrolite-provider'
import { toast } from 'sonner'
import { NetworkSwitcher } from './network-switcher'

export function NitroliteTransaction() {
  const { isConnected } = useAccount()
  const { nitrolite, isInitialized, error } = useNitrolite()
  
  const handleTransaction = async () => {
    if (!nitrolite || !isInitialized) {
      toast.error('NitroLite not initialized')
      return
    }

    try {
      const tx = await nitrolite.sendTransaction({
        to: '0x...', // Your contract address
        data: '0x...', // Encoded function call
        value: '0', // ETH amount in wei
      })

      toast.success('Transaction submitted!', {
        description: `Transaction hash: ${tx.hash}`
      })
    } catch (err) {
      console.error('Transaction failed:', err)
      toast.error('Transaction failed', {
        description: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  if (!isConnected) {
    return <w3m-connect-button />
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <h3 className="font-medium">NitroLite Transaction</h3>
        <p className="text-sm text-muted-foreground">
          Experience gasless transactions powered by NitroLite
        </p>
      </div>
      
      <NetworkSwitcher />
      
      <Button 
        onClick={handleTransaction}
        disabled={!isInitialized || !!error}
        className="w-full"
      >
        {isInitialized ? 'Send Gasless Transaction' : 'Initializing...'}
      </Button>

      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Ensure your WebSocket URL is correct and accessible
   - Check if your network allows WebSocket connections

2. **Transaction Failures**
   - Verify the chain ID matches your NitroLite node
   - Check if the signer has sufficient funds (if not using a relayer)
   - Ensure the contract address and ABI are correct

3. **Wallet Connection Problems**
   - Make sure the wallet is connected to the correct network
   - Check if WalletConnect project ID is properly set

## Security Considerations

1. **Private Keys**
   - Never expose private keys or mnemonic phrases in client-side code
   - Use environment variables for sensitive information

2. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Set appropriate gas limits for transactions

3. **Session Management**
   - Use short-lived sessions for sensitive operations
   - Implement proper session invalidation

## API Reference

### NitroLite Class

```typescript
class Nitrolite {
  constructor(options: {
    wsUrl: string;
    chainId: number;
    signer: string | Signer;
    relayerUrl?: string;
    debug?: boolean;
  });

  init(): Promise<void>;
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
  disconnect(): void;
}
```

### Hooks

#### useNitrolite()

```typescript
const { 
  nitrolite,    // Nitrolite instance
  isInitialized, // Boolean indicating if Nitrolite is initialized
  error         // Error object if initialization failed
} = useNitrolite();
```

## FAQs

### Q: How does NitroLite handle gas fees?
A: NitroLite can either use a relayer to pay for gas or implement a meta-transaction pattern where gas is paid in ERC-20 tokens.

### Q: Is NitroLite compatible with all EVM chains?
A: NitroLite is compatible with any EVM-compatible chain, but you'll need to set up a NitroLite node for each chain you want to support.

### Q: Can I use NitroLite with any wallet?
A: Yes, NitroLite works with any EIP-1193 compatible wallet (MetaMask, WalletConnect, etc.).

### Q: How do I handle failed transactions?
A: Failed transactions will throw an error that you can catch and handle appropriately in your UI.

## Support

For additional support, please contact:
- Email: support@nitrolite.xyz
- Discord: [Join our Discord](https://discord.gg/nitrolite)
- Documentation: [NitroLite Docs](https://docs.nitrolite.xyz)
