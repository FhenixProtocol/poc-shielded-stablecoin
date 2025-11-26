"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { useDeployedContractsStore } from "@/services/store/deployedContractsStore";
import { Lock, Zap, Rocket, Loader2, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { deployContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/services/web3/wagmiConfig";
import { abi, bytecode } from "@/utils/contract";
import { useState } from "react";
import toast from "react-hot-toast";

export const WizardControls = () => {
  const {
    name,
    symbol,
    decimals,
    isShielded,
    setName,
    setSymbol,
    setDecimals,
    setIsShielded,
  } = useWizardStore();

  const { isConnected, address, chain } = useAccount();
  const { addContract } = useDeployedContractsStore();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract clean error message
  const getErrorMessage = (error: unknown): string => {
    if (!error) return "Unknown error occurred";

    if (error instanceof Error) {
      // Extract the main message before any additional details
      const message = error.message;

      // Common patterns to extract the main error
      if (
        message.includes("User rejected") ||
        message.includes("User denied")
      ) {
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

  const handleButtonClick = async () => {
    if (!isConnected || !address || !chain) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsDeploying(true);
      setIsSuccess(false);
      setDeployedAddress(null);

      // Deploy contract using wagmi's deployContract action
      const hash = await deployContract(config, {
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [name, symbol, decimals],
      });

      setDeployedTxHash(hash);
      console.log("Contract deployed! Transaction hash:", hash);

      // Wait for transaction receipt to get the contract address
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);

        // Save the deployed contract to local storage
        addContract({
          address: receipt.contractAddress,
          name,
          symbol,
          decimals,
          isShielded,
          deployer: address,
          chainId: chain.id,
          transactionHash: hash,
          deployedAt: Date.now(),
        });

        console.log("Contract address:", receipt.contractAddress);
        setIsSuccess(true);
        toast.success("Contract deployed successfully!");
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

  return (
    <div className="flex flex-col gap-6 p-6 bg-base-100 border border-fhenix-border rounded-none shadow-2xl h-full relative overflow-hidden group">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-fhenix-primary opacity-50"></div>

      <div className="flex items-center gap-2 mb-2 border-b border-fhenix-border pb-4">
        <div className="p-2 bg-fhenix-primary/10 rounded-sm">
          <Zap className="w-5 h-5 text-fhenix-primary" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
          Configuration
        </h2>
      </div>

      {/* Token Details Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-fhenix-border"></span>
          <h3 className="text-[10px] font-pixel text-fhenix-muted uppercase tracking-widest">
            Token Params
          </h3>
          <span className="h-px flex-1 bg-fhenix-border"></span>
        </div>

        <div className="form-control w-full group/input">
          <label className="label">
            <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
              Name
            </span>
          </label>
          <input
            type="text"
            placeholder="Fhenix USD"
            className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 font-mono text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="form-control w-1/2 group/input">
            <label className="label">
              <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
                Ticker
              </span>
            </label>
            <input
              type="text"
              placeholder="FUSD"
              className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 uppercase font-mono text-sm"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>

          <div className="form-control w-1/2 group/input">
            <label className="label">
              <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
                Decimals
              </span>
            </label>
            <input
              type="number"
              placeholder="18"
              className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 no-spinners font-mono text-sm"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              min={0}
              max={255}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-fhenix-border"></span>
          <h3 className="text-[10px] font-pixel text-fhenix-muted uppercase tracking-widest">
            Security
          </h3>
          <span className="h-px flex-1 bg-fhenix-border"></span>
        </div>

        <div className="form-control w-full">
          <label className="label cursor-pointer justify-between items-center py-0">
            <span className="label-text font-bold text-white flex items-center gap-2 font-display tracking-wide">
              <Lock className="w-4 h-4 text-fhenix-primary" />
              SHIELD MODE
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary border-fhenix-primary bg-fhenix-primary hover:bg-fhenix-primary toggle-sm"
              checked={isShielded}
              onChange={(e) => setIsShielded(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={handleButtonClick}
          disabled={!isConnected || isDeploying || isSuccess}
          className="btn border-none w-full text-white font-bold tracking-wider rounded-sm relative overflow-hidden group/btn h-12 font-display uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-fhenix-gradient opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
          <span className="relative z-10 flex items-center gap-2">
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                DEPLOYING...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                DEPLOYED!
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                DEPLOY CONTRACT
              </>
            )}
            {!isDeploying && !isSuccess && (
              <div className="w-2 h-2 bg-white rotate-45 group-hover/btn:rotate-90 transition-transform"></div>
            )}
          </span>
        </button>

        {!isConnected && (
          <p className="text-center text-[10px] font-pixel text-fhenix-muted/50 mt-3 uppercase tracking-widest">
            {"// Connect wallet in navbar to deploy"}
          </p>
        )}

        {/* Deployment status */}
        {deployedTxHash && !deployedAddress && isDeploying && (
          <div className="mt-3 p-3 bg-base-200 border border-fhenix-border rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-fhenix-primary animate-spin" />
              <p className="text-[9px] font-pixel text-fhenix-muted uppercase tracking-widest">
                {"// Waiting for Confirmation"}
              </p>
            </div>
            <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
              TX Hash:
            </p>
            <p className="text-[10px] font-mono text-white break-all">
              {deployedTxHash}
            </p>
          </div>
        )}

        {/* Success - Contract deployed */}
        {deployedAddress && (
          <div className="mt-3 p-3 bg-fhenix-primary/10 border border-fhenix-primary rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-fhenix-primary" />
              <p className="text-[9px] font-pixel text-fhenix-primary uppercase tracking-widest">
                {"// Contract Deployed Successfully"}
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
                  Contract Address:
                </p>
                <p className="text-[10px] font-mono text-white break-all bg-base-300 p-2 rounded-sm border border-fhenix-primary/20">
                  {deployedAddress}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
                  TX Hash:
                </p>
                <p className="text-[9px] font-mono text-fhenix-muted break-all">
                  {deployedTxHash}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
