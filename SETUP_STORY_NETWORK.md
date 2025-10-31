# Setting Up Story Aeneid Network with Dynamic

To resolve the chain configuration warnings and ensure Dynamic properly recognizes the Story Aeneid testnet, follow these steps:

## 1. Add Story Aeneid to Dynamic Dashboard

1. **Go to your Dynamic Dashboard**: https://app.dynamic.xyz/dashboard
2. **Navigate to**: Configurations → Networks → EVM Networks
3. **Click**: "Add Custom Network"
4. **Fill in the following details**:

```
Network Name: Story Protocol Testnet
Chain ID: 1315
Symbol: IP
RPC URL: https://aeneid.storyrpc.io
Block Explorer: https://odyssey.storyscan.xyz
```

5. **Save** the network configuration

## 2. Enable the Network

1. In the Dynamic Dashboard, find "Story Protocol Testnet" in your networks list
2. **Toggle it ON** to enable it for your application
3. This will make the network available in Dynamic's wallet connection flow

## 3. Verify the Setup

After adding the network:

1. **Refresh your application**
2. **Connect your wallet** using Dynamic
3. **Check the console** - the chain mismatch warnings should be gone
4. **Verify in console**:
   ```
   walletClient: true
   walletClientChain: 1315
   ```

## Story Aeneid Network Details

- **Network Name**: Story Protocol Testnet (Aeneid)
- **Chain ID**: 1315
- **Currency Symbol**: IP
- **RPC URL**: https://aeneid.storyrpc.io/
- **Block Explorer**: https://odyssey.storyscan.xyz/
- **Testnet Faucet**: https://faucet.story.foundation/

## Troubleshooting

### If walletClient is still `false`:

1. **Make sure your wallet is connected to the Story network**

   - Open your wallet extension
   - Switch to "Story Protocol Testnet"
   - If not available, add it manually using the details above

2. **Refresh the page** after switching networks

3. **Check console logs** for detailed wallet state:
   ```
   Wallet state: {
     primaryWallet: "0x...",
     walletClient: true,
     walletClientChain: 1315,
     eip1193Provider: true
   }
   ```

### Adding Story Network to MetaMask Manually

If your wallet doesn't have Story Protocol Testnet:

1. Open MetaMask
2. Click Networks → Add Network → Add a network manually
3. Enter the details above
4. Click "Save"
5. Switch to the Story Protocol Testnet
6. Refresh your application

## Alternative: Mainnet Story (When Available)

If using Story Mainnet instead of testnet:

```typescript
// In Web3Providers.tsx, update to use mainnet
import {story} from "@story-protocol/core-sdk"

const config = createConfig({
  chains: [story], // Instead of aeneid
  transports: {
    [story.id]: http(),
  },
})
```

Then add Story Mainnet to Dynamic Dashboard with mainnet RPC details.
