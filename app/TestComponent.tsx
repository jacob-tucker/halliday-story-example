import { custom, toHex } from 'viem';
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

// example of how you would now use the fully setup sdk

export default function TestComponent() {
  const { data: wallet } = useWalletClient();

  async function setupStoryClient(): Promise<StoryClient> {
    const config: StoryConfig = {
      wallet: wallet,
      transport: custom(wallet!.transport),
      chainId: "aeneid",
    };
    const client = StoryClient.newClient(config);
    return client;
  }

  async function registerIp() {
    const client = await setupStoryClient();
    const response = await client.ipAsset.registerIpAsset({
      nft: {
        type: 'minted',
        nftContract: '0x01' as `0x${string}`,
        tokenId: '1',
      },
      ipMetadata: {
        ipMetadataURI: "test-metadata-uri",
        ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
        nftMetadataURI: "test-nft-metadata-uri",
        nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
      }
    });
    console.log(
      `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
  }

  return (
    <div>
      <h1>Test Component</h1>
      <button onClick={registerIp}>Register IP</button>
    </div>
  )
}