"use client";

import {
  useDeployedContractsStore,
  DeployedContract,
} from "@/services/store/deployedContractsStore";
import { useAccount, useChains, useReadContract } from "wagmi";
import {
  FileText,
  Trash2,
  ExternalLink,
  Shield,
  ChevronDown,
  Plus,
  ArrowLeftRight,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PermitModal } from "./PermitModal";
import { MintModal } from "./MintModal";
import { ShieldUnshieldModal } from "./ShieldUnshieldModal";
import { AddTokenModal } from "./AddTokenModal";
import { usePermit } from "@/hooks/usePermit";
import { abi } from "@/utils/contract";
import { formatUnits } from "viem";
import { cofhejs, FheTypes } from "cofhejs/web";
import { useCofheStore } from "@/services/store/cofheStore";

// Decryption Animation Component
const DecryptingAnimation = ({ symbol }: { symbol: string }) => {
  const baseText = "sh*elded";

  const getRandomChar = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Use lazy initialization to avoid setState in effect
  const [randomChars, setRandomChars] = useState<string[]>(() =>
    baseText.split("")
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const random = Array.from({ length: baseText.length }, () =>
        getRandomChar()
      );
      setRandomChars(random);
    }, 80);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-end gap-2">
      <span className="text-2xl font-mono font-bold flex">
        <span className="text-base-content/40">(</span>
        {randomChars.map((char, index) => (
          <span
            key={index}
            className={char === "*" ? "text-primary" : "text-base-content"}
          >
            {char}
          </span>
        ))}
        <span className="text-base-content/40">)</span>
      </span>
      <span className="text-sm font-mono text-primary/60 mb-1">{symbol}</span>
    </div>
  );
};

// Shielded Balance Display Component
const ShieldedBalanceDisplay = ({
  contract,
  ctHash,
}: {
  contract: DeployedContract;
  ctHash: bigint | undefined;
}) => {
  const { hasValidPermit } = usePermit();
  const { isInitialized } = useCofheStore();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedBalance, setRevealedBalance] = useState<bigint | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleVisibility = async () => {
    if (ctHash === undefined || !hasValidPermit || !isInitialized) return;
    console.log(ctHash);

    // If already revealed, just toggle visibility
    if (revealedBalance !== null) {
      setIsVisible(!isVisible);
      return;
    }

    // Otherwise, decrypt first
    await handleReveal();
  };

  const handleReveal = async () => {
    if (ctHash === undefined || !hasValidPermit || !isInitialized) {
      console.log("handleReveal early return:", {
        ctHash,
        hasValidPermit,
        isInitialized,
      });
      return;
    }

    // If ctHash is 0, no shielded balance exists yet
    if (ctHash === BigInt(0)) {
      console.log("ctHash is 0, setting balance to 0");
      setRevealedBalance(BigInt(0));
      setIsVisible(true);
      return;
    }

    setIsRevealing(true);
    setError(null);
    try {
      console.log("Calling cofhejs.unseal with ctHash:", ctHash.toString());
      const result = await cofhejs.unseal(ctHash, FheTypes.Uint64);
      console.log("Unseal result:", result);

      if (result?.success && result?.data !== undefined) {
        setRevealedBalance(BigInt(result.data.toString()));
        setIsVisible(true);
      } else {
        const errorMessage =
          result?.error?.message || String(result?.error) || "";
        console.error("Unseal failed:", errorMessage);

        // Handle various error cases
        if (
          errorMessage.includes("sealed data not found") ||
          errorMessage.includes("400 Bad Request") ||
          errorMessage.includes("Failed to fetch full ciphertext")
        ) {
          // No shielded balance exists yet or ciphertext not available
          setRevealedBalance(BigInt(0));
          setIsVisible(true);
        } else {
          setError("Failed to decrypt");
          console.error("Unseal failed:", result);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Unseal error:", err);

      // Handle various error cases
      if (
        errorMessage.includes("sealed data not found") ||
        errorMessage.includes("400 Bad Request") ||
        errorMessage.includes("Failed to fetch full ciphertext")
      ) {
        // No shielded balance exists yet or ciphertext not available
        setRevealedBalance(BigInt(0));
        setIsVisible(true);
      } else {
        console.error("Failed to reveal balance:", err);
        setError("Decryption error");
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const formatBalance = (value: bigint) => {
    // Confidential decimals are typically 6 for shielded tokens
    const formatted = formatUnits(value, 6);
    // Ensure we always show 2 decimal places minimum
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };
  // Check if ctHash exists (0n is valid, undefined is not)
  const hasCtHash = ctHash !== undefined;

  return (
    <div className="p-4 bg-base-100 rounded-sm border border-primary/30">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-pixel text-primary uppercase">
          Shielded Balance
        </p>
        <div className="relative">
          <button
            onClick={handleToggleVisibility}
            disabled={!hasValidPermit || isRevealing || !hasCtHash}
            onMouseEnter={() => !hasValidPermit && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`btn btn-ghost btn-xs ${
              hasValidPermit && hasCtHash
                ? "text-primary hover:bg-primary/10"
                : "text-base-content/30 cursor-not-allowed"
            }`}
          >
            {isRevealing ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isVisible && revealedBalance !== null ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Tooltip for no permit */}
          {showTooltip && !hasValidPermit && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <div className="bg-base-200 border border-primary/30 rounded-sm p-2 shadow-lg whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Key className="w-3 h-3 text-primary" />
                  <p className="text-xs text-base-content">
                    Generate permit to reveal
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasCtHash ? (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-mono font-bold text-base-content/40">
            --
          </span>
          <span className="text-sm font-mono text-primary/60 mb-1">
            {contract.symbol}
          </span>
        </div>
      ) : revealedBalance !== null && isVisible ? (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-mono font-bold text-primary">
            {formatBalance(revealedBalance)}
          </span>
          <span className="text-sm font-mono text-primary/60 mb-1">
            {contract.symbol}
          </span>
        </div>
      ) : isRevealing ? (
        <DecryptingAnimation symbol={contract.symbol} />
      ) : error ? (
        <div className="flex items-end gap-2">
          <span className="text-sm font-mono text-red-500">{error}</span>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-mono font-bold flex">
            <span className="text-base-content/40">(</span>
            <span className="text-base-content">sh</span>
            <span className="text-primary">*</span>
            <span className="text-base-content">elded</span>
            <span className="text-base-content/40">)</span>
          </span>
          <span className="text-sm font-mono text-primary/60 mb-1">
            {contract.symbol}
          </span>
        </div>
      )}
    </div>
  );
};

// Contract Card Component
const ContractCard = ({
  contract,
  isExpanded,
  onToggle,
  onRemove,
  chainName,
}: {
  contract: DeployedContract;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  chainName: string;
}) => {
  const { address } = useAccount();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isShieldModalOpen, setIsShieldModalOpen] = useState(false);

  // Read public balance
  const { data: publicBalance, refetch: refetchPublicBalance } =
    useReadContract({
      address: contract.address as `0x${string}`,
      abi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && isExpanded,
      },
    });

  // Read confidential balance (ctHash)
  const { data: confidentialBalance, refetch: refetchConfidentialBalance } =
    useReadContract({
      address: contract.address as `0x${string}`,
      abi,
      functionName: "confidentialBalanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && isExpanded,
      },
    });

  // Refetch balances after successful mint
  const handleMintSuccess = () => {
    refetchPublicBalance();
    refetchConfidentialBalance();
  };

  const formatPublicBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.00";
    return formatUnits(balance, contract.decimals);
  };

  return (
    <div
      className={`bg-base-100 border rounded-sm transition-all overflow-hidden ${
        isExpanded
          ? "border-primary shadow-lg"
          : "border-base-300 hover:border-primary/50"
      }`}
    >
      {/* Card Header - Clickable */}
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            {/* Token Name & Shield Badge */}
            <div className="flex items-center gap-3">
              <h3 className="text-xl text-base-content font-bold font-display">
                {contract.name}{" "}
                <span className="text-base-content/60">
                  ({contract.symbol})
                </span>
              </h3>
              {contract.isShielded && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary rounded-sm">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold font-display text-primary uppercase tracking-wide">
                    Shielded
                  </span>
                </div>
              )}
            </div>

            {/* Contract Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-pixel text-base-content/50 uppercase tracking-widest">
                  Address:
                </span>
                <span className="text-sm font-mono text-base-content">
                  {contract.address}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-base-content/60">
                <span className="flex items-center gap-1">
                  <span className="text-xs font-pixel text-base-content/40 uppercase">
                    Decimals:
                  </span>{" "}
                  {contract.decimals}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs font-pixel text-base-content/40 uppercase">
                    Chain:
                  </span>{" "}
                  {chainName}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-xs font-pixel text-base-content/40 uppercase">
                    Deployed:
                  </span>{" "}
                  {new Date(contract.deployedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="w-6 h-6 text-base-content/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 border-t border-base-300 bg-base-200/50">
          {/* Balances */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Public Balance */}
            <div className="p-4 bg-base-100 rounded-sm border border-base-300">
              <p className="text-xs font-pixel text-base-content/40 uppercase mb-2">
                Public Balance
              </p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-base-content">
                  {formatPublicBalance(publicBalance as bigint | undefined)}
                </span>
                <span className="text-sm font-mono text-base-content/60 mb-1">
                  {contract.symbol}
                </span>
              </div>
            </div>

            {/* Shielded Balance */}
            <ShieldedBalanceDisplay
              contract={contract}
              ctHash={confidentialBalance as bigint | undefined}
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMintModalOpen(true);
              }}
              className="btn btn-fhenix h-12 font-display uppercase tracking-wide text-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Mint Tokens
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShieldModalOpen(true);
              }}
              disabled={!contract.isShielded}
              className={`btn btn-fhenix h-12 font-display uppercase tracking-wide text-sm ${
                !contract.isShielded ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 mr-2" />
              Shield / Unshield
            </button>
          </div>

          {/* Mint Modal */}
          <MintModal
            isOpen={isMintModalOpen}
            onClose={() => setIsMintModalOpen(false)}
            contract={contract}
            onSuccess={handleMintSuccess}
          />

          {/* Shield/Unshield Modal */}
          <ShieldUnshieldModal
            isOpen={isShieldModalOpen}
            onClose={() => setIsShieldModalOpen(false)}
            contract={contract}
            publicBalance={publicBalance as bigint | undefined}
            onSuccess={handleMintSuccess}
          />

          {/* External Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://etherscan.io/address/${contract.address}`,
                  "_blank"
                );
              }}
              className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary hover:bg-primary/10"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Explorer
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    `Are you sure you want to remove ${contract.name} from your list?`
                  )
                ) {
                  onRemove();
                }
              }}
              className="btn btn-ghost btn-sm text-base-content/60 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DeployedContractsList = () => {
  const { address } = useAccount();
  const chains = useChains();
  const { getContractsByDeployer, removeContract } =
    useDeployedContractsStore();
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const { hasValidPermit } = usePermit();

  // Helper to get chain name from ID
  const getChainName = (chainId: number) => {
    const chain = chains.find((c) => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const toggleExpand = (contractAddress: string) => {
    setExpandedAddress(
      expandedAddress === contractAddress ? null : contractAddress
    );
  };

  if (!address) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
              Your Deployed Tokens
            </h2>
          </div>
        </div>
        <div className="p-8 bg-base-100 border border-base-300 rounded-sm">
          <p className="text-center text-base-content/60 text-base">
            Connect your wallet to see deployed contracts
          </p>
        </div>
      </div>
    );
  }

  const userContracts = getContractsByDeployer(address);

  if (userContracts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with Permit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
              Your Tokens (0)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTokenModalOpen(true)}
              className="btn btn-sm btn-outline btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Token
            </button>
            <button
              onClick={() => setIsPermitModalOpen(true)}
              className={`btn btn-sm ${hasValidPermit ? "btn-outline btn-primary" : "btn-fhenix"}`}
            >
              <Key className="w-4 h-4 mr-2" />
              {hasValidPermit ? "Permit Active" : "Generate Permit"}
            </button>
          </div>
        </div>

        <div className="p-8 bg-base-100 border border-base-300 rounded-sm text-center">
          <p className="text-base-content/60 text-base mb-4">
            No tokens yet. Deploy a new token or add an existing one.
          </p>
          <button
            onClick={() => setIsAddTokenModalOpen(true)}
            className="btn btn-fhenix"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Existing Token
          </button>
        </div>

        <PermitModal
          isOpen={isPermitModalOpen}
          onClose={() => setIsPermitModalOpen(false)}
        />

        <AddTokenModal
          isOpen={isAddTokenModalOpen}
          onClose={() => setIsAddTokenModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Permit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
            Your Tokens ({userContracts.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTokenModalOpen(true)}
            className="btn btn-sm btn-outline btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Token
          </button>
          <button
            onClick={() => setIsPermitModalOpen(true)}
            className={`btn btn-sm ${hasValidPermit ? "btn-outline btn-primary" : "btn-fhenix"}`}
          >
            <Key className="w-4 h-4 mr-2" />
            {hasValidPermit ? "Permit Active" : "Generate Permit"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {userContracts.map((contract) => (
          <ContractCard
            key={contract.address}
            contract={contract}
            isExpanded={expandedAddress === contract.address}
            onToggle={() => toggleExpand(contract.address)}
            onRemove={() => removeContract(contract.address)}
            chainName={getChainName(contract.chainId)}
          />
        ))}
      </div>

      <div className="text-xs font-pixel text-base-content/60 text-center mt-6">
        {"// "}Contracts are stored locally in your browser
      </div>

      <PermitModal
        isOpen={isPermitModalOpen}
        onClose={() => setIsPermitModalOpen(false)}
      />

      <AddTokenModal
        isOpen={isAddTokenModalOpen}
        onClose={() => setIsAddTokenModalOpen(false)}
      />
    </div>
  );
};
