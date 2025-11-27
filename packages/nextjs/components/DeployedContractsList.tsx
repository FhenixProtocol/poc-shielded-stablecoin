"use client";

import { useDeployedContractsStore } from "@/services/store/deployedContractsStore";
import { useAccount } from "wagmi";
import {
  FileText,
  Trash2,
  ExternalLink,
  Shield,
  ChevronDown,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";
import { useState } from "react";

export const DeployedContractsList = () => {
  const { address } = useAccount();
  const { getContractsByDeployer, removeContract } =
    useDeployedContractsStore();
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  if (!address) {
    return (
      <div className="p-6 bg-base-100 border border-base-300 rounded-sm">
        <p className="text-center text-base-content/60 text-sm">
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
      <div className="p-6 bg-base-100 border border-base-300 rounded-sm">
        <p className="text-center text-base-content/60 text-sm">
          No contracts deployed yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-base-content uppercase tracking-wider font-display">
          Your Deployed Contracts ({userContracts.length})
        </h2>
      </div>

      <div className="space-y-3">
        {userContracts.map((contract) => (
          <div
            key={contract.address}
            className={`bg-base-100 border rounded-sm transition-all overflow-hidden ${
              expandedAddress === contract.address
                ? "border-primary shadow-md"
                : "border-base-300 hover:border-primary/50"
            }`}
          >
            {/* Card Header - Clickable */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(contract.address)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base-content font-bold font-display">
                      {contract.name} ({contract.symbol})
                    </h3>
                    {contract.isShielded && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary rounded-sm">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-pixel text-primary uppercase">
                          Shielded
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-pixel text-base-content/60 uppercase tracking-widest">
                        Address:
                      </span>
                      <span className="text-[10px] font-mono text-base-content">
                        {contract.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[9px] font-pixel text-base-content/60">
                      <span>Decimals: {contract.decimals}</span>
                      <span>Chain: {contract.chainId}</span>
                      <span>
                        Deployed:{" "}
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
                    <ChevronDown className="w-5 h-5 text-base-content/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedAddress === contract.address && (
              <div className="p-4 border-t border-base-300 bg-base-200/50 animate-fade-in">
                {/* Balances */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Public Balance */}
                  <div className="p-3 bg-base-100 rounded-sm border border-base-300">
                    <p className="text-[10px] font-pixel text-base-content/40 uppercase mb-1">
                      Public Balance
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-mono font-bold text-base-content">
                        0.00
                      </span>
                      <span className="text-xs font-mono text-base-content/60 mb-1">
                        {contract.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Shielded Balance */}
                  <div className="p-3 bg-base-100 rounded-sm border border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-pixel text-primary uppercase">
                        Shielded Balance
                      </p>
                      <Lock className="w-3 h-3 text-primary/60" />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-mono font-bold text-primary blur-sm select-none">
                        ******
                      </span>
                      <span className="text-xs font-mono text-primary/60 mb-1">
                        {contract.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button className="btn btn-sm btn-fhenix h-10 font-display uppercase tracking-wide text-xs">
                    <Plus className="w-4 h-4 mr-1" />
                    Mint
                  </button>
                  <button className="btn btn-sm btn-fhenix h-10 font-display uppercase tracking-wide text-xs">
                    <Shield className="w-4 h-4 mr-1" />
                    Shield
                  </button>
                  <button className="btn btn-sm btn-fhenix h-10 font-display uppercase tracking-wide text-xs">
                    <Unlock className="w-4 h-4 mr-1" />
                    Unshield
                  </button>
                </div>

                {/* External Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-300/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://etherscan.io/address/${contract.address}`,
                        "_blank"
                      );
                    }}
                    className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary hover:bg-primary/10"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
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
                    className="btn btn-ghost btn-xs text-base-content/60 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-[9px] font-pixel text-base-content/60 text-center mt-4">
        {"// "}Contracts are stored locally in your browser
      </div>
    </div>
  );
};
