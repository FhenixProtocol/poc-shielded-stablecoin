import { arbitrumSepolia, sepolia, baseSepolia } from "wagmi/chains";

const BLOCK_EXPLORERS: Record<number, string> = {
  [sepolia.id]: "https://sepolia.etherscan.io",
  [arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
  [baseSepolia.id]: "https://sepolia.basescan.org",
};

export function getBlockExplorerUrl(chainId: number): string {
  return BLOCK_EXPLORERS[chainId] || "https://sepolia.etherscan.io";
}

export function getBlockExplorerTxUrl(chainId: number, txHash: string): string {
  return `${getBlockExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getBlockExplorerAddressUrl(chainId: number, address: string): string {
  return `${getBlockExplorerUrl(chainId)}/address/${address}`;
}

export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 16) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
