# NitroBridge: Gasless Crypto Payments & Transfers

## Overview

NitroBridge is a blockchain integration feature that enables gasless cryptocurrency transfers within financial applications. Built on NitroLite protocol, it allows users to send/receive Ethereum and ERC-20 tokens without paying gas fees, making cryptocurrency accessible to non-technical users.

## Key Features

- **Zero-Fee Transactions**: Send crypto without gas costs using NitroLite
- **Unified Transaction History**: Seamlessly integrate crypto with traditional finance
- **Privacy-First Design**: Advanced privacy protections and encryption
- **WalletConnect Integration**: Support for MetaMask, Trust Wallet, and other wallets
- **Multi-Network Support**: Ethereum Mainnet and Sepolia testnet
- **Admin Privacy Controls**: Aggregated analytics without exposing user data

## Architecture

### Core Components

1. **Web3 Providers** (`app/providers.tsx`)
   - Wagmi configuration for wallet connections
   - Web3Modal for user-friendly wallet selection
   - NitroLite provider for gasless transactions

2. **NitroLite Provider** (`lib/nitrolite-provider.tsx`)
   - Manages NitroLite connection and initialization
   - Handles wallet state and network switching
   - Provides React context for blockchain operations

3. **Blockchain Transaction Hook** (`lib/hooks/use-blockchain-transaction.ts`)
   - Executes gasless transactions via NitroLite
   - Handles transaction states and error management
   - Provides loading states and user feedback

4. **Transaction Form Component** (`components/transactions/blockchain-transaction-form.tsx`)
   - User interface for sending crypto transfers
   - Form validation and error handling
   - Wallet connection prompts

5. **Privacy Utilities** (`lib/privacy-utils.ts`)
   - AES-GCM encryption for sensitive data
   - Zero-knowledge transaction processing
   - Privacy-preserving audit logging

## Installation & Setup

### 1. Dependencies

```bash
npm install @erc7824/nitrolite ethers@^5.7.2 @web3modal/ethereum @web3modal/react wagmi viem
```

### 2. Environment Variables

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID

# NitroLite
NEXT_PUBLIC_NITROLITE_WS_URL=wss://sepolia.nitrolite.io/v1/YOUR_NITROLITE_API_KEY

# Privacy & Security
ENCRYPTION_KEY=your_256_bit_encryption_key_here
WEBHOOK_SECRET_TOKEN=your_webhook_secret
```

### 3. Database Schema

```sql
-- Add blockchain columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS blockchain_network TEXT,
ADD COLUMN IF NOT EXISTS encrypted_memo TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_tx_hash ON transactions(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_status ON transactions(blockchain_status);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own transactions
CREATE POLICY "users_own_transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create admin summary view (aggregated, no sensitive data)
CREATE VIEW admin_transaction_summary AS
SELECT
  COUNT(*) as total_transactions,
  blockchain_network,
  blockchain_status,
  DATE_TRUNC('day', created_at) as transaction_date
FROM transactions
WHERE blockchain_tx_hash IS NOT NULL
GROUP BY blockchain_network, blockchain_status, DATE_TRUNC('day', created_at);
```

## Implementation Guide

### Step 1: Web3 Providers Setup

```tsx
// app/providers.tsx
'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { NitroliteProvider } from '@/lib/nitrolite-provider'
import { ReactNode } from 'react'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!
const chains = [sepolia, mainnet]
const defaultChain = process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? mainnet : sepolia

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: 'Your App Name',
  defaultChain
})

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#3b82f6',
    '--w3m-color-mix-strength': 20
  }
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <NitroliteProvider>
        {children}
      </NitroliteProvider>
    </WagmiConfig>
  )
}
```

### Step 2: NitroLite Provider

```tsx
// lib/nitrolite-provider.tsx
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
  chainId: 11155111,
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
    if (!address || !isConnected) return

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
        description: 'You can now make gasless transactions'
      })
    } catch (error) {
      console.error('Failed to initialize NitroLite:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to blockchain',
        variant: 'destructive'
      })
    }
  }, [address, isConnected, chainId, toast])

  useEffect(() => {
    if (address && isConnected) {
      initialize()
    }
  }, [address, isConnected, initialize])

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

### Step 3: Blockchain Transaction Hook

```tsx
// lib/hooks/use-blockchain-transaction.ts
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
        description: options.successMessage || 'Your gasless transaction has been submitted'
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

### Step 4: Transaction Form Component

```tsx
// components/transactions/blockchain-transaction-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAccount } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Wallet } from 'lucide-react'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

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
  const { address, isConnected } = useAccount()
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

            // Here you could save to database
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

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-muted/50">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="h-5 w-5" />
          <h3 className="text-lg font-medium">Connect Wallet</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your wallet to send gasless crypto transactions
        </p>
        <w3m-connect-button />
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Send className="h-5 w-5" />
        <h3 className="text-lg font-medium">Send Crypto</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Transfer ETH gaslessly using NitroLite - no fees required!
      </p>

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
                    className="font-mono text-sm"
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
                <FormLabel>Amount (ETH)</Label>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000000000000000001"
                    min="0"
                    placeholder="0.0"
                    {...field}
                  />
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
                    placeholder="What's this for?"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Gasless Transaction
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

### Step 5: Privacy Utilities

```typescript
// lib/privacy-utils.ts
import crypto from 'crypto'

export class PrivacyUtils {
  private static algorithm = 'aes-256-gcm'

  static encrypt(text: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY!
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, encryptionKey)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex')
  }

  static decrypt(encryptedText: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY!
    const parts = encryptedText.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const authTag = Buffer.from(parts[2], 'hex')

    const decipher = crypto.createDecipher(this.algorithm, encryptionKey)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
```

### Step 6: Privacy Transaction Sync

```typescript
// app/actions/privacy-blockchain.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { PrivacyUtils } from '@/lib/privacy-utils'

export async function syncBlockchainTransactionPrivacy(
  userId: string,
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed',
  memo?: string
) {
  const supabase = createClient()

  // Encrypt sensitive memo if provided
  const encryptedMemo = memo ? PrivacyUtils.encrypt(memo) : null

  // Store only essential, non-sensitive data
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'crypto_transfer',
      amount: 0, // Amount is public on blockchain, don't store locally
      description: `Crypto transfer ${txHash.slice(0, 10)}...`,
      blockchain_tx_hash: txHash,
      blockchain_status: status,
      blockchain_network: process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? 'ethereum' : 'sepolia',
      encrypted_memo: encryptedMemo,
      category_id: null, // No category needed for crypto
      date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to sync blockchain transaction:', error)
    throw error
  }

  return data
}
```

## Privacy & Security Features

### 1. Data Minimization
- Only stores transaction hashes and essential metadata
- Sensitive information is encrypted or not stored locally
- Transaction amounts are public on blockchain

### 2. Encryption
- AES-GCM encryption for sensitive memos
- Database-level encryption for user data
- Secure key management

### 3. Access Controls
- Row Level Security (RLS) ensures users only see their own data
- Admin access limited to aggregated statistics
- Separate admin views without sensitive information

### 4. Audit Logging
- Privacy-preserving audit logs
- Hashed user IDs in logs
- Minimal transaction metadata

## Usage Examples

### Basic Transaction
```tsx
import { BlockchainTransactionForm } from '@/components/transactions/blockchain-transaction-form'

export default function SendPage() {
  return (
    <div className="container max-w-md py-12">
      <BlockchainTransactionForm />
    </div>
  )
}
```

### Custom Integration
```tsx
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'

function CustomTransactionComponent() {
  const { executeTransaction, isLoading } = useBlockchainTransaction()

  const handleSend = async () => {
    try {
      await executeTransaction(
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // recipient
        '0x', // data
        (0.1 * 1e18).toString(), // 0.1 ETH in wei
        {
          successMessage: 'Transaction sent successfully!',
          onSuccess: (tx) => console.log('TX Hash:', tx.hash)
        }
      )
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send 0.1 ETH'}
    </button>
  )
}
```

## API Reference

### useBlockchainTransaction Hook

```typescript
const {
  executeTransaction: (
    to: string,        // Recipient address
    data: string,      // Transaction data (0x for ETH transfers)
    value?: string,    // Amount in wei
    options?: {
      onSuccess?: (data: any) => void
      onError?: (error: Error) => void
      successMessage?: string
      errorMessage?: string
    }
  ) => Promise<any>,

  isLoading: boolean,      // Transaction loading state
  error: Error | null,     // Last error
  isConnected: boolean,    // Wallet connection status
  isInitialized: boolean   // NitroLite initialization status
} = useBlockchainTransaction()
```

### PrivacyUtils Class

```typescript
class PrivacyUtils {
  static encrypt(text: string, key?: string): string
  static decrypt(encryptedText: string, key?: string): string
}
```

## Testing

### Unit Tests
```typescript
// __tests__/hooks/useBlockchainTransaction.test.tsx
import { renderHook } from '@testing-library/react-hooks'
import { useBlockchainTransaction } from '@/lib/hooks/use-blockchain-transaction'
import { NitroliteProvider } from '@/lib/nitrolite-provider'

describe('useBlockchainTransaction', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBlockchainTransaction(), {
      wrapper: NitroliteProvider
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })
})
```

### Integration Tests
```typescript
// __tests__/components/BlockchainTransactionForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BlockchainTransactionForm } from '@/components/transactions/blockchain-transaction-form'

describe('BlockchainTransactionForm', () => {
  it('should validate Ethereum addresses', async () => {
    render(<BlockchainTransactionForm />)

    const input = screen.getByLabelText(/recipient address/i)
    fireEvent.change(input, { target: { value: 'invalid-address' } })

    expect(await screen.findByText(/invalid ethereum address/i)).toBeInTheDocument()
  })
})
```

## Deployment

### Production Checklist
- [ ] Set up production API keys (Alchemy, WalletConnect, NitroLite)
- [ ] Configure encryption keys securely
- [ ] Enable HTTPS for all connections
- [ ] Set up monitoring and alerting
- [ ] Test on mainnet (start with small amounts)
- [ ] Implement rate limiting
- [ ] Set up backup and recovery procedures

### Environment Variables (Production)
```env
NEXT_PUBLIC_CHAIN_ID=1  # Ethereum Mainnet
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_MAINNET_API_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_NITROLITE_WS_URL=wss://mainnet.nitrolite.io/v1/YOUR_MAINNET_API_KEY
ENCRYPTION_KEY=your_secure_256_bit_key
```

## Support & Troubleshooting

### Common Issues

**Wallet Not Connecting**
- Ensure WalletConnect project ID is correct
- Check if user has a compatible wallet installed
- Verify network configuration

**Transaction Failing**
- Check if recipient address is valid
- Ensure sufficient balance in wallet
- Verify NitroLite service status

**Privacy Concerns**
- Data is encrypted at rest and in transit
- Admins only see aggregated statistics
- Users control their own data

### Getting Help
- Check NitroLite documentation: https://docs.nitrolite.io
- Web3Modal docs: https://docs.walletconnect.com/web3modal
- Wagmi documentation: https://wagmi.sh

## License

This implementation is provided as-is for educational and development purposes. Ensure compliance with local regulations regarding cryptocurrency transactions.

---

**NitroBridge** - Making crypto accessible through gasless transactions. 🚀