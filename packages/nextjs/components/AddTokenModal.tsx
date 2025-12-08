"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
  Coins,
} from "lucide-react";
import {
  useAccount,
  useReadContract,
  useChainId,
  useChains,
  useSwitchChain,
} from "wagmi";
import { isAddress } from "viem";
import { abi } from "@/utils/contract";
import { useDeployedContractsStore } from "@/services/store/deployedContractsStore";

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTokenModal = ({ isOpen, onClose }: AddTokenModalProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { addContract, contracts } = useDeployedContractsStore();

  const [tokenAddress, setTokenAddress] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Set default chain when modal opens
  useEffect(() => {
    if (isOpen && selectedChainId === null) {
      setSelectedChainId(currentChainId);
    }
  }, [isOpen, currentChainId, selectedChainId]);

  // Check if address is valid
  const isValidAddress = Boolean(tokenAddress && isAddress(tokenAddress));

  // Check if we're on the correct chain to read contract
  const isCorrectChain = selectedChainId === currentChainId;

  // Read token name
  const { data: tokenName, isLoading: isLoadingName } = useReadContract({
    address: isValidAddress ? (tokenAddress as `0x${string}`) : undefined,
    abi,
    functionName: "name",
    query: {
      enabled: isValidAddress && isCorrectChain,
    },
  });

  // Read token symbol
  const { data: tokenSymbol, isLoading: isLoadingSymbol } = useReadContract({
    address: isValidAddress ? (tokenAddress as `0x${string}`) : undefined,
    abi,
    functionName: "symbol",
    query: {
      enabled: isValidAddress && isCorrectChain,
    },
  });

  // Read token decimals
  const { data: tokenDecimals, isLoading: isLoadingDecimals } = useReadContract(
    {
      address: isValidAddress ? (tokenAddress as `0x${string}`) : undefined,
      abi,
      functionName: "decimals",
      query: {
        enabled: isValidAddress && isCorrectChain,
      },
    }
  );

  // Check if token has confidential features (isShielded)
  const { data: confidentialDecimals } = useReadContract({
    address: isValidAddress ? (tokenAddress as `0x${string}`) : undefined,
    abi,
    functionName: "confidentialDecimals",
    query: {
      enabled: isValidAddress && isCorrectChain,
    },
  });

  const isLoading = isLoadingName || isLoadingSymbol || isLoadingDecimals;
  const hasTokenData = tokenName && tokenSymbol && tokenDecimals !== undefined;
  const isShielded = confidentialDecimals !== undefined;

  // Check if token is already added
  const isAlreadyAdded = contracts.some(
    (c) =>
      c.address.toLowerCase() === tokenAddress.toLowerCase() &&
      c.chainId === selectedChainId
  );

  if (!isOpen) return null;

  const handleClose = () => {
    if (isAdding) return;
    setTokenAddress("");
    setSelectedChainId(null);
    setError(null);
    setIsChainDropdownOpen(false);
    onClose();
  };

  const handleSwitchChain = () => {
    if (selectedChainId) {
      switchChain({ chainId: selectedChainId });
    }
  };

  const handleAddToken = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!isValidAddress) {
      setError("Please enter a valid token address");
      return;
    }

    if (!selectedChainId) {
      setError("Please select a network");
      return;
    }

    if (!isCorrectChain) {
      setError("Please switch to the selected network first");
      return;
    }

    if (!hasTokenData) {
      setError("Could not read token data. Make sure the address is correct.");
      return;
    }

    if (isAlreadyAdded) {
      setError("This token is already in your list");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      addContract({
        address: tokenAddress,
        name: tokenName as string,
        symbol: tokenSymbol as string,
        decimals: Number(tokenDecimals),
        isShielded,
        deployer: address,
        chainId: selectedChainId,
        transactionHash: "", // No tx hash for imported tokens
        deployedAt: Date.now(),
      });

      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add token";
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const selectedChain = chains.find((c) => c.id === selectedChainId);

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
                Add Token
              </h2>
              <p className="text-xs text-base-content/60 font-mono">
                Import an existing token
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="btn btn-ghost btn-sm btn-square"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Network Selector */}
          <div className="space-y-2">
            <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
              Network
            </label>
            <div className="relative">
              <button
                onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                disabled={isAdding}
                className="w-full flex items-center justify-between p-3 bg-base-200 border border-base-300 rounded-sm hover:border-primary transition-colors"
              >
                {selectedChain ? (
                  <span className="font-display text-base-content uppercase tracking-wide text-sm">
                    {selectedChain.name}
                  </span>
                ) : (
                  <span className="text-base-content/40 font-pixel text-base">
                    {"// Select network"}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-base-content/60 transition-transform ${
                    isChainDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isChainDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChainId(chain.id);
                        setIsChainDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors ${
                        selectedChainId === chain.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="font-display text-base-content uppercase tracking-wide text-sm">
                        {chain.name}
                      </span>
                      {selectedChainId === chain.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Network mismatch warning */}
            {selectedChainId && !isCorrectChain && (
              <div className="flex items-center gap-2 text-xs text-yellow-500">
                <AlertCircle className="w-3 h-3" />
                <span>Switch network to read token data</span>
                <button
                  onClick={handleSwitchChain}
                  disabled={isSwitching}
                  className="text-primary hover:underline"
                >
                  {isSwitching ? "Switching..." : "Switch"}
                </button>
              </div>
            )}
          </div>

          {/* Token Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
              Token Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              disabled={isAdding}
              className="input input-bordered w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary text-base-content placeholder:text-base-content/40"
            />
            {tokenAddress && !isValidAddress && (
              <p className="text-xs text-red-500">Invalid address format</p>
            )}
          </div>

          {/* Token Preview */}
          {isValidAddress && isCorrectChain && (
            <div className="p-4 bg-base-200 border border-base-300 rounded-sm space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-pixel text-primary uppercase">
                  Token Details
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-base-content/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Reading contract...</span>
                </div>
              ) : hasTokenData ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Name</span>
                    <span className="text-base-content font-medium">
                      {tokenName as string}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Symbol</span>
                    <span className="text-base-content font-mono">
                      {tokenSymbol as string}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Decimals</span>
                    <span className="text-base-content font-mono">
                      {String(tokenDecimals)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/60">Type</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold uppercase rounded-sm ${
                        isShielded
                          ? "bg-primary/20 text-primary"
                          : "bg-base-300 text-base-content/60"
                      }`}
                    >
                      {isShielded ? "Shielded" : "Standard ERC20"}
                    </span>
                  </div>
                  {isAlreadyAdded && (
                    <p className="text-xs text-yellow-500 mt-2">
                      This token is already in your list
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  Could not read token data. Make sure the address is a valid
                  ERC20 token.
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={handleAddToken}
            disabled={
              isAdding ||
              !isValidAddress ||
              !hasTokenData ||
              !isCorrectChain ||
              isAlreadyAdded
            }
            className="btn btn-fhenix w-full h-12 font-display uppercase tracking-wide"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Adding Token...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Token
              </>
            )}
          </button>

          {!address && (
            <p className="text-center text-sm font-pixel text-base-content/40 uppercase tracking-widest mt-3">
              {"// Connect wallet to add tokens"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
