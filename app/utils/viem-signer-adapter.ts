import type {WalletClient} from "viem"
import {BrowserProvider, Eip1193Provider} from "ethers"

/**
 * Creates an EIP-1193 compatible provider from a viem WalletClient
 * This allows viem wallets to work with Ethers.js BrowserProvider
 */
function createEip1193Provider(walletClient: WalletClient): Eip1193Provider {
  return {
    request: async ({method, params}: {method: string; params?: unknown[]}) => {
      console.log("[EIP-1193] Method called:", method, "with params:", params)

      if (method === "eth_requestAccounts" || method === "eth_accounts") {
        const accounts = walletClient.account
          ? [walletClient.account.address]
          : []
        console.log("[EIP-1193] Returning accounts:", accounts)
        return accounts
      }

      if (method === "eth_chainId") {
        const chainId = `0x${walletClient.chain?.id.toString(16)}`
        console.log("[EIP-1193] Returning chainId:", chainId)
        return chainId
      }

      if (method === "eth_signTypedData_v4") {
        const [, typedDataJson] = params as [string, string]
        const typedData = JSON.parse(typedDataJson)
        const {domain, types, message} = typedData

        // Remove EIP712Domain from types as viem adds it automatically
        const typesWithoutDomain = {...types}
        delete typesWithoutDomain.EIP712Domain

        const signature = await walletClient.signTypedData({
          account: walletClient.account!,
          domain,
          types: typesWithoutDomain,
          primaryType: Object.keys(typesWithoutDomain)[0] || "",
          message,
        })

        console.log("[EIP-1193] Signed typed data successfully")
        return signature
      }

      if (method === "personal_sign") {
        const [message] = params as [string]
        console.log("[EIP-1193] Signing message:", message)
        const signature = await walletClient.signMessage({
          account: walletClient.account!,
          message,
        })
        console.log("[EIP-1193] Message signed successfully")
        return signature
      }

      if (method === "eth_sendTransaction") {
        const [transaction] = params as [Record<string, unknown>]

        // Build transaction params based on fee market type
        const txParams: Record<string, unknown> = {
          account: walletClient.account!,
          to: transaction.to as `0x${string}`,
          value: transaction.value
            ? BigInt(transaction.value as string)
            : undefined,
          data: transaction.data as `0x${string}` | undefined,
          gas: transaction.gas ? BigInt(transaction.gas as string) : undefined,
          nonce: transaction.nonce as number | undefined,
          chain: walletClient.chain,
        }

        // Only include EIP-1559 fees OR legacy gasPrice, not both
        if (transaction.maxFeePerGas || transaction.maxPriorityFeePerGas) {
          txParams.maxFeePerGas = transaction.maxFeePerGas
            ? BigInt(transaction.maxFeePerGas as string)
            : undefined
          txParams.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas
            ? BigInt(transaction.maxPriorityFeePerGas as string)
            : undefined
        } else if (transaction.gasPrice) {
          txParams.gasPrice = BigInt(transaction.gasPrice as string)
        }

        const hash = await walletClient.sendTransaction(txParams as never)
        console.log("[EIP-1193] Transaction sent, hash:", hash)
        return hash
      }

      // Fallback to transport for other methods
      if (walletClient.transport && "request" in walletClient.transport) {
        console.log("[EIP-1193] Forwarding to transport:", method)
        return (
          walletClient.transport as {
            request: (args: {
              method: string
              params?: unknown[]
            }) => Promise<unknown>
          }
        ).request({method, params})
      }

      console.error("[EIP-1193] Unsupported method:", method)
      throw new Error(`Unsupported method: ${method}`)
    },
  }
}

/**
 * Creates an EIP-1193 provider from a viem WalletClient
 * This allows Dynamic's viem-based wallet to work with Ethers BrowserProvider
 */
export function createEip1193ProviderFromWallet(
  walletClient: WalletClient
): Eip1193Provider {
  if (!walletClient.account) {
    throw new Error("Wallet not connected")
  }
  return createEip1193Provider(walletClient)
}

/**
 * Creates an Ethers.js Signer from a viem WalletClient
 * This allows Dynamic's viem-based wallet to work with Halliday's Ethers-based SDK
 */
export async function createEthersSigner(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error("Wallet not connected")
  }

  // Create EIP-1193 provider from viem wallet client
  const eip1193Provider = createEip1193Provider(walletClient)

  // Wrap in Ethers BrowserProvider
  const provider = new BrowserProvider(eip1193Provider)

  // Get signer from provider
  const signer = await provider.getSigner(walletClient.account.address)

  return signer
}
