# NitroLite Integration Guide for Budget Buddy

This document provides a comprehensive guide to integrating NitroLite for gasless blockchain transactions in the Budget Buddy application. The integration is specifically designed to work with the existing codebase structure, including Supabase, Next.js, and the current transaction system.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Implementation Guide](#implementation-guide)
6. [Database Schema Updates](#database-schema-updates)
7. [UI Components](#ui-components)
8. [API Routes](#api-routes)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Security Considerations](#security-considerations)
12. [API Reference](#api-reference)
13. [Frequently Asked Questions](#frequently-asked-questions)

## Overview

NitroLite enables gasless blockchain transactions in Budget Buddy, allowing users to interact with on-chain financial operations without needing to hold native tokens for gas fees. This integration enhances the existing transaction system by adding blockchain capabilities while maintaining the current user experience.

### Key Benefits for Budget Buddy

#### Seamless Integration

- Integrates with existing Supabase database tables (`transactions`, `profiles`)
- Complements the current transaction system with blockchain capabilities
- Maintains consistent UI/UX patterns using existing components
- Leverages Next.js 14 App Router and Server Components

#### Enhanced Features

- On-chain transaction history synced with Supabase
- Gasless transactions using NitroLite
- Wallet connection via [Web3Modal](https://github.com/WalletConnect/web3modal)
- Support for multiple chains (Sepolia for testing, Mainnet for production)
- Transaction status tracking (pending, confirmed, failed)


#### Developer Experience

- Type-safe implementation with TypeScript
- Reusable React hooks for blockchain interactions
- Server Actions for secure transaction processing
- Comprehensive error handling and user feedback

## Prerequisites

### Development Environment
- Node.js v18 or later (already in use)
- npm (already in use)
- Git (for version control)

### Accounts & Services
1. **WalletConnect Project ID**
   - Create at: https://cloud.walletconnect.com/
   - Required for wallet connection

2. **NitroLite Node**
   - WebSocket URL for NitroLite
   - Contact support@nitrolite.xyz for access

3. **Blockchain Network**
   - Sepolia testnet (recommended for development)
   - Mainnet (for production)

### Budget Buddy Dependencies

Ensure these are installed (already in your package.json):

```bash
# Core dependencies
"@radix-ui/react-dialog": "^1.1.15"
"@radix-ui/react-dropdown-menu": "^2.1.16"
"@supabase/supabase-js": "^2.55.0"
"next": "^14.0.0"
"react": "^18.2.0"
"react-dom": "^18.2.0"
"typescript": "^5.0.0"

# UI Components
"lucide-react": "^0.540.0"
"sonner": "^2.0.7"
"class-variance-authority": "^0.7.0"
"clsx": "^2.1.0"
"tailwind-merge": "^2.0.0"
"tailwindcss-animate": "^1.0.0"

# State Management
"zod": "^3.22.0"
"@hookform/resolvers": "^3.3.0"
"react-hook-form": "^7.49.0"
```

## Installation

### 1. Install Required Dependencies

```bash
# Core blockchain dependencies
npm install @erc7824/nitrolite ethers@^5.7.2 @web3modal/ethereum @web3modal/react wagmi viem

# TypeScript types and additional utilities
npm install --save-dev @types/node @types/react @types/react-dom @types/ethers
```

### 2. Update TypeScript Configuration

Ensure your `tsconfig.json` includes these compiler options:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 3. Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# NitroLite
NEXT_PUBLIC_NITROLITE_WS_URL=your_nitrolite_websocket_url

# Blockchain Network (1 for mainnet, 11155111 for Sepolia)
NEXT_PUBLIC_CHAIN_ID=11155111

# Contract Addresses (update these with your deployed contracts)
NEXT_PUBLIC_PAYMENT_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Webhook Secret
WEBHOOK_SECRET_TOKEN=your_webhook_secret_token
```

## Configuration

### 1. Next.js Configuration

Update your `next.config.js` to support Web3 libraries:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
    }
    return config
  },
  // ... rest of your config
}

module.exports = nextConfig
```

### 2. Database Configuration

Ensure your Supabase database has the necessary tables and RLS policies as described in the [Database Schema Updates](#database-schema-updates) section.

## Getting Started

### 1. Initialize the Web3 Provider

Create a new file at `app/providers.tsx` to set up the Web3 and NitroLite providers:

```tsx
'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { NitroliteProvider } from '@/lib/nitrolite-provider'
import { ReactNode, useEffect, useState } from 'react'

// 1. Get projectId at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// 2. Configure chains
const chains = [sepolia, mainnet]
const defaultChain = process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? mainnet : sepolia

// 3. Create wagmiConfig
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: 'Budget Buddy',
  defaultChain
})

// 4. Create Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#3b82f6',
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, sans-serif',
  },
  // Add custom tokens if needed
  tokens: {
    1: {
      address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '',
      symbol: 'BUDGET',
      decimals: 18,
      image: 'https://your-app-url.com/images/token-logo.png'
    },
    11155111: {
      address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '',
      symbol: 'BUDGET',
      decimals: 18,
      image: 'https://your-app-url.com/images/token-logo.png'
    }
  }
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <WagmiConfig config={wagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )
}
```

### 2. Update Root Layout

Update your root layout (`app/layout.tsx`) to include the Web3Provider:

```tsx
import { Web3Provider } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
```

## Usage

### 1. Connect Wallet

Use the `WalletConnectButton` component to allow users to connect their wallet:

```tsx
'use client'

import { WalletConnectButton } from '@/components/wallet-connect-button'

export default function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <h1 className="text-xl font-bold">Budget Buddy</h1>
        <WalletConnectButton />
      </div>
    </header>
  )
}
```

### 2. Send a Transaction

Use the `BlockchainTransactionForm` component to send transactions:

```tsx
'use client'

import { BlockchainTransactionForm } from '@/components/transactions/blockchain-transaction-form'

export default function SendPage() {
  return (
    <div className="container max-w-md py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Send Crypto</h1>
          <p className="text-muted-foreground">
            Send cryptocurrency to any Ethereum address
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <BlockchainTransactionForm />
        </div>
      </div>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure the WalletConnect project ID is correctly set in your environment variables
   - Check that the user has a Web3 wallet installed (e.g., MetaMask)
   - Verify the network (e.g., Sepolia testnet) is added to the user's wallet

2. **Transaction Failing**
   - Check the browser console for error messages
   - Verify the user has sufficient funds for gas fees
   - Ensure the contract addresses are correct for the selected network

3. **Webhook Not Receiving Updates**
   - Check the webhook URL is correctly configured in your NitroLite dashboard
   - Verify the webhook secret token matches between your app and NitroLite
   - Check your server logs for any errors processing webhook events

## Security Considerations

### Secure API Routes

- Always validate and sanitize user input
- Use environment variables for sensitive data
- Implement rate limiting on public endpoints
- Use HTTPS for all API requests

### Wallet Security

- Never expose private keys in client-side code
- Use WalletConnect for secure wallet connections
- Implement session timeouts for wallet connections
- Warn users about phishing attempts

### Transaction Security

- Display transaction details before confirmation
- Show estimated gas fees
- Allow users to adjust gas prices
- Provide clear error messages for failed transactions

## API Reference

### useBlockchainTransaction Hook

```typescript
const {
  executeTransaction,
  isLoading,
  error,
  isConnected,
  isInitialized
} = useBlockchainTransaction()

// Execute a transaction
const tx = await executeTransaction(
  to: string,        // Recipient address
  data: string,      // Transaction data (0x for simple transfers)
  value: string,     // Amount in wei
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
  }
)
```
```

## Frequently Asked Questions

### 1. What is NitroLite?
NitroLite is a protocol that enables gasless transactions on Ethereum and other EVM-compatible blockchains.

### 2. How do gasless transactions work?
Gasless transactions allow users to interact with smart contracts without paying gas fees directly. The fees are either sponsored by the dApp or paid for by a relayer.

### 3. Which wallets are supported?
Any wallet that supports WalletConnect v2 is supported, including MetaMask, Trust Wallet, Rainbow, and more.

### 4. How do I switch between testnet and mainnet?
Update the `NEXT_PUBLIC_CHAIN_ID` environment variable (`1` for mainnet, `11155111` for Sepolia).

### 5. How can I monitor transactions?
You can monitor transactions using:
- Block explorers (Etherscan, Sepolia Etherscan)
- Your Supabase dashboard
- The transaction history API endpoint

## Support

For additional help, please contact `support@yourdomain.com` or join our [Discord community](https://discord.gg/your-discord).

## Database Schema Updates

### Update Transactions Table

Add these columns to your Supabase `transactions` table to support blockchain transactions:

```sql
-- Add blockchain-related columns to transactions table
alter table public.transactions
  add column if not exists tx_hash text,
  add column if not exists tx_status text default 'pending',
  add column if not exists chain_id integer,
  add column if not exists from_address text,
  add column if not exists to_address text,
  add column if not exists block_number bigint,
  add column if not exists block_timestamp timestamptz,
  add column if not exists gas_used numeric,
  add column if not exists gas_price numeric,
  add column if not exists receipt_data jsonb;

-- Create index for faster lookups
create index if not exists idx_transactions_tx_hash on public.transactions(tx_hash);
create index if not exists idx_transactions_tx_status on public.transactions(tx_status);
create index if not exists idx_transactions_chain_id on public.transactions(chain_id);
```

### 2. Create Blockchain Transactions Table (Optional)

For more detailed tracking of blockchain transactions, create a separate table:

```sql
create table if not exists public.blockchain_transactions (
  id uuid primary key default uuid_generate_v4(),
  tx_hash text not null,
  chain_id integer not null,
  from_address text not null,
  to_address text,
  value numeric not null default 0,
  data text,
  block_number bigint,
  block_hash text,
  block_timestamp timestamptz,
  status text not null default 'pending',
  gas_used numeric,
  gas_price numeric,
  receipt_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tx_hash, chain_id)
);

-- Create indexes for common queries
create index if not exists idx_blockchain_txs_tx_hash on public.blockchain_transactions(tx_hash);
create index if not exists idx_blockchain_txs_status on public.blockchain_transactions(status);
create index if not exists idx_blockchain_txs_from on public.blockchain_transactions(from_address);
create index if not exists idx_blockchain_txs_to on public.blockchain_transactions(to_address);
create index if not exists idx_blockchain_txs_created on public.blockchain_transactions(created_at);

-- Row-level security (RLS) policies
alter table public.blockchain_transactions enable row level security;

-- Allow read access to authenticated users
create policy "Enable read access for authenticated users"
on public.blockchain_transactions
for select
using (auth.role() = 'authenticated');

-- Allow insert for service role
create policy "Enable insert for service role"
on public.blockchain_transactions
for insert
to service_role
with check (true);

-- Allow update for service role
create policy "Enable update for service role"
on public.blockchain_transactions
for update
to service_role
using (true);
```

## UI Components

### 1. Wallet Connect Button

Create a new component at `components/wallet-connect-button.tsx`:

```tsx
'use client'

import { useWeb3Modal } from '@web3modal/react'
import { Button } from '@/components/ui/button'
import { useAccount, useDisconnect } from 'wagmi'
import { LogOut, Wallet } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function WalletConnectButton() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  const router = useRouter()

  const handleConnect = async () => {
    try {
      await open()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    router.refresh()
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected || !address) {
    return (
      <Button onClick={handleConnect} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-muted">
        {formatAddress(address)}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDisconnect}
        title="Disconnect Wallet"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### 2. Blockchain Transaction Form

Create a new component at `components/transactions/blockchain-transaction-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAccount, useNetwork } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Form validation schema
const formSchema = z.object({
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a number greater than 0',
  }),
  memo: z.string().max(200).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function BlockchainTransactionForm() {
  const { toast } = useToast()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { executeTransaction, isLoading } = useBlockchainTransaction()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      amount: '',
      memo: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert amount to wei (18 decimals)
      const amountInWei = (parseFloat(values.amount) * 1e18).toString()

      // Execute the transaction
      const tx = await executeTransaction(
        values.recipient,
        '0x', // Empty data for simple ETH transfers
        amountInWei,
        {
          successMessage: `Successfully sent ${values.amount} ETH to ${values.recipient.slice(0, 6)}...${values.recipient.slice(-4)}`,
          errorMessage: 'Failed to send transaction',
          onSuccess: (txData) => {
            // Reset form on success
            form.reset()
            
            // Here you would typically update your UI or refetch data
            console.log('Transaction successful:', txData)
          },
        }
      )

      return tx
    } catch (error) {
      console.error('Transaction error:', error)
      throw error // Let the form handle the error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x..."
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (ETH)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.000000000000000001"
                    placeholder="0.0"
                    className="pl-3 pr-12"
                    {...field}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-muted-foreground text-sm">
                      ETH
                    </span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memo (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a note about this transaction"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !address}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {address ? 'Send Transaction' : 'Connect Wallet'}
              </>
            )}
          </Button>
        </div>

        {chain && (
          <div className="text-xs text-muted-foreground text-center">
            Connected to {chain.name} (Chain ID: {chain.id})
          </div>
        )}
      </form>
    </Form>
  )
}
```

## API Routes

### 1. Transaction Webhook Endpoint

Create a new API route at `app/api/transactions/webhook/route.ts` to handle transaction status updates from your blockchain listener service:

```typescript
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Define the expected request body schema
const webhookSchema = z.object({
  event: z.enum(['transaction.pending', 'transaction.confirmed', 'transaction.failed']),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chainId: z.number().int().positive(),
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  value: z.string(),
  blockNumber: z.number().int().positive().optional(),
  blockHash: z.string().optional(),
  timestamp: z.number().int().positive().optional(),
  gasUsed: z.string().optional(),
  gasPrice: z.string().optional(),
  receipt: z.record(z.any()).optional(),
  error: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Verify the request comes from a trusted source
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== expectedToken) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse and validate the request body
    const body = await request.json()
    const validation = webhookSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { event, txHash, chainId, from, to, blockNumber, timestamp, gasUsed, gasPrice, receipt, error } = validation.data
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Update the transaction status in the database
    const { data, error: dbError } = await supabase
      .from('transactions')
      .update({
        tx_status: event.split('.')[1], // 'pending', 'confirmed', or 'failed'
        chain_id: chainId,
        from_address: from,
        to_address: to,
        block_number: blockNumber,
        block_timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : null,
        gas_used: gasUsed ? BigInt(gasUsed).toString() : null,
        gas_price: gasPrice ? BigInt(gasPrice).toString() : null,
        receipt_data: receipt || null,
        updated_at: new Date().toISOString(),
        ...(error && { error_message: error }),
      })
      .eq('tx_hash', txHash)
      .select()
      .single()

    if (dbError) {
      console.error('Error updating transaction:', dbError)
      return NextResponse.json(
        { error: 'Failed to update transaction', details: dbError },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 2. Transaction History Endpoint

Create an API route to fetch transaction history at `app/api/transactions/history/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Define query parameters schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  status: z.enum(['all', 'pending', 'confirmed', 'failed']).default('all'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  chainId: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['created_at', 'block_timestamp']).default('block_timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validation = querySchema.safeParse(query)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { page, limit, status, address, chainId, sortBy, sortOrder } = validation.data
    const offset = (page - 1) * limit
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Build the query
    let queryBuilder = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('tx_status', status)
    }
    
    if (address) {
      queryBuilder = queryBuilder.or(`from_address.eq.${address},to_address.eq.${address}`)
    }
    
    if (chainId) {
      queryBuilder = queryBuilder.eq('chain_id', chainId)
    }
    
    // Execute the query
    const { data: transactions, count, error } = await queryBuilder
    
    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in transactions/history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Testing

### 1. Unit Tests

Create test files for your components and hooks. Example for `useBlockchainTransaction` hook:

```typescript
// tests/hooks/useBlockchainTransaction.test.tsx
import { renderHook, act } from '@testing-library/react-hooks'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import { NitroliteProvider } from '@/lib/nitrolite-provider'
import { WagmiConfig } from 'wagmi'
import { mockWagmiConfig } from '../test-utils'

describe('useBlockchainTransaction', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WagmiConfig config={mockWagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBlockchainTransaction(), { wrapper })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.executeTransaction).toBe('function')
  })

  it('should execute a transaction successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useBlockchainTransaction(), 
      { wrapper }
    )
    
    // Mock the NitroLite transaction
    const mockTx = { hash: '0x123...' }
    const mockNitrolite = {
      sendTransaction: jest.fn().mockResolvedValue(mockTx)
    }
    
    // Mock the useNitrolite hook
    jest.spyOn(require('@/lib/nitrolite-provider'), 'useNitrolite')
      .mockImplementation(() => ({
        nitrolite: mockNitrolite,
        isInitialized: true,
        isConnected: true,
      }))
    
    // Execute the transaction
    await act(async () => {
      const promise = result.current.executeTransaction(
        '0xRecipientAddress',
        '0x',
        '1000000000000000000', // 1 ETH in wei
        {
          successMessage: 'Transaction successful',
          errorMessage: 'Transaction failed',
        }
      )
      
      expect(result.current.isLoading).toBe(true)
      
      const tx = await promise
      expect(tx).toEqual(mockTx)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(mockNitrolite.sendTransaction).toHaveBeenCalledWith({
      to: '0xRecipientAddress',
      data: '0x',
      value: '1000000000000000000',
    })
  })
})
```

### 2. Integration Tests

Test the interaction between components and the blockchain:

```typescript
// tests/components/BlockchainTransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BlockchainTransactionForm } from '@/components/transactions/blockchain-transaction-form'
import { WagmiConfig } from 'wagmi'
import { NitroliteProvider } from '@/lib/nitrolite-provider'
import { mockWagmiConfig } from '../test-utils'

describe('BlockchainTransactionForm', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WagmiConfig config={mockWagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )

  it('should render the form with all fields', () => {
    render(<BlockchainTransactionForm />, { wrapper })
    
    expect(screen.getByLabelText(/recipient address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/memo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('should validate the form inputs', async () => {
    render(<BlockchainTransactionForm />, { wrapper })
    
    // Test invalid Ethereum address
    const recipientInput = screen.getByLabelText(/recipient address/i)
    fireEvent.change(recipientInput, { target: { value: 'invalid-address' } })
    
    // Test invalid amount
    const amountInput = screen.getByLabelText(/amount/i)
    fireEvent.change(amountInput, { target: { value: '0' } })
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /connect wallet/i })
    fireEvent.click(submitButton)
    
    // Check for validation errors
    expect(await screen.findByText(/invalid ethereum address/i)).toBeInTheDocument()
    expect(await screen.findByText(/must be greater than 0/i)).toBeInTheDocument()
  })

  it('should submit the form with valid data', async () => {
    // Mock the wallet connection
    jest.spyOn(require('wagmi'), 'useAccount').mockImplementation(() => ({
      address: '0x123...',
      isConnected: true,
    }))
    
    // Mock the transaction execution
    const mockExecute = jest.fn().mockResolvedValue({ hash: '0x123...' })
    jest.spyOn(require('@/lib/hooks/use-blockchain-transaction'), 'useBlockchainTransaction')
      .mockImplementation(() => ({
        executeTransaction: mockExecute,
        isLoading: false,
        error: null,
      }))
    
    render(<BlockchainTransactionForm />, { wrapper })
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    })
    
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '0.1' },
    })
    
    fireEvent.change(screen.getByLabelText(/memo/i), {
      target: { value: 'Test transaction' },
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send transaction/i }))
    
    // Check that the transaction was executed
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '0x',
        '100000000000000000', // 0.1 ETH in wei
        expect.objectContaining({
          successMessage: expect.any(String),
          errorMessage: expect.any(String),
        })
      )
    })
  })
})
```

### 3. End-to-End Tests

Use Playwright or Cypress for end-to-end testing:

```typescript
// tests/e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Blockchain Transactions', () => {
  test('should connect wallet and send a transaction', async ({ page }) => {
    // Navigate to the transactions page
    await page.goto('/transactions')
    
    // Click the connect wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await connectButton.click()
    
    // Mock the wallet connection
    await page.evaluate(() => {
      window.ethereum = {
        isMetaMask: true,
        request: async (request: { method: string, params?: any[] }) => {
          if (request.method === 'eth_requestAccounts') {
            return ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']
          }
          return null
        },
        on: () => {},
        removeListener: () => {},
      } as any
    })
    
    // Check that the wallet is connected
    await expect(page.getByText(/0x742d...f44e/)).toBeVisible()
    
    // Fill out the transaction form
    await page.getByLabel(/recipient address/i).fill('0x1234567890123456789012345678901234567890')
    await page.getByLabel(/amount/i).fill('0.01')
    await page.getByLabel(/memo/i).fill('E2E test transaction')
    
    // Mock the transaction response
    await page.route('**/rpc', async (route) => {
      const request = route.request()
      const postData = await request.postData()
      
      if (postData?.includes('eth_sendRawTransaction')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            result: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          }),
        })
      }
      
      // Default response for other RPC calls
      return route.continue()
    })
    
    // Submit the transaction
    await page.getByRole('button', { name: /send transaction/i }).click()
    
    // Check for success message
    await expect(page.getByText(/transaction submitted/i)).toBeVisible()
    
    // Check that the transaction appears in the history
    await expect(page.getByText(/0x1234...cdef/)).toBeVisible()
  })
})
```

## Installation

### 1. Install Required Dependencies

```bash
# Core blockchain dependencies
npm install @erc7824/nitrolite ethers@^5.7.2 @web3modal/ethereum @web3modal/react wagmi viem

# TypeScript types and additional utilities
npm install --save-dev @types/node @types/react @types/react-dom @types/ethers

# Polyfills for Node.js modules in the browser
npm install --save-dev crypto-browserify stream-browserify stream-http https-browserify os-browserify buffer
```

### 2. Update TypeScript Configuration

Ensure your `tsconfig.json` includes these compiler options:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 2. Update .env.local

Add these variables to your `.env.local` file:

```env
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# NitroLite
NEXT_PUBLIC_NITROLITE_WS_URL=your_nitrolite_websocket_url

# Blockchain Network (1 for mainnet, 11155111 for Sepolia)
NEXT_PUBLIC_CHAIN_ID=11155111

# Contract Addresses (update these with your deployed contracts)
NEXT_PUBLIC_PAYMENT_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
```

### 3. Configure Next.js

Update `next.config.js` to support Web3 libraries:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
    };
    return config;
  },
  // ... rest of your config
};

module.exports = nextConfig;
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

## Implementation Guide

### 1. Set Up Web3 Providers

#### 1.1 Create the Web3 Provider

Create a new file at `app/providers.tsx` to handle Web3 and NitroLite providers:

```tsx
'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { NitroliteProvider } from '@/lib/nitrolite-provider'
import { ReactNode, useEffect, useState } from 'react'

// 1. Get projectId at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// 2. Configure chains
const chains = [sepolia, mainnet]
const defaultChain = process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? mainnet : sepolia

// 3. Create wagmiConfig
const wagmiConfig = defaultWagmiConfig({ 
  chains,
  projectId,
  appName: 'Budget Buddy',
  defaultChain
})

// 4. Create Web3Modal
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#3b82f6',
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, sans-serif',
  },
  // Add custom tokens if needed
  tokens: {
    1: {
      address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '',
      symbol: 'BUDGET',
      decimals: 18,
      image: 'https://your-app-url.com/images/token-logo.png'
    },
    11155111: {
      address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '',
      symbol: 'BUDGET',
      decimals: 18,
      image: 'https://your-app-url.com/images/token-logo.png'
    }
  }
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <WagmiConfig config={wagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )
}
```

#### 1.2 Update Root Layout

Update your root layout (`app/layout.tsx`) to include the Web3Provider:

```tsx
import { Web3Provider } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
```
```

### 2. Create the NitroLite Provider

Create a new file at `lib/nitrolite-provider.tsx` to manage the NitroLite instance and provide it to your application:

```tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Nitrolite } from '@erc7824/nitrolite'
import { useAccount, useNetwork } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'

type NitroliteContextType = {
  nitrolite: Nitrolite | null
  isInitialized: boolean
  initialize: () => Promise<void>
  isConnected: boolean
  chainId: number
  address: `0x${string}` | undefined
}

const NitroliteContext = createContext<NitroliteContextType>({
  nitrolite: null,
  isInitialized: false,
  initialize: async () => {},
  isConnected: false,
  chainId: 11155111, // Default to Sepolia
  address: undefined
})

export function NitroliteProvider({ children }: { children: React.ReactNode }) {
  const [nitrolite, setNitrolite] = useState<Nitrolite | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { toast } = useToast()
  const chainId = chain?.id || parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')

  const initialize = useCallback(async () => {
    if (!address || !isConnected) {
      console.warn('Wallet not connected')
      return
    }

    try {
      const nl = new Nitrolite({
        wsUrl: process.env.NEXT_PUBLIC_NITROLITE_WS_URL!,
        chainId,
        signer: address,
        debug: process.env.NODE_ENV === 'development'
      })

      await nl.init()
      setNitrolite(nl)
      setIsInitialized(true)

      toast({
        title: 'Wallet Connected',
        description: 'You can now make blockchain transactions',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to initialize NitroLite:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to blockchain',
        variant: 'destructive'
      })
    }
  }, [address, isConnected, chainId, toast])

  // Initialize NitroLite when wallet connects or chain changes
  useEffect(() => {
    if (address && isConnected) {
      initialize()
    }

    // Cleanup on unmount
    return () => {
      if (nitrolite) {
        nitrolite.disconnect()
      }
    }
  }, [address, isConnected, chainId, initialize, nitrolite])

  return (
    <NitroliteContext.Provider value={{
      nitrolite,
      isInitialized,
      initialize,
      isConnected,
      chainId,
      address
    }}>
      {children}
    </NitroliteContext.Provider>
  )
}

export const useNitrolite = () => {
  const context = useContext(NitroliteContext)
  if (context === undefined) {
    throw new Error('useNitrolite must be used within a NitroliteProvider')
  }
  return context
}
```
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

Create a new file at `lib/nitrolite-provider.tsx` to manage the NitroLite instance:

```tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Nitrolite } from '@erc7824/nitrolite'
import { useAccount, useNetwork } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'

type NitroliteContextType = {
  nitrolite: Nitrolite | null
  isInitialized: boolean
  initialize: () => Promise<void>
  isConnected: boolean
  chainId: number
}

const NitroliteContext = createContext<NitroliteContextType>({
  nitrolite: null,
  isInitialized: false,
  initialize: async () => {},
  isConnected: false,
  chainId: 11155111 // Default to Sepolia
})

export function NitroliteProvider({ children }: { children: React.ReactNode }) {
  const [nitrolite, setNitrolite] = useState<Nitrolite | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { toast } = useToast()
  const chainId = chain?.id || parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')

  const initialize = useCallback(async () => {
    if (!address || !isConnected) {
      console.warn('Wallet not connected')
      return
    }

    try {
      const nl = new Nitrolite({
        wsUrl: process.env.NEXT_PUBLIC_NITROLITE_WS_URL!,
        chainId,
        signer: address,
        debug: process.env.NODE_ENV === 'development'
      })
      
      await nl.init()
      setNitrolite(nl)
      setIsInitialized(true)
      
      toast({
        title: 'Wallet Connected',
        description: 'You can now make blockchain transactions',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to initialize NitroLite:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to blockchain',
        variant: 'destructive'
      })
    }
  }, [address, isConnected, chainId, toast])

  // Initialize on mount and when address/chain changes
  useEffect(() => {
    if (address && isConnected) {
      initialize()
    }
    
    return () => {
      if (nitrolite) {
        nitrolite.disconnect()
      }
    }
  }, [address, isConnected, chainId, initialize, nitrolite])

  return (
    <NitroliteContext.Provider value={{ 
      nitrolite, 
      isInitialized, 
      initialize,
      isConnected,
      chainId
    }}>
      {children}
    </NitroliteContext.Provider>
  )
}

export const useNitrolite = () => {
  const context = useContext(NitroliteContext)
  if (context === undefined) {
    throw new Error('useNitrolite must be used within a NitroliteProvider')
  }
  return context
}
```

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

Update `app/layout.tsx` to include the Web3 provider:

```tsx
import { Web3Provider } from './providers'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Web3Provider>
          {children}
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  )
}
```

### 4. Create Blockchain Transaction Hook

Create a new file at `lib/hooks/use-blockchain-transaction.ts` to handle blockchain transactions:

```tsx
'use client'

import { useState } from 'react'
import { useNitrolite } from '@/lib/nitrolite-provider'
import { useToast } from '@/components/ui/use-toast'

interface TransactionOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useBlockchainTransaction() {
  const { nitrolite, isInitialized, isConnected } = useNitrolite()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const executeTransaction = async (
    to: string,
    data: string,
    value: string = '0',
    options: TransactionOptions = {}
  ) => {
    if (!isInitialized || !nitrolite || !isConnected) {
      const err = new Error('Blockchain not connected')
      options.onError?.(err)
      setError(err)
      throw err
    }

    setIsLoading(true)
    setError(null)

    try {
      const tx = await nitrolite.sendTransaction({
        to,
        data,
        value
      })

      toast({
        title: 'Transaction Sent',
        description: 'Your transaction has been submitted to the blockchain',
        variant: 'default'
      })

      options.onSuccess?.(tx)
      return tx
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed')
      console.error('Transaction error:', error)
      
      toast({
        title: 'Transaction Failed',
        description: options.errorMessage || error.message,
        variant: 'destructive'
      })
      
      options.onError?.(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    executeTransaction,
    isLoading,
    error,
    isConnected,
    isInitialized
  }
}
```

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

## Integration with Budget Buddy Components

### 1. Blockchain-Enabled Transaction Form

Create a new component at `components/transactions/blockchain-transaction-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import { Loader2 } from 'lucide-react'

export function BlockchainTransactionForm() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  
  const { executeTransaction, isLoading, isConnected } = useBlockchainTransaction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert amount to wei (18 decimals)
      const amountInWei = (parseFloat(amount) * 1e18).toString()
      
      // Execute the transaction
      await executeTransaction(
        recipient, // to address
        '0x', // data (empty for simple ETH transfers)
        amountInWei, // value in wei
        {
          successMessage: `Successfully sent ${amount} ETH`,
          errorMessage: 'Failed to send transaction'
        }
      )
      
      // Reset form on success
      setAmount('')
      setRecipient('')
      setMemo('')
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-4">Connect Wallet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your wallet to make blockchain transactions
        </p>
        <w3m-connect-button />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-medium mb-4">Send Crypto</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Transfer funds on the blockchain using NitroLite for gasless transactions
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.000000000000000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Input
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="What's this for?"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Send Transaction'
          )}
        </Button>
      </div>
    </form>
  )
}
```

### 2. Update Transaction Table

Enhance the existing `transaction-table.tsx` to show blockchain transaction status:

```tsx
// Add to your imports
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

// Add to your Transaction type
interface Transaction {
  id: string;
  // ... existing fields
  blockchain_tx_hash?: string;
  blockchain_status?: 'pending' | 'confirmed' | 'failed';
}

// Add this component inside your TransactionTable
const BlockchainStatus = ({ status }: { status?: string }) => {
  if (!status) return null
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">
          {status === 'confirmed' && (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
          )}
          {status === 'pending' && (
            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
          )}
          {status === 'failed' && (
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className="text-xs text-muted-foreground capitalize">
            {status}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Blockchain Status: {status}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Add this to your table row where you display transaction details
<TableCell className="text-right">
  <div className="flex items-center justify-end space-x-2">
    <Currency value={transaction.amount} type={transaction.type} />
    {transaction.blockchain_tx_hash && (
      <BlockchainStatus status={transaction.blockchain_status} />
    )}
  </div>
</TableCell>
```

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

## Database Integration

### 1. Update Database Schema

Add blockchain-related fields to your transactions table:

```sql
-- Run this SQL in your Supabase SQL editor
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT,
ADD COLUMN IF NOT EXISTS blockchain_network TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_tx_hash ON transactions(blockchain_tx_hash);
```

### 2. Create a Server Action for Transaction Sync

Create a new file at `app/actions/blockchain.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function syncBlockchainTransaction(
  transactionId: string,
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed'
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update({
      blockchain_tx_hash: txHash,
      blockchain_status: status,
      blockchain_network: process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? 'ethereum' : 'sepolia'
    })
    .eq('id', transactionId)
    .select()
    .single()
    
  if (error) {
    console.error('Failed to update transaction:', error)
    throw error
  }
  
  // Revalidate the transactions page
  revalidatePath('/dashboard/transactions')
  
  return data
}
```

## Troubleshooting

### Common Issues

### Common Issues

1. **Connection Issues**
   - **Symptom**: "Failed to connect to blockchain" error
   - **Solution**: 
     - Verify `NEXT_PUBLIC_NITROLITE_WS_URL` is correct
     - Check if your network allows WebSocket connections (ports 80/443)
     - Try disconnecting and reconnecting your wallet

2. **Transaction Failures**
   - **Symptom**: Transactions fail with "insufficient funds"
   - **Solution**:
     - Ensure your NitroLite relayer has sufficient funds
     - Check if the contract address is correct
     - Verify the chain ID matches your NitroLite node

3. **Wallet Connection Problems**
   - **Symptom**: Wallet connects but transactions don't work
   - **Solution**:
     - Check if the wallet is on the correct network (Sepolia/Mainnet)
     - Verify the WalletConnect project ID is set correctly
     - Try clearing your browser cache and reconnecting

4. **Database Sync Issues**
   - **Symptom**: Transactions succeed but don't appear in the database
   - **Solution**:
     - Check Supabase RLS (Row Level Security) policies
     - Verify the service role key has write permissions
     - Check the server logs for errors

5. **Performance Problems**
   - **Symptom**: UI freezes during transactions
   - **Solution**:
     - Optimize transaction callbacks
     - Use `React.memo` for expensive components
     - Implement proper loading states

## Security Considerations

### 1. Private Keys & Authentication
- **Never** store private keys in client-side code or environment variables
- Use Supabase Auth for user authentication and session management
- Implement appropriate Row Level Security (RLS) policies in Supabase

### 2. Rate Limiting & Abuse Prevention
- Implement rate limiting on your API routes
- Set appropriate gas limits for transactions
- Monitor for suspicious activity patterns

### 3. Data Validation
- Validate all user inputs on both client and server
- Use TypeScript types for type safety
- Sanitize data before storing in the database

### 4. Session Security
- Use short-lived JWT tokens
- Implement proper session invalidation on logout
- Store sensitive data in HTTP-only cookies

### 5. Smart Contract Security
- Audit all smart contracts before deployment
- Use OpenZeppelin's battle-tested contracts when possible
- Implement proper access control mechanisms

## API Reference

### NitroLite Class

```typescript
class Nitrolite {
  constructor(options: {
    wsUrl: string;            // WebSocket URL for NitroLite node
    chainId: number;          // Chain ID (1 for Mainnet, 11155111 for Sepolia)
    signer: string | Signer;  // User's wallet address or signer
    relayerUrl?: string;      // Optional custom relayer URL
    debug?: boolean;          // Enable debug logging
  });

  // Initialize the connection
  init(): Promise<void>;
  
  // Send a transaction
  sendTransaction(tx: {
    to: string;              // Recipient address
    data?: string;           // Transaction data (ABI-encoded)
    value?: string;          // Amount in wei (as string)
    gasLimit?: string;       // Optional gas limit
    gasPrice?: string;       // Optional gas price
  }): Promise<{
    hash: string;            // Transaction hash
    wait: () => Promise<TransactionReceipt>;
  }>;
  
  // Disconnect from the WebSocket
  disconnect(): void;
  
  // Event listeners
  on(event: 'connected' | 'disconnected' | 'error', callback: (data?: any) => void): void;
  off(event: string, callback: (data?: any) => void): void;
}
```

### React Hooks

#### useNitrolite()

```typescript
const { 
  // Nitrolite instance (null if not initialized)
  nitrolite: Nitrolite | null,
  
  // Boolean indicating if Nitrolite is ready
  isInitialized: boolean,
  
  // Error object if initialization failed
  error: Error | null,
  
  // Re-initialize the connection
  initialize: () => Promise<void>,
  
  // Wallet connection status
  isConnected: boolean,
  
  // Current chain ID
  chainId: number
} = useNitrolite();
```

#### useBlockchainTransaction()

```typescript
const {
  // Execute a blockchain transaction
  executeTransaction: (
    to: string,
    data: string,
    value?: string,
    options?: {
      onSuccess?: (data: any) => void,
      onError?: (error: Error) => void,
      successMessage?: string,
      errorMessage?: string
    }
  ) => Promise<any>,
  
  // Loading state
  isLoading: boolean,
  
  // Last error
  error: Error | null,
  
  // Wallet connection status
  isConnected: boolean,
  
  // Nitrolite initialization status
  isInitialized: boolean
} = useBlockchainTransaction();
```

## Testing

### 1. Unit Tests

Create test files for your hooks and components:

```bash
mkdir -p __tests__/hooks __tests__/components
```

Example test for `useBlockchainTransaction`:

```typescript
// __tests__/hooks/useBlockchainTransaction.test.tsx
import { renderHook, act } from '@testing-library/react-hooks'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import { NitroliteProvider } from '@/lib/nitrolite-provider'

describe('useBlockchainTransaction', () => {
  it('should initialize with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NitroliteProvider>{children}</NitroliteProvider>
    )
    
    const { result } = renderHook(() => useBlockchainTransaction(), { wrapper })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.executeTransaction).toBe('function')
  })
  
  // Add more test cases...
})
```

### 2. Integration Tests

Test the complete flow with a test blockchain:

```typescript
// __tests__/integration/blockchain.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockchainTransactionForm } from '@/components/transactions/blockchain-transaction-form'

describe('BlockchainTransactionForm', () => {
  it('should submit a transaction', async () => {
    render(<BlockchainTransactionForm />)
    
    // Fill in the form
    await userEvent.type(
      screen.getByLabelText('Recipient Address'),
      '0x1234567890123456789012345678901234567890'
    )
    
    await userEvent.type(
      screen.getByLabelText('Amount (ETH)'),
      '0.1'
    )
    
    // Submit the form
    await userEvent.click(screen.getByText('Send Transaction'))
    
    // Verify the loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Transaction Sent')).toBeInTheDocument()
    })
  })
})
```

## Frequently Asked Questions

### Q: How does NitroLite handle gas fees?
A: NitroLite uses a meta-transaction relayer to pay for gas on behalf of users. You can either:
- Use the shared relayer (for testing)
- Set up your own relayer (for production)
- Implement a gas tank system where users pay in your app's token

### Q: Is NitroLite compatible with all EVM chains?
A: Yes, NitroLite works with any EVM-compatible chain. The Budget Buddy integration is configured for:
- Sepolia (testnet)
- Ethereum Mainnet
- You can add support for additional chains by updating the configuration

### Q: How do I handle failed transactions?
A: Failed transactions are automatically caught and displayed to the user. You can also implement custom error handling:

```typescript
try {
  await executeTransaction(to, data, value, {
    onError: (error) => {
      // Custom error handling
      if (error.message.includes('insufficient funds')) {
        alert('Insufficient funds in your wallet')
      } else if (error.message.includes('user rejected')) {
        // User rejected the transaction
      }
    }
  })
} catch (error) {
  // Handle any uncaught errors
  console.error('Transaction failed:', error)
}
```

### Q: How do I test blockchain features locally?
A: You can use one of these options:
1. **Local Hardhat Node**:
   ```bash
   npx hardhat node
   ```
   Then connect to `http://localhost:8545`

2. **Forked Mainnet**:
   ```bash
   npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
   ```

3. **Testnet Faucets**:
   - Sepolia: https://sepoliafaucet.com/
   - Get test ETH for development

### Q: How do I monitor transactions?
A: You can monitor transactions using:
1. **Block Explorers**:
   - Ethereum Mainnet: https://etherscan.io/
   - Sepolia: https://sepolia.etherscan.io/

2. **Custom Dashboard**:
   - Track transactions in your database
   - Set up alerts for failed transactions
   - Monitor gas prices and network congestion

3. **Analytics**:
   - Track transaction success/failure rates
   - Monitor average gas costs
   - Identify common failure patterns

### Q: How do I handle chain changes?
A: The integration automatically handles chain changes, but you can also listen for chain changes:

```typescript
import { useNetwork } from 'wagmi'

function MyComponent() {
  const { chain } = useNetwork()
  
  useEffect(() => {
    if (chain) {
      console.log('Connected to chain:', chain.name)
      
      // You can prompt the user to switch chains if needed
      if (chain.id !== 11155111) { // Sepolia
        // Show a message or automatically switch
      }
    }
  }, [chain])
  
  // ... rest of your component
}
```

## Support & Resources

### Documentation
- [NitroLite Documentation](https://docs.nitrolite.xyz)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethers.js Documentation](https://docs.ethers.org/v5/)
- [Supabase Documentation](https://supabase.com/docs)

### Community & Support
- [GitHub Issues](https://github.com/erc7824/nitrolite-example/issues) - Report bugs and request features
- [Discord](https://discord.gg/nitrolite) - Join our community for help
- [Email Support](mailto:support@nitrolite.xyz) - For critical issues

### Additional Resources
- [Ethereum Developer Tools](https://ethereum.org/en/developers/docs/)
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal/about)

## Contributing

We welcome contributions to the Budget Buddy integration! Here's how you can help:

1. **Report Bugs**
   - Check existing issues before creating a new one
   - Provide detailed reproduction steps
   - Include browser/device information

2. **Suggest Enhancements**
   - Open an issue to discuss your idea
   - Follow the existing code style
   - Add tests for new features

3. **Pull Requests**
   - Fork the repository
   - Create a feature branch
   - Submit a pull request with a clear description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NitroLite](https://github.com/erc7824/nitrolite) for the gasless transaction infrastructure
- [Wagmi](https://wagmi.sh/) for the React hooks
- [Supabase](https://supabase.com/) for the backend services
- [Shadcn UI](https://ui.shadcn.com/) for the component library
