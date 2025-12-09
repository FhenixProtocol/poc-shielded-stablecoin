"use client";

import { useState, useEffect } from "react";
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
  Eye,
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
import {
  getBlockExplorerTxUrl,
  formatTxHash,
} from "@/utils/blockExplorer";
import { cofhejs, FheTypes } from "cofhejs/web";
import { usePermit } from "@/hooks/usePermit";
import { useCofheStore } from "@/services/store/cofheStore";

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
  const { hasValidPermit } = usePermit();
  const { isInitialized } = useCofheStore();

  const [mode, setMode] = useState<Mode>("shield");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unshieldStep, setUnshieldStep] = useState<
    "request" | "waiting" | "claim"
  >("request");
  const [isPolling, setIsPolling] = useState(false);

  // Shielded balance reveal state
  const [revealedShieldedBalance, setRevealedShieldedBalance] = useState<bigint | null>(null);
  const [isRevealingBalance, setIsRevealingBalance] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
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

  // Read confidential balance (ctHash) for unshield mode
  const { data: confidentialBalance } = useReadContract({
    address: contract.address as `0x${string}`,
    abi,
    functionName: "confidentialBalanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && mode === "unshield",
    },
  });

  const ctHash = confidentialBalance as bigint | undefined;

  // Check if we're on the correct chain
  const isCorrectChain = currentChainId === contract.chainId;
  const contractChainName =
    chains.find((c) => c.id === contract.chainId)?.name ||
    `Chain ${contract.chainId}`;

  // Format balances
  const formattedPublicBalance = publicBalance
    ? formatUnits(publicBalance, contract.decimals)
    : "0";

  const formattedShieldedBalance = revealedShieldedBalance !== null
    ? formatUnits(revealedShieldedBalance, 6) // Shielded tokens use 6 decimals
    : null;

  // Check if amount exceeds balance
  const getAmountExceedsBalance = () => {
    if (!amount) return false;
    try {
      if (mode === "shield") {
        if (!publicBalance) return false;
        const parsedAmount = parseUnits(amount, contract.decimals);
        return parsedAmount > publicBalance;
      } else {
        // Unshield mode - check against revealed shielded balance
        if (revealedShieldedBalance === null) return false;
        const parsedAmount = parseUnits(amount, 6); // Shielded uses 6 decimals
        return parsedAmount > revealedShieldedBalance;
      }
    } catch {
      return false;
    }
  };
  const amountExceedsBalance = getAmountExceedsBalance();

  // Handle revealing shielded balance
  const handleRevealBalance = async () => {
    if (ctHash === undefined || !hasValidPermit || !isInitialized) {
      return;
    }

    // If ctHash is 0, no shielded balance exists yet
    if (ctHash === BigInt(0)) {
      setRevealedShieldedBalance(BigInt(0));
      return;
    }

    setIsRevealingBalance(true);
    setRevealError(null);
    try {
      const result = await cofhejs.unseal(ctHash, FheTypes.Uint64);

      if (result?.success && result?.data !== undefined) {
        setRevealedShieldedBalance(BigInt(result.data.toString()));
      } else {
        const errorMessage =
          result?.error?.message || String(result?.error) || "";

        if (
          errorMessage.includes("sealed data not found") ||
          errorMessage.includes("400 Bad Request") ||
          errorMessage.includes("Failed to fetch full ciphertext")
        ) {
          setRevealedShieldedBalance(BigInt(0));
        } else {
          setRevealError("Failed to decrypt balance");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (
        errorMessage.includes("sealed data not found") ||
        errorMessage.includes("400 Bad Request") ||
        errorMessage.includes("Failed to fetch full ciphertext")
      ) {
        setRevealedShieldedBalance(BigInt(0));
      } else {
        setRevealError("Decryption error");
      }
    } finally {
      setIsRevealingBalance(false);
    }
  };

  // Parse the unshield claim data
  const claimData = unshieldClaim as UnshieldClaim | undefined;
  const isClaimReady = claimData?.decrypted && !claimData?.claimed;
  console.log({ claimData });

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

  // Track which step the tx was for
  const [claimCompleted, setClaimCompleted] = useState(false);

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
          // Claim completed - mark as done and call success callback
          setClaimCompleted(true);
          onSuccess?.();
        }
      }
    }
  }, [isTxSuccess, mode, unshieldStep, onSuccess, resetWrite]);

  // Check for existing claim on mount/mode change
  useEffect(() => {
    if (mode === "unshield" && address && isCorrectChain) {
      refetchClaim()
        .then((result) => {
          const claim = result.data as UnshieldClaim | undefined;
          if (claim && !isClaimError) {
            if (claim.decrypted && !claim.claimed) {
              setUnshieldStep("claim");
            } else if (
              !claim.decrypted &&
              !claim.claimed &&
              claim.ctHash !== BigInt(0)
            ) {
              setUnshieldStep("waiting");
            }
          }
        })
        .catch(() => {
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
    setClaimCompleted(false);
    setRevealedShieldedBalance(null);
    setRevealError(null);
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
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
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
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
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
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
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
      if (claimCompleted) return "Claimed!";
      if (unshieldStep === "request") {
        return "Request Unshield";
      } else if (unshieldStep === "waiting") {
        return "Waiting for Decryption...";
      } else {
        return "Claim Tokens";
      }
    }
  };

  const isButtonDisabled = () => {
    if (isPending || !isCorrectChain) return true;
    if (mode === "shield") {
      return !amount || isTxSuccess || amountExceedsBalance;
    } else {
      if (claimCompleted) return true;
      if (unshieldStep === "request") {
        // For unshield, require revealed balance and valid amount
        return !amount || revealedShieldedBalance === null || amountExceedsBalance;
      } else if (unshieldStep === "waiting") {
        return true;
      } else {
        return !isClaimReady;
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
                  <p className="text-sm text-yellow-500 font-medium">
                    Wrong Network
                  </p>
                  <p className="text-xs text-yellow-500/80 mt-1">
                    This token is on {contractChainName}. Please switch
                    networks.
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
              Action
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode("shield");
                  setAmount("");
                  setError(null);
                  setClaimCompleted(false);
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
                  setClaimCompleted(false);
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
              <span className="text-sm font-pixel text-primary uppercase">
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
              <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
                Unshield Progress
              </label>
              <div className="relative flex items-center justify-between px-2">
                {/* Connector Lines */}
                <div className="absolute top-4 left-[calc(16.67%+8px)] right-[calc(16.67%+8px)] h-0.5 bg-base-300">
                  {/* First segment - Request to Decrypt */}
                  <div
                    className={`absolute left-0 h-full transition-all duration-300 ${
                      unshieldStep !== "request" || claimCompleted
                        ? "w-1/2 bg-green-500"
                        : "w-0"
                    }`}
                  />
                  {/* Second segment - Decrypt to Claim */}
                  <div
                    className={`absolute left-1/2 h-full transition-all duration-300 ${
                      unshieldStep === "claim" || claimCompleted
                        ? "w-1/2 bg-green-500"
                        : unshieldStep === "waiting"
                          ? "w-1/4 bg-yellow-500"
                          : "w-0"
                    }`}
                  />
                </div>

                {/* Step 1 - Request */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      unshieldStep === "request" && !claimCompleted
                        ? "bg-primary text-primary-content ring-4 ring-primary/20"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {unshieldStep === "request" && !claimCompleted ? (
                      <span className="text-xs font-bold">1</span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    unshieldStep === "request" && !claimCompleted
                      ? "text-primary"
                      : "text-green-600"
                  }`}>Request</span>
                </div>

                {/* Step 2 - Decrypt */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      unshieldStep === "waiting"
                        ? "bg-yellow-500 text-white ring-4 ring-yellow-500/20"
                        : unshieldStep === "claim" || claimCompleted
                          ? "bg-green-500 text-white"
                          : "bg-base-300 text-base-content/40"
                    }`}
                  >
                    {unshieldStep === "waiting" ? (
                      <Clock className="w-4 h-4 animate-pulse" />
                    ) : unshieldStep === "claim" || claimCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">2</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    unshieldStep === "waiting"
                      ? "text-yellow-600"
                      : unshieldStep === "claim" || claimCompleted
                        ? "text-green-600"
                        : "text-base-content/60"
                  }`}>Decrypt</span>
                </div>

                {/* Step 3 - Claim */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      claimCompleted
                        ? "bg-green-500 text-white"
                        : unshieldStep === "claim"
                          ? "bg-primary text-primary-content ring-4 ring-primary/20"
                          : "bg-base-300 text-base-content/40"
                    }`}
                  >
                    {claimCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">3</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    claimCompleted
                      ? "text-green-600"
                      : unshieldStep === "claim"
                        ? "text-primary"
                        : "text-base-content/60"
                  }`}>Claim</span>
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

              {unshieldStep === "claim" && claimData && !claimCompleted && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-sm">
                  <p className="text-xs text-green-500">
                    Decryption complete! Amount ready to claim:{" "}
                    <span className="font-mono font-bold">
                      {formatUnits(claimData.decryptedAmount, 6)}{" "}
                      {contract.symbol}
                    </span>
                  </p>
                </div>
              )}

              {claimCompleted && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-500 font-medium">
                        Tokens claimed successfully!
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
          )}

          {/* Amount Input (hide during waiting/claim) */}
          {!(
            mode === "unshield" &&
            (unshieldStep === "waiting" || unshieldStep === "claim")
          ) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
                  Amount
                </label>
                {mode === "shield" && (
                  <button
                    onClick={() => setAmount(formattedPublicBalance)}
                    disabled={isPending}
                    className="text-xs text-base-content hover:underline"
                  >
                    Max: {parseFloat(formattedPublicBalance).toFixed(2)}{" "}
                    {contract.symbol}
                  </button>
                )}
                {mode === "unshield" && revealedShieldedBalance !== null && formattedShieldedBalance && (
                  <button
                    onClick={() => setAmount(formattedShieldedBalance)}
                    disabled={isPending}
                    className="text-xs text-base-content hover:underline"
                  >
                    Max: {parseFloat(formattedShieldedBalance).toFixed(2)}{" "}
                    {contract.symbol}
                  </button>
                )}
              </div>

              {/* Reveal Balance Section for Unshield */}
              {mode === "unshield" && revealedShieldedBalance === null && unshieldStep === "request" && (
                <div className="p-4 bg-base-200 border border-base-300 rounded-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm font-pixel text-primary uppercase">
                      Reveal Balance First
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60">
                    You need to reveal your shielded balance before you can unshield tokens.
                  </p>
                  {!hasValidPermit ? (
                    <p className="text-xs text-yellow-500">
                      A permit is required to reveal your balance. Please generate one first.
                    </p>
                  ) : (
                    <button
                      onClick={handleRevealBalance}
                      disabled={isRevealingBalance || !isInitialized}
                      className="btn btn-sm btn-primary"
                    >
                      {isRevealingBalance ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Revealing...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Balance
                        </>
                      )}
                    </button>
                  )}
                  {revealError && (
                    <p className="text-xs text-red-500">{revealError}</p>
                  )}
                </div>
              )}

              {/* Revealed Balance Display for Unshield */}
              {mode === "unshield" && revealedShieldedBalance !== null && formattedShieldedBalance && unshieldStep === "request" && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-pixel text-primary uppercase">
                      Your Shielded Balance
                    </span>
                    <span className="text-sm font-mono font-bold text-primary">
                      {parseFloat(formattedShieldedBalance).toFixed(2)} {contract.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount Input - Only show when balance is revealed for unshield, or always for shield */}
              {(mode === "shield" || (mode === "unshield" && revealedShieldedBalance !== null)) && (
                <>
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
                </>
              )}
            </div>
          )}

          {/* Amount Exceeds Balance Warning */}
          {amountExceedsBalance && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">
                  {mode === "shield"
                    ? `Amount exceeds your public balance of ${parseFloat(formattedPublicBalance).toFixed(2)} ${contract.symbol}`
                    : `Amount exceeds your shielded balance of ${formattedShieldedBalance ? parseFloat(formattedShieldedBalance).toFixed(2) : "0"} ${contract.symbol}`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(error || writeError) && !amountExceedsBalance && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">
                  {(() => {
                    const errorMsg = error || writeError?.message || "";
                    // Decode common contract errors
                    if (errorMsg.includes("0xe450d38c") || errorMsg.includes("ERC20InsufficientBalance")) {
                      return "Insufficient shielded balance. The requested unshield amount exceeds your available shielded tokens.";
                    }
                    if (errorMsg.includes("UnshieldClaimAlreadyClaimed")) {
                      return "This claim has already been processed.";
                    }
                    if (errorMsg.includes("UnshieldClaimNotFound")) {
                      return "No unshield claim found. Please request unshield first.";
                    }
                    if (errorMsg.includes("UserHasActiveUnshieldClaim")) {
                      return "You already have an active unshield claim. Please complete or wait for it before requesting another.";
                    }
                    return errorMsg;
                  })()}
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
          {(mode === "shield" && isTxSuccess) || (mode === "unshield" && claimCompleted) ? (
            <button
              onClick={handleClose}
              className="btn bg-base-300 border-base-300 hover:bg-base-200 text-base-content w-full font-bold tracking-wider rounded-sm h-12 font-display uppercase"
            >
              Close
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled()}
              className="btn btn-fhenix w-full font-bold tracking-wider rounded-sm h-12 font-display uppercase"
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
          )}

          {!address && (
            <p className="text-center text-sm font-pixel text-base-content/40 uppercase tracking-widest mt-3">
              {"// Connect wallet to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
