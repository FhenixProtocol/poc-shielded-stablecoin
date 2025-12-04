"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Vault,
  ChevronDown,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Check,
  Coins,
} from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useChains,
} from "wagmi";
import { parseUnits, isAddress } from "viem";
import { abi } from "@/utils/contract";
import { cofhejs, Encryptable } from "cofhejs/web";
import { useCofheStore } from "@/services/store/cofheStore";
import { usePermit } from "@/hooks/usePermit";
import {
  useDeployedContractsStore,
  DeployedContract,
} from "@/services/store/deployedContractsStore";
import {
  getBlockExplorerTxUrl,
  formatTxHash,
} from "@/utils/blockExplorer";

type TransferMode = "public" | "private";

export const TokenInteraction = () => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { isInitialized } = useCofheStore();
  const { hasValidPermit } = usePermit();
  const { contracts } = useDeployedContractsStore();

  // Token selector state
  const [selectedToken, setSelectedToken] = useState<DeployedContract | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Transfer state
  const [transferMode, setTransferMode] = useState<TransferMode>("public");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

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

  // Reset form when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      setToAddress("");
    }
  }, [isSuccess]);

  // Check if we're on the correct chain for selected token
  const isCorrectChain = selectedToken
    ? currentChainId === selectedToken.chainId
    : true;
  const contractChainName = selectedToken
    ? chains.find((c) => c.id === selectedToken.chainId)?.name ||
      `Chain ${selectedToken.chainId}`
    : "";

  const isPending =
    isWritePending || isConfirming || isEncrypting || isSwitching;

  const handleSwitchChain = () => {
    if (selectedToken) {
      switchChain({ chainId: selectedToken.chainId });
    }
  };

  const handleTransfer = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!selectedToken) {
      setError("Please select a token");
      return;
    }

    if (!isCorrectChain) {
      setError("Please switch to the correct network");
      return;
    }

    if (!toAddress || !isAddress(toAddress)) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError(null);

    try {
      if (transferMode === "public") {
        // Public transfer - standard ERC20 transfer
        const parsedAmount = parseUnits(amount, selectedToken.decimals);

        writeContract({
          address: selectedToken.address as `0x${string}`,
          abi,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, parsedAmount],
        });
      } else {
        // Confidential transfer - requires encryption
        if (!isInitialized) {
          setError("COFHE not initialized. Please wait or refresh the page.");
          return;
        }

        if (!hasValidPermit) {
          setError("Please generate a permit first to make confidential transfers");
          return;
        }

        setIsEncrypting(true);

        try {
          // Confidential decimals are 6 for shielded tokens
          const confidentialDecimals = 6;
          const parsedAmount = parseUnits(amount, confidentialDecimals);

          // Encrypt the amount using cofhejs
          const encryptedResult = await cofhejs.encrypt([
            Encryptable.uint64(parsedAmount),
          ] as const);

          const encryptedAmount = encryptedResult.data?.[0];

          writeContract({
            address: selectedToken.address as `0x${string}`,
            abi,
            functionName: "confidentialTransfer",
            args: [toAddress as `0x${string}`, encryptedAmount],
          });
        } catch (encError) {
          const errorMessage =
            encError instanceof Error ? encError.message : "Encryption failed";
          setError(errorMessage);
          return;
        } finally {
          setIsEncrypting(false);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
    }
  };

  const getButtonText = () => {
    if (isSwitching) return "Switching Network...";
    if (isEncrypting) return "Encrypting...";
    if (isWritePending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming...";
    if (isSuccess) return "Success!";
    return transferMode === "public" ? "Transfer" : "Confidential Transfer";
  };

  const canTransferPrivate = isInitialized && hasValidPermit;

  const resetForm = () => {
    setAmount("");
    setToAddress("");
    setError(null);
    resetWrite();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Token Selector */}
      <div className="bg-base-100 border border-base-300 rounded-sm p-4 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>

        <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest mb-2 block">
          Select Token
        </label>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-base-200 border border-base-300 rounded-sm hover:border-primary transition-colors"
          >
            {selectedToken ? (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-primary/10 rounded-sm">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <span className="font-display text-base-content uppercase tracking-wide">
                    {selectedToken.name}
                  </span>
                  <span className="text-xs text-base-content/60 ml-2 font-mono">
                    ({selectedToken.symbol})
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-base-content/40 font-pixel text-sm">
                {"// Select a token to interact"}
              </span>
            )}
            <ChevronDown
              className={`w-5 h-5 text-base-content/60 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-sm shadow-lg max-h-60 overflow-y-auto">
              {contracts.length === 0 ? (
                <div className="p-4 text-center text-base-content/40 text-sm">
                  No tokens deployed yet
                </div>
              ) : (
                contracts.map((contract) => (
                  <button
                    key={contract.address}
                    onClick={() => {
                      setSelectedToken(contract);
                      setIsDropdownOpen(false);
                      resetForm();
                    }}
                    className={`w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors ${
                      selectedToken?.address === contract.address
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-base-200 rounded-sm">
                        <Coins className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="font-display text-base-content uppercase tracking-wide text-sm">
                          {contract.name}
                        </span>
                        <span className="text-xs text-base-content/60 ml-2 font-mono">
                          ({contract.symbol})
                        </span>
                        {contract.isShielded && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary/20 text-[10px] font-bold text-primary uppercase rounded-sm">
                            Shielded
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedToken?.address === contract.address && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transfer Section */}
        <div
          className={`bg-base-100 border border-base-300 rounded-sm p-6 relative overflow-hidden group transition-colors ${
            selectedToken
              ? "hover:border-primary"
              : "opacity-60 cursor-not-allowed"
          }`}
        >
          <div
            className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity ${
              selectedToken ? "opacity-0 group-hover:opacity-100" : "opacity-0"
            }`}
          ></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-sm">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
              Transfer
            </h2>
          </div>

          {!selectedToken ? (
            <div className="space-y-4">
              <p className="text-base-content/60 text-sm">
                Send tokens securely. Supports both public and shielded
                transfers.
              </p>
              <div className="p-4 bg-base-200 border border-base-300 rounded-sm text-center">
                <span className="text-xs font-pixel text-base-content/40 uppercase tracking-widest">
                  {"// Select a token to enable transfers"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Wrong Chain Warning */}
              {!isCorrectChain && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-yellow-500 font-medium">
                        Wrong Network
                      </p>
                      <p className="text-xs text-yellow-500/80 mt-1">
                        Switch to {contractChainName}
                      </p>
                      <button
                        onClick={handleSwitchChain}
                        disabled={isSwitching}
                        className="btn btn-xs btn-warning mt-2"
                      >
                        {isSwitching ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Switching...
                          </>
                        ) : (
                          "Switch Network"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
                  Transfer Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTransferMode("public")}
                    disabled={isPending}
                    className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-sm border transition-all ${
                      transferMode === "public"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span className="text-xs font-display uppercase tracking-wide">
                      Public
                    </span>
                  </button>
                  <button
                    onClick={() => setTransferMode("private")}
                    disabled={isPending || !selectedToken.isShielded}
                    className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-sm border transition-all ${
                      transferMode === "private"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-base-300 bg-base-200 text-base-content/60 hover:border-primary/50"
                    } ${
                      !selectedToken.isShielded
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs font-display uppercase tracking-wide">
                      Private
                    </span>
                  </button>
                </div>
                {!selectedToken.isShielded && (
                  <p className="text-xs text-base-content/40 italic">
                    Private transfers only for shielded tokens
                  </p>
                )}
              </div>

              {/* Private Transfer Requirements */}
              {transferMode === "private" && (
                <div className="p-2 bg-base-200 border border-base-300 rounded-sm space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-base-content/60">
                      COFHE Initialized
                    </span>
                    <span
                      className={
                        isInitialized ? "text-green-500" : "text-yellow-500"
                      }
                    >
                      {isInitialized ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-base-content/60">Permit Active</span>
                    <span
                      className={
                        hasValidPermit ? "text-green-500" : "text-yellow-500"
                      }
                    >
                      {hasValidPermit ? "Active" : "Required"}
                    </span>
                  </div>
                </div>
              )}

              {/* To Address Input */}
              <div className="space-y-2">
                <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
                  Recipient
                </label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isPending || !isCorrectChain}
                  className="input input-bordered input-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary text-base-content placeholder:text-base-content/40"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-pixel text-base-content/60 uppercase tracking-widest">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={isPending || !isCorrectChain}
                    className="input input-bordered input-sm w-full pr-16 font-mono text-sm bg-base-200 border-base-300 focus:border-primary text-base-content placeholder:text-base-content/40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-base-content/60">
                    {selectedToken.symbol}
                  </span>
                </div>
                {transferMode === "private" && (
                  <p className="text-xs text-base-content/40">
                    Shielded tokens use 6 decimal precision
                  </p>
                )}
              </div>

              {/* Error Display */}
              {(error || writeError) && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-500">
                      {error || writeError?.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {isSuccess && selectedToken && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-green-500 font-medium">
                        Transfer successful!
                      </p>
                      {hash && (
                        <a
                          href={getBlockExplorerTxUrl(selectedToken.chainId, hash)}
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

              {/* Transfer Button */}
              <button
                onClick={handleTransfer}
                disabled={
                  isPending ||
                  !amount ||
                  !toAddress ||
                  isSuccess ||
                  !isCorrectChain ||
                  (transferMode === "private" && !canTransferPrivate)
                }
                className="btn btn-fhenix w-full h-10 font-display uppercase tracking-wide text-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {getButtonText()}
                  </>
                ) : (
                  <>
                    {transferMode === "private" ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {getButtonText()}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Vault Section */}
        <div className="bg-base-100 border border-base-300 rounded-sm p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-base-200 rounded-sm opacity-50">
              <Vault className="w-6 h-6 text-base-content" />
            </div>
            <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
              Vault
            </h2>
            <span className="px-2 py-0.5 bg-base-200 text-[10px] font-bold text-base-content/50 uppercase tracking-wider rounded-sm">
              Coming Soon
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-base-content/50 text-sm">
              Securely store your assets in a private vault.
            </p>
            <div className="p-4 bg-base-200 border border-base-300 rounded-sm text-center opacity-50">
              <span className="text-xs font-pixel text-base-content uppercase tracking-widest">
                {"// Vault functionality in development"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
