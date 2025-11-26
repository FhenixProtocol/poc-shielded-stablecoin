import { useState } from "react";
import { useAccount } from "wagmi";
import { deployContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/services/web3/wagmiConfig";
import { abi, bytecode } from "@/utils/contract";
import { useDeployedContractsStore } from "@/services/store/deployedContractsStore";
import toast from "react-hot-toast";

interface DeploymentParams {
  name: string;
  symbol: string;
  decimals: number;
  isShielded: boolean;
  onSuccess?: () => void;
}

// Extract clean error message
const getErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error occurred";

  if (error instanceof Error) {
    const message = error.message;

    // Common patterns to extract the main error
    if (message.includes("User rejected") || message.includes("User denied")) {
      return "Transaction rejected by user";
    }

    if (message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }

    // Extract first line or sentence
    const firstLine = message.split("\n")[0];
    const firstSentence = firstLine.split(".")[0];

    // If it's too long, truncate
    if (firstSentence.length > 100) {
      return firstSentence.substring(0, 100) + "...";
    }

    return firstSentence;
  }

  return "Failed to deploy contract";
};

export const useContractDeployment = () => {
  const { address, chain } = useAccount();
  const { addContract } = useDeployedContractsStore();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const deployContractAsync = async (params: DeploymentParams) => {
    if (!address || !chain) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsDeploying(true);
      setIsSuccess(false);
      setDeployedAddress(null);

      // Deploy contract
      const hash = await deployContract(config, {
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [params.name, params.symbol, params.decimals],
      });

      setDeployedTxHash(hash);
      console.log("Contract deployed! Transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);

        // Save to local storage
        addContract({
          address: receipt.contractAddress,
          name: params.name,
          symbol: params.symbol,
          decimals: params.decimals,
          isShielded: params.isShielded,
          deployer: address,
          chainId: chain.id,
          transactionHash: hash,
          deployedAt: Date.now(),
        });

        console.log("Contract address:", receipt.contractAddress);
        setIsSuccess(true);
        
        // Call success callback if provided
        params.onSuccess?.();
      } else {
        throw new Error("Failed to get contract address from receipt");
      }
    } catch (error: unknown) {
      console.error("Deployment error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    isDeploying,
    deployedTxHash,
    deployedAddress,
    isSuccess,
    deployContract: deployContractAsync,
  };
};

