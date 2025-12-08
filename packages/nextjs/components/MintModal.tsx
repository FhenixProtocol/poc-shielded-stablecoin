"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Shield,
  Loader2,
  AlertCircle,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useChains,
} from "wagmi";
import { parseUnits } from "viem";
import { abi } from "@/utils/contract";
import { DeployedContract } from "@/services/store/deployedContractsStore";
import {
  getBlockExplorerTxUrl,
  formatTxHash,
} from "@/utils/blockExplorer";

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: DeployedContract;
  onSuccess?: () => void;
}

type MintMode = "public" | "private";

export const MintModal = ({
  isOpen,
  onClose,
  contract,
  onSuccess,
}: MintModalProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [mintMode, setMintMode] = useState<MintMode>("public");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if we're on the correct chain
  const isCorrectChain = currentChainId === contract.chainId;
  const contractChainName =
    chains.find((c) => c.id === contract.chainId)?.name ||
    `Chain ${contract.chainId}`;

  // Trigger onSuccess callback and refetch when transaction succeeds
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  if (!isOpen) return null;

  const isPending = isWritePending || isConfirming || isSwitching;

  const handleClose = () => {
    if (isPending) return;
    setAmount("");
    setError(null);
    setMintMode("public");
    resetWrite();
    onClose();
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: contract.chainId });
  };

  const handleMint = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!isCorrectChain) {
      setError("Please switch to the correct network");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError(null);

    try {
      if (mintMode === "public") {
        // Public mint - standard ERC20 mint
        const parsedAmount = parseUnits(amount, contract.decimals);

        writeContract({
          address: contract.address as `0x${string}`,
          abi,
          functionName: "mint",
          args: [address, parsedAmount],
        });
      } else {
        // Private/Confidential mint - uses plain uint64 (encryption happens on-chain)
        // Confidential decimals are 6 for shielded tokens
        const confidentialDecimals = 6;
        const parsedAmount = parseUnits(amount, confidentialDecimals);

        writeContract({
          address: contract.address as `0x${string}`,
          abi,
          functionName: "confidentialMint",
          args: [address, parsedAmount],
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
    }
  };

  const getButtonText = () => {
    if (isSwitching) return "Switching Network...";
    if (isWritePending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming...";
    if (isSuccess) return "Success!";
    return mintMode === "public" ? "Mint Tokens" : "Mint Shielded Tokens";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-base-100 border border-base-300 rounded-sm shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-sm">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content font-display uppercase tracking-wide">
                Mint Tokens
              </h2>
              <p className="text-xs text-base-content/60 font-mono">
                {contract.name} ({contract.symbol})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="btn btn-ghost btn-sm btn-square"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wrong Chain Warning */}
          {!isCorrectChain && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-500 font-medium">
                    Wrong Network
                  </p>
                  <p className="text-xs text-yellow-500/80 mt-1">
                    This token is on {contractChainName}. Please switch networks
                    to mint.
                  </p>
                  <button
                    onClick={handleSwitchChain}
                    disabled={isSwitching}
                    className="btn btn-sm btn-warning mt-3"
                  >
                    {isSwitching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Switching...
                      </>
                    ) : (
                      `Switch to ${contractChainName}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
              Mint Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMintMode("public")}
                disabled={isPending}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-sm border transition-all ${
                  mintMode === "public"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                }`}
              >
                <Unlock className="w-4 h-4" />
                <span className="text-sm font-display uppercase tracking-wide">
                  Public
                </span>
              </button>
              <button
                onClick={() => setMintMode("private")}
                disabled={isPending || !contract.isShielded}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-sm border transition-all ${
                  mintMode === "private"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                } ${!contract.isShielded ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm font-display uppercase tracking-wide">
                  Private
                </span>
              </button>
            </div>
            {!contract.isShielded && mintMode === "public" && (
              <p className="text-xs text-base-content/40 italic">
                Private mint is only available for shielded tokens
              </p>
            )}
          </div>

          {/* Recipient Display */}
          <div className="space-y-2">
            <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
              Recipient
            </label>
            <div className="p-3 bg-base-200 border border-base-300 rounded-sm">
              <p className="font-mono text-sm text-base-content truncate">
                {address || "Connect wallet"}
              </p>
            </div>
            <p className="text-xs text-base-content/40">
              Tokens will be minted to your connected wallet
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isPending || !isCorrectChain}
                className="input input-bordered w-full pr-16 font-mono text-lg bg-base-200 border-base-300 focus:border-primary text-base-content placeholder:text-base-content/40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-base-content/60">
                {contract.symbol}
              </span>
            </div>
            {mintMode === "private" && (
              <p className="text-xs text-base-content/40">
                Note: Shielded tokens use 6 decimal precision
              </p>
            )}
          </div>

          {/* Error Display */}
          {(error || writeError) && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">
                  {error || writeError?.message}
                </p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {isSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-500 font-medium">
                    Tokens minted successfully!
                  </p>
                  {hash && (
                    <a
                      href={getBlockExplorerTxUrl(contract.chainId, hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-500/70 font-mono mt-1 hover:text-green-500 hover:underline inline-block"
                    >
                      Tx: {formatTxHash(hash)}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-base-300">
          {isSuccess ? (
            <button
              onClick={handleClose}
              className="btn bg-base-300 border-base-300 hover:bg-base-200 text-base-content w-full font-bold tracking-wider rounded-sm h-12 font-display uppercase"
            >
              Close
            </button>
          ) : (
            <button
              onClick={handleMint}
              disabled={isPending || !amount || !isCorrectChain}
              className="btn btn-fhenix w-full font-bold tracking-wider rounded-sm h-12 font-display uppercase"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {getButtonText()}
                </>
              ) : (
                <>
                  {mintMode === "private" ? (
                    <Shield className="w-5 h-5 mr-2" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2" />
                  )}
                  {getButtonText()}
                </>
              )}
            </button>
          )}

          {!address && (
            <p className="text-center text-sm font-pixel text-base-content/40 uppercase tracking-widest mt-3">
              {"// Connect wallet to mint tokens"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
