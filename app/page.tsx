"use client"
import {openHallidayPayments} from "@halliday-sdk/payments"
import {connectSigner} from "@halliday-sdk/payments/ethers"

import {useState, useEffect, useMemo} from "react"
import {DynamicWidget, useDynamicContext} from "@dynamic-labs/sdk-react-core"
import {useWalletClient, useSwitchChain} from "wagmi"
import {createEip1193ProviderFromWallet} from "./utils/viem-signer-adapter"
import {BrowserProvider} from "ethers"
import {aeneid} from "@story-protocol/core-sdk"

export default function Home() {
  const {primaryWallet} = useDynamicContext()
  const {data: walletClient, isLoading: isWalletClientLoading} =
    useWalletClient()
  const {switchChain} = useSwitchChain()
  const [error, setError] = useState<string | null>(null)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [maskedEthereum, setMaskedEthereum] = useState<unknown>(null)

  // Create a stable EIP-1193 provider from the wallet client
  const eip1193Provider = useMemo(() => {
    if (!walletClient) return null
    try {
      console.log("Creating EIP-1193 provider from walletClient:", {
        address: walletClient.account?.address,
        chain: walletClient.chain,
      })
      return createEip1193ProviderFromWallet(walletClient)
    } catch (error) {
      console.error("Error creating EIP-1193 provider:", error)
      return null
    }
  }, [walletClient])

  useEffect(() => {
    console.log("Wallet state:", {
      primaryWallet: primaryWallet?.address,
      walletClient: !!walletClient,
      walletClientLoading: isWalletClientLoading,
      walletClientChain: walletClient?.chain?.id,
      walletClientAccount: walletClient?.account?.address,
      eip1193Provider: !!eip1193Provider,
    })

    // Wait for wallet to be connected
    if (!primaryWallet || !walletClient) {
      console.log("Waiting for wallet connection...", {
        hasPrimaryWallet: !!primaryWallet,
        hasWalletClient: !!walletClient,
        isLoading: isWalletClientLoading,
      })
      return
    }

    // Check if wallet is on the wrong network and switch to Story Aeneid
    if (
      walletClient.chain?.id !== aeneid.id &&
      switchChain &&
      !isSwitchingNetwork
    ) {
      console.log(
        `Wallet on wrong network (chain ${walletClient.chain?.id}). Switching to Story Aeneid (${aeneid.id})...`
      )
      setIsSwitchingNetwork(true)
      try {
        switchChain(
          {chainId: aeneid.id},
          {
            onSuccess: () => {
              console.log("Successfully switched to Story Aeneid")
              setIsSwitchingNetwork(false)
            },
            onError: error => {
              console.error("Failed to switch network:", error)
              setError(
                `Please manually switch your wallet to Story Protocol Testnet (Chain ID: ${aeneid.id})`
              )
              setIsSwitchingNetwork(false)
            },
          }
        )
      } catch (error) {
        console.error("Error switching network:", error)
        setIsSwitchingNetwork(false)
      }
      return
    }
  }, [
    primaryWallet,
    walletClient,
    eip1193Provider,
    isWalletClientLoading,
    switchChain,
    isSwitchingNetwork,
  ])

  const handlePayWithHalliday = async () => {
    if (!primaryWallet || !walletClient || !eip1193Provider) {
      setError("Please connect your wallet first")
      return
    }

    try {
      const address = primaryWallet.address
      console.log("Opening Halliday popup for address:", address)

      // Mask MetaMask before opening Halliday
      const windowWithEthereum = window as typeof window & {
        ethereum?: unknown
      }
      const originalEthereum = windowWithEthereum.ethereum

      if (
        originalEthereum &&
        typeof originalEthereum === "object" &&
        "isMetaMask" in originalEthereum
      ) {
        console.log("[Halliday] Masking MetaMask provider before opening popup")
        setMaskedEthereum(originalEthereum)
        delete windowWithEthereum.ethereum

        // Wait a bit to ensure the deletion takes effect
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create a stable BrowserProvider that wraps our EIP-1193 provider
      const browserProvider = new BrowserProvider(eip1193Provider)

      // Create the connected signer with a stable reference
      const connectedSigner = connectSigner(async () => {
        console.log("[Halliday] Getting signer for address:", address)
        return browserProvider.getSigner(address)
      })

      await openHallidayPayments({
        apiKey: process.env.NEXT_PUBLIC_HALLIDAY_PUBLIC_API_KEY as string,
        // $IP on Story
        outputs: ["story:0x"],
        // $USDC.e on Story
        // outputs: ["story:0xf1815bd50389c46847f0bda824ec8da914045d14"],
        sandbox: false,
        // Popup mode - no targetElementId needed
        windowType: "POPUP" as const,
        owner: {
          address,
          ...connectedSigner,
        },
        funder: {
          ...connectedSigner,
        },
      })

      console.log("[Halliday] Popup opened successfully for:", address)

      // Keep MetaMask masked for 5 seconds to ensure Halliday locks onto the custom signer
      setTimeout(() => {
        if (maskedEthereum) {
          console.log(
            "[Halliday] Restoring MetaMask after Halliday initialization"
          )
          // @ts-expect-error - Restoring the original ethereum provider
          window.ethereum = maskedEthereum
          setMaskedEthereum(null)
        }
      }, 5000)
    } catch (error) {
      console.error("Error opening Halliday:", error)
      setError(
        error instanceof Error ? error.message : "Failed to open Halliday"
      )

      // Restore MetaMask on error
      if (maskedEthereum) {
        console.log("[Halliday] Restoring MetaMask after error")
        // @ts-expect-error - Restoring the original ethereum provider
        window.ethereum = maskedEthereum
        setMaskedEthereum(null)
      }
    }
  }

  // Cleanup: Restore MetaMask when component unmounts
  useEffect(() => {
    return () => {
      if (maskedEthereum) {
        console.log("[Halliday] Restoring MetaMask on cleanup")
        // @ts-expect-error - Restoring the original ethereum provider
        window.ethereum = maskedEthereum
      }
    }
  }, [maskedEthereum])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='absolute top-4 right-4 z-50'>
        <DynamicWidget />
      </div>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Halliday Payments
            </h1>
            <p className='text-gray-600'>on Story Protocol</p>
          </div>

          {/* Wallet Not Connected */}
          {!primaryWallet && (
            <div className='text-center py-8'>
              <div className='mb-6'>
                <svg
                  className='w-16 h-16 mx-auto text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
              <h2 className='text-xl font-semibold mb-2'>
                Connect Your Wallet
              </h2>
              <p className='text-gray-600'>
                Use the button above to connect your wallet and get started
              </p>
            </div>
          )}

          {/* Switching Network */}
          {primaryWallet && isSwitchingNetwork && (
            <div className='text-center py-8'>
              <div className='mb-6'>
                <div className='inline-block p-4 bg-yellow-100 rounded-full'>
                  <svg
                    className='w-12 h-12 text-yellow-600 animate-spin'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                </div>
              </div>
              <h2 className='text-xl font-semibold mb-2 text-yellow-600'>
                Switching Network
              </h2>
              <p className='text-gray-600 text-sm'>
                Please approve the network switch in your wallet
              </p>
            </div>
          )}

          {/* Wallet Connected - Ready */}
          {primaryWallet && !isSwitchingNetwork && !error && (
            <div className='text-center'>
              <div className='mb-6'>
                <div className='inline-block p-4 bg-green-100 rounded-full'>
                  <svg
                    className='w-12 h-12 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
              </div>
              <h2 className='text-xl font-semibold mb-2 text-green-600'>
                Wallet Connected!
              </h2>
              <div className='mb-6'>
                <p className='text-gray-600 font-mono text-sm mb-1'>
                  {primaryWallet.address.slice(0, 6)}...
                  {primaryWallet.address.slice(-4)}
                </p>
                <p className='text-xs text-gray-500'>
                  {walletClient?.chain?.name || "Story Protocol"}
                </p>
              </div>
              <button
                onClick={handlePayWithHalliday}
                disabled={!eip1193Provider}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Fund with Halliday
              </button>
              <div id='halliday-embed'></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='text-center py-8'>
              <div className='mb-6'>
                <svg
                  className='w-16 h-16 mx-auto text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h2 className='text-xl font-semibold mb-2 text-red-600'>Error</h2>
              <p className='text-gray-700 mb-4'>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className='w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors'
              >
                Reload Page
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {primaryWallet && !error && !isSwitchingNetwork && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Clicking the button will open a secure Halliday popup
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
