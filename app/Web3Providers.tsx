"use client"
import {createConfig, WagmiProvider} from "wagmi"
import {http} from "viem"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {DynamicContextProvider} from "@dynamic-labs/sdk-react-core"
import {DynamicWagmiConnector} from "@dynamic-labs/wagmi-connector"
import {EthereumWalletConnectors} from "@dynamic-labs/ethereum"
import {PropsWithChildren} from "react"
import {mainnet} from "@story-protocol/core-sdk"

// Configure Wagmi with Story Aeneid testnet
const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
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
              blockExplorerUrls: ["https://storyscan.xyz/"],
              chainId: mainnet.id,
              chainName: mainnet.name,
              iconUrls: ["https://story.foundation/favicon.ico"],
              name: "Story Protocol Mainnet",
              nativeCurrency: {
                name: mainnet.nativeCurrency.name,
                symbol: mainnet.nativeCurrency.symbol,
                decimals: mainnet.nativeCurrency.decimals,
              },
              networkId: mainnet.id,
              rpcUrls: [...mainnet.rpcUrls.default.http],
              vanityName: "Story Protocol Mainnet",
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
