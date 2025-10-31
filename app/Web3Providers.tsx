"use client"
import {createConfig, WagmiProvider} from "wagmi"
import {http} from "viem"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {DynamicContextProvider} from "@dynamic-labs/sdk-react-core"
import {DynamicWagmiConnector} from "@dynamic-labs/wagmi-connector"
import {EthereumWalletConnectors} from "@dynamic-labs/ethereum"
import {PropsWithChildren} from "react"
import {aeneid} from "@story-protocol/core-sdk"

// Configure Wagmi with Story Aeneid testnet
const config = createConfig({
  chains: [aeneid],
  multiInjectedProviderDiscovery: false,
  transports: {
    [aeneid.id]: http(),
  },
})

const queryClient = new QueryClient()

export default function Web3Providers({children}: PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID as string,
        walletConnectors: [EthereumWalletConnectors],
        // Override to only show networks from Wagmi config
        overrides: {
          evmNetworks: () => [
            {
              blockExplorerUrls: ["https://aeneid.storyscan.xyz/"],
              chainId: aeneid.id,
              chainName: aeneid.name,
              iconUrls: ["https://story.foundation/favicon.ico"],
              name: "Story Protocol Testnet",
              nativeCurrency: {
                name: aeneid.nativeCurrency.name,
                symbol: aeneid.nativeCurrency.symbol,
                decimals: aeneid.nativeCurrency.decimals,
              },
              networkId: aeneid.id,
              rpcUrls: [...aeneid.rpcUrls.default.http],
              vanityName: "Story Aeneid",
            },
          ],
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}
