"use client";

import { X, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface DeploySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: string;
  transactionHash: string;
  tokenName: string;
  tokenSymbol: string;
  chainName?: string;
}

export const DeploySuccessModal = ({
  isOpen,
  onClose,
  contractAddress,
  transactionHash,
  tokenName,
  tokenSymbol,
  chainName,
}: DeploySuccessModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-base-100 border border-fhenix-primary rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-fhenix-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-fhenix-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-fhenix-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-fhenix-primary"></div>

        {/* Success Header */}
        <div className="flex items-center justify-between p-5 border-b border-fhenix-border bg-fhenix-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fhenix-primary/20 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-fhenix-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                Deployment Successful!
              </h3>
              <p className="text-sm text-fhenix-muted mt-0.5">
                {tokenName} ({tokenSymbol}) deployed to {chainName || "blockchain"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-base-300 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-fhenix-muted hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Contract Address */}
          <div className="space-y-2">
            <label className="text-sm font-display text-fhenix-muted uppercase tracking-wide font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-fhenix-primary rounded-full"></span>
              Contract Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-base-200 border border-fhenix-border rounded-sm font-mono text-sm text-white break-all">
                {contractAddress}
              </div>
              <button
                onClick={() => copyToClipboard(contractAddress, "address")}
                className={`p-3 border rounded-sm transition-all ${
                  copiedField === "address"
                    ? "bg-fhenix-primary/20 border-fhenix-primary text-fhenix-primary"
                    : "bg-base-200 border-fhenix-border text-fhenix-muted hover:border-fhenix-primary hover:text-fhenix-primary"
                }`}
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-display text-fhenix-muted uppercase tracking-wide font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-fhenix-primary rounded-full"></span>
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-base-200 border border-fhenix-border rounded-sm font-mono text-sm text-white break-all">
                {transactionHash}
              </div>
              <button
                onClick={() => copyToClipboard(transactionHash, "hash")}
                className={`p-3 border rounded-sm transition-all ${
                  copiedField === "hash"
                    ? "bg-fhenix-primary/20 border-fhenix-primary text-fhenix-primary"
                    : "bg-base-200 border-fhenix-border text-fhenix-muted hover:border-fhenix-primary hover:text-fhenix-primary"
                }`}
                title="Copy hash"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-base-200 border border-fhenix-border rounded-sm">
            <p className="text-xs text-fhenix-muted">
              <span className="text-fhenix-primary font-semibold">Tip:</span> Your contract has been saved locally. 
              You can view and manage your deployed contracts from the dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-fhenix-border bg-base-200">
          <button
            onClick={onClose}
            className="flex-1 btn bg-base-300 border-fhenix-border hover:bg-base-100 text-white font-display uppercase tracking-wider rounded-sm"
          >
            Close
          </button>
          <a
            href={`https://etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn border-none text-white font-bold tracking-wider rounded-sm relative overflow-hidden group/btn font-display uppercase"
          >
            <div className="absolute inset-0 bg-fhenix-gradient opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
            <span className="relative z-10 flex items-center gap-2">
              View on Explorer
              <ExternalLink className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

