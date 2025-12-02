"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Shield,
  Loader2,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useChains,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { abi } from "@/utils/contract";
import { DeployedContract } from "@/services/store/deployedContractsStore";

interface ShieldUnshieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: DeployedContract;
  publicBalance: bigint | undefined;
  onSuccess?: () => void;
}

type Mode = "shield" | "unshield";

interface UnshieldClaim {
  ctHash: bigint;
  requestedAmount: bigint;
  decryptedAmount: bigint;
  decrypted: boolean;
  claimed: boolean;
}

export const ShieldUnshieldModal = ({
  isOpen,
  onClose,
  contract,
  publicBalance,
  onSuccess,
}: ShieldUnshieldModalProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [mode, setMode] = useState<Mode>("shield");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unshieldStep, setUnshieldStep] = useState<"request" | "waiting" | "claim">("request");
  const [isPolling, setIsPolling] = useState(false);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read the unshield claim status
  const {
    data: unshieldClaim,
    refetch: refetchClaim,
    isError: isClaimError,
  } = useReadContract({
    address: contract.address as `0x${string}`,
    abi,
    functionName: "getUserUnshieldClaim",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mode === "unshield" && unshieldStep !== "request",
    },
  });

  // Check if we're on the correct chain
  const isCorrectChain = currentChainId === contract.chainId;
  const contractChainName =
    chains.find((c) => c.id === contract.chainId)?.name ||
    `Chain ${contract.chainId}`;

  // Format balances
  const formattedPublicBalance = publicBalance
    ? formatUnits(publicBalance, contract.decimals)
    : "0";

  // Parse the unshield claim data
  const claimData = unshieldClaim as UnshieldClaim | undefined;
  const isClaimReady = claimData?.decrypted && !claimData?.claimed;

  // Poll for claim status when waiting
  useEffect(() => {
    if (mode !== "unshield" || unshieldStep !== "waiting" || !address) {
      return;
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const result = await refetchClaim();
        const claim = result.data as UnshieldClaim | undefined;

        if (claim && claim.decrypted && !claim.claimed) {
          setUnshieldStep("claim");
          setIsPolling(false);
          clearInterval(interval);
        }
      } catch {
        // Claim might not exist yet, continue polling
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [mode, unshieldStep, address, refetchClaim]);

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess) {
      if (mode === "shield") {
        // Shield completed
        onSuccess?.();
      } else if (mode === "unshield") {
        if (unshieldStep === "request") {
          // Unshield request sent, start waiting for decryption
          setUnshieldStep("waiting");
          resetWrite();
        } else if (unshieldStep === "claim") {
          // Claim completed
          onSuccess?.();
          setUnshieldStep("request");
        }
      }
    }
  }, [isTxSuccess, mode, unshieldStep, onSuccess, resetWrite]);

  // Check for existing claim on mount/mode change
  useEffect(() => {
    if (mode === "unshield" && address && isCorrectChain) {
      refetchClaim().then((result) => {
        const claim = result.data as UnshieldClaim | undefined;
        if (claim && !isClaimError) {
          if (claim.decrypted && !claim.claimed) {
            setUnshieldStep("claim");
          } else if (!claim.decrypted && !claim.claimed && claim.ctHash !== BigInt(0)) {
            setUnshieldStep("waiting");
          }
        }
      }).catch(() => {
        // No existing claim
        setUnshieldStep("request");
      });
    }
  }, [mode, address, isCorrectChain, refetchClaim, isClaimError]);

  if (!isOpen) return null;

  const isPending = isWritePending || isConfirming || isSwitching;

  const handleClose = () => {
    if (isPending || isPolling) return;
    setAmount("");
    setError(null);
    setMode("shield");
    setUnshieldStep("request");
    resetWrite();
    onClose();
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: contract.chainId });
  };

  const handleShield = async () => {
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

    const parsedAmount = parseUnits(amount, contract.decimals);

    if (publicBalance && parsedAmount > publicBalance) {
      setError("Amount exceeds your public balance");
      return;
    }

    setError(null);

    try {
      writeContract({
        address: contract.address as `0x${string}`,
        abi,
        functionName: "shield",
        args: [parsedAmount],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
    }
  };

  const handleUnshield = async () => {
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
      // Unshield uses 6 decimals (confidential precision)
      const confidentialDecimals = 6;
      const parsedAmount = parseUnits(amount, confidentialDecimals);

      writeContract({
        address: contract.address as `0x${string}`,
        abi,
        functionName: "unshield",
        args: [parsedAmount],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
    }
  };

  const handleClaimUnshielded = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!isCorrectChain) {
      setError("Please switch to the correct network");
      return;
    }

    setError(null);

    try {
      writeContract({
        address: contract.address as `0x${string}`,
        abi,
        functionName: "claimUnshielded",
        args: [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
    }
  };

  const handleSubmit = () => {
    if (mode === "shield") {
      handleShield();
    } else {
      if (unshieldStep === "request") {
        handleUnshield();
      } else if (unshieldStep === "claim") {
        handleClaimUnshielded();
      }
    }
  };

  const getButtonText = () => {
    if (isSwitching) return "Switching Network...";
    if (isWritePending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming...";

    if (mode === "shield") {
      if (isTxSuccess) return "Shielded!";
      return "Shield Tokens";
    } else {
      if (unshieldStep === "request") {
        return "Request Unshield";
      } else if (unshieldStep === "waiting") {
        return "Waiting for Decryption...";
      } else {
        if (isTxSuccess) return "Claimed!";
        return "Claim Tokens";
      }
    }
  };

  const isButtonDisabled = () => {
    if (isPending || !isCorrectChain) return true;
    if (mode === "shield") {
      return !amount || isTxSuccess;
    } else {
      if (unshieldStep === "request") {
        return !amount;
      } else if (unshieldStep === "waiting") {
        return true;
      } else {
        return !isClaimReady || isTxSuccess;
      }
    }
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
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content font-display uppercase tracking-wide">
                Shield / Unshield
              </h2>
              <p className="text-xs text-base-content/60 font-mono">
                {contract.name} ({contract.symbol})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending || isPolling}
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
                  <p className="text-sm text-yellow-500 font-medium">Wrong Network</p>
                  <p className="text-xs text-yellow-500/80 mt-1">
                    This token is on {contractChainName}. Please switch networks.
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
            <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
              Action
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("shield");
                  setAmount("");
                  setError(null);
                  resetWrite();
                }}
                disabled={isPending || isPolling}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-sm border transition-all ${
                  mode === "shield"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="text-sm font-display uppercase tracking-wide">
                  Shield
                </span>
              </button>
              <button
                onClick={() => {
                  setMode("unshield");
                  setAmount("");
                  setError(null);
                  resetWrite();
                }}
                disabled={isPending || isPolling}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-sm border transition-all ${
                  mode === "unshield"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="text-sm font-display uppercase tracking-wide">
                  Unshield
                </span>
              </button>
            </div>
          </div>

          {/* Mode Description */}
          <div className="p-3 bg-base-200 border border-base-300 rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              {mode === "shield" ? (
                <ArrowDownToLine className="w-4 h-4 text-primary" />
              ) : (
                <ArrowUpFromLine className="w-4 h-4 text-primary" />
              )}
              <span className="text-xs font-pixel text-primary uppercase">
                {mode === "shield" ? "Shield Tokens" : "Unshield Tokens"}
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              {mode === "shield"
                ? "Convert public tokens to shielded (private) tokens. Your balance will be encrypted and hidden."
                : "Convert shielded tokens back to public tokens. This is a two-step process: first request unshield, then claim after decryption."}
            </p>
          </div>

          {/* Unshield Progress Steps */}
          {mode === "unshield" && (
            <div className="space-y-3">
              <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
                Unshield Progress
              </label>
              <div className="flex items-center gap-2">
                {/* Step 1 */}
                <div
                  className={`flex-1 flex items-center gap-2 p-2 rounded-sm border ${
                    unshieldStep === "request"
                      ? "border-primary bg-primary/10"
                      : unshieldStep !== "request"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-base-300"
                  }`}
                >
                  {unshieldStep === "request" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-xs">Request</span>
                </div>

                {/* Step 2 */}
                <div
                  className={`flex-1 flex items-center gap-2 p-2 rounded-sm border ${
                    unshieldStep === "waiting"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : unshieldStep === "claim"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-base-300"
                  }`}
                >
                  {unshieldStep === "waiting" ? (
                    <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
                  ) : unshieldStep === "claim" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-base-300" />
                  )}
                  <span className="text-xs">Decrypt</span>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex-1 flex items-center gap-2 p-2 rounded-sm border ${
                    unshieldStep === "claim"
                      ? "border-primary bg-primary/10"
                      : "border-base-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      unshieldStep === "claim" ? "border-primary" : "border-base-300"
                    }`}
                  />
                  <span className="text-xs">Claim</span>
                </div>
              </div>

              {unshieldStep === "waiting" && (
                <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                  <span className="text-xs text-yellow-500">
                    Waiting for decryption... This may take a few moments.
                  </span>
                </div>
              )}

              {unshieldStep === "claim" && claimData && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-sm">
                  <p className="text-xs text-green-500">
                    Decryption complete! Amount ready to claim:{" "}
                    <span className="font-mono font-bold">
                      {formatUnits(claimData.decryptedAmount, 6)} {contract.symbol}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Amount Input (hide during waiting/claim) */}
          {!(mode === "unshield" && (unshieldStep === "waiting" || unshieldStep === "claim")) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
                  Amount
                </label>
                {mode === "shield" && (
                  <button
                    onClick={() => setAmount(formattedPublicBalance)}
                    disabled={isPending}
                    className="text-xs text-primary hover:underline"
                  >
                    Max: {parseFloat(formattedPublicBalance).toFixed(2)} {contract.symbol}
                  </button>
                )}
              </div>
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
              {mode === "unshield" && (
                <p className="text-xs text-base-content/40">
                  Note: Shielded tokens use 6 decimal precision
                </p>
              )}
            </div>
          )}

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
          {isTxSuccess && mode === "shield" && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-500 font-medium">
                    Tokens shielded successfully!
                  </p>
                  {hash && (
                    <p className="text-xs text-green-500/70 font-mono mt-1 truncate">
                      Tx: {hash}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled()}
            className="btn btn-fhenix w-full h-12 font-display uppercase tracking-wide"
          >
            {isPending || isPolling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {getButtonText()}
              </>
            ) : (
              <>
                {mode === "shield" ? (
                  <ArrowDownToLine className="w-5 h-5 mr-2" />
                ) : (
                  <ArrowUpFromLine className="w-5 h-5 mr-2" />
                )}
                {getButtonText()}
              </>
            )}
          </button>

          {!address && (
            <p className="text-center text-xs font-pixel text-base-content/40 uppercase tracking-widest mt-3">
              {"// Connect wallet to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
