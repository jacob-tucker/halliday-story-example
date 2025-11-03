# Dynamic Wallet + Halliday Payments Integration Guide

This project integrates Dynamic embedded wallets with Halliday Payments using viem and wagmi.

## Overview

The integration creates a bridge between Dynamic's viem-based wallet and Halliday's payment SDK by implementing a custom signer adapter that translates viem's wallet client methods into the format expected by Halliday.

## Key Components

### 1. Viem Signer Adapter (`app/utils/viem-signer-adapter.ts`)

This utility file creates a Halliday-compatible signer interface from a viem WalletClient. It implements the four required methods:

- **`getAddress()`**: Returns the connected wallet address
- **`signMessage(input)`**: Signs a message with the wallet
- **`sendTransaction(transaction)`**: Sends a transaction through the wallet
- **`signTypedData(input)`**: Signs EIP-712 typed data

The adapter handles the conversion between:

- Halliday's expected input/output formats
- Viem's wallet client methods
- Transaction parameter conversions (hex strings, BigInts, etc.)

### 2. Page Component (`app/page.tsx`)

The main page component:

- Uses Dynamic's `useDynamicContext` hook to access the connected wallet
- Uses wagmi's `useWalletClient` hook to get the viem wallet client
- Creates the signer adapter and passes it to Halliday Payments
- Only opens the Halliday widget once the wallet is connected

### 3. Web3 Providers (`app/Web3Providers.tsx`)

Already configured with:

- Dynamic SDK with Ethereum wallet connectors
- Wagmi with Story Protocol's Aeneid testnet
- React Query for state management

## How It Works

1. **User connects wallet**: Uses the Dynamic widget in the layout
2. **Wallet detection**: Page component detects when wallet is connected via Dynamic context
3. **Adapter creation**: Creates a viem signer adapter that wraps the wallet client
4. **Halliday integration**: Passes the adapter methods to Halliday's `openHallidayPayments`
5. **Seamless signing**: When Halliday needs signatures or transactions, it calls the adapter methods which translate to viem calls

## Usage

1. **Connect your wallet** using the Dynamic widget button
2. **Halliday Payment widget** will automatically open once connected
3. **Make payments** - the widget will use your connected Dynamic wallet for all operations

## Configuration

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_HALLIDAY_PUBLIC_API_KEY=your_halliday_api_key
NEXT_PUBLIC_DYNAMIC_ENV_ID=your_dynamic_environment_id
```

## Customization

To use different tokens or chains:

**Change the output token** in `app/page.tsx`:

```typescript
// For $IP on Story (native token)
outputs: ["story:0x"]

// For $USDC.e on Story
outputs: ["story:0xf1815bd50389c46847f0bda824ec8da914045d14"]
```

**Change the chain** in `app/Web3Providers.tsx`:

```typescript
import {aeneid} from "@story-protocol/core-sdk"

const config = createConfig({
  chains: [aeneid], // Change to your desired chain
  // ...
})
```

## Technical Notes

- The adapter uses closures to maintain reference to the wallet client
- Transaction parameters are converted from hex strings to BigInts for viem
- EIP-712 typed data is parsed from JSON string format for viem's signTypedData
- The integration prevents multiple widget opens with a state flag

## Dependencies

- `@dynamic-labs/sdk-react-core` - Dynamic wallet SDK
- `@dynamic-labs/ethereum` - Ethereum wallet connectors for Dynamic
- `@dynamic-labs/wagmi-connector` - Dynamic + Wagmi integration
- `@halliday-sdk/payments` - Halliday Payments SDK
- `viem` - Ethereum library
- `wagmi` - React hooks for Ethereum
- `@story-protocol/core-sdk` - Story Protocol chain configuration
