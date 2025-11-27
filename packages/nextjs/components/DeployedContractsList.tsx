"use client";

import { useDeployedContractsStore } from "@/services/store/deployedContractsStore";
import { useAccount, useChains } from "wagmi";
import {
  FileText,
  Trash2,
  ExternalLink,
  Shield,
  ChevronDown,
  Plus,
  Lock,
  ArrowLeftRight,
} from "lucide-react";
import { useState } from "react";

export const DeployedContractsList = () => {
  const { address } = useAccount();
  const chains = useChains();
  const { getContractsByDeployer, removeContract } =
    useDeployedContractsStore();
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  // Helper to get chain name from ID
  const getChainName = (chainId: number) => {
    const chain = chains.find((c) => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  if (!address) {
    return (
      <div className="p-8 bg-base-100 border border-base-300 rounded-sm">
        <p className="text-center text-base-content/60 text-base">
          Connect your wallet to see deployed contracts
        </p>
      </div>
    );
  }

  const userContracts = getContractsByDeployer(address);

  const toggleExpand = (contractAddress: string) => {
    setExpandedAddress(
      expandedAddress === contractAddress ? null : contractAddress
    );
  };

  if (userContracts.length === 0) {
    return (
      <div className="p-8 bg-base-100 border border-base-300 rounded-sm">
        <p className="text-center text-base-content/60 text-base">
          No contracts deployed yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
          Your Deployed Tokens ({userContracts.length})
        </h2>
      </div>

      <div className="space-y-4">
        {userContracts.map((contract) => (
          <div
            key={contract.address}
            className={`bg-base-100 border rounded-sm transition-all overflow-hidden ${
              expandedAddress === contract.address
                ? "border-primary shadow-lg"
                : "border-base-300 hover:border-primary/50"
            }`}
          >
            {/* Card Header - Clickable */}
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleExpand(contract.address)}
            >
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
                        {getChainName(contract.chainId)}
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
                      expandedAddress === contract.address ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-6 h-6 text-base-content/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedAddress === contract.address && (
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
                        0.00
                      </span>
                      <span className="text-sm font-mono text-base-content/60 mb-1">
                        {contract.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Shielded Balance */}
                  <div className="p-4 bg-base-100 rounded-sm border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-pixel text-primary uppercase">
                        Shielded Balance
                      </p>
                      <Lock className="w-4 h-4 text-primary/60" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-mono font-bold text-primary blur-sm select-none">
                        ******
                      </span>
                      <span className="text-sm font-mono text-primary/60 mb-1">
                        {contract.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button className="btn btn-fhenix h-12 font-display uppercase tracking-wide text-sm">
                    <Plus className="w-5 h-5 mr-2" />
                    Mint Tokens
                  </button>
                  <button className="btn btn-fhenix h-12 font-display uppercase tracking-wide text-sm">
                    <ArrowLeftRight className="w-5 h-5 mr-2" />
                    Shield / Unshield
                  </button>
                </div>

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
                        removeContract(contract.address);
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
        ))}
      </div>

      <div className="text-xs font-pixel text-base-content/60 text-center mt-6">
        {"// "}Contracts are stored locally in your browser
      </div>
    </div>
  );
};
