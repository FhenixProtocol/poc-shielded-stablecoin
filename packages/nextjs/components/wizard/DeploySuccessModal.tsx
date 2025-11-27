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
      <div className="relative bg-base-100 border border-primary rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

        {/* Success Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-300 bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
                Deployment Successful!
              </h3>
              <p className="text-sm text-base-content/60 mt-0.5">
                {tokenName} ({tokenSymbol}) deployed to {chainName || "blockchain"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-base-300 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-base-content/60 hover:text-base-content" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Contract Address */}
          <div className="space-y-2">
            <label className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Contract Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-base-200 border border-base-300 rounded-sm font-mono text-sm text-base-content break-all">
                {contractAddress}
              </div>
              <button
                onClick={() => copyToClipboard(contractAddress, "address")}
                className={`p-3 border rounded-sm transition-all ${
                  copiedField === "address"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-base-200 border-base-300 text-base-content/60 hover:border-primary hover:text-primary"
                }`}
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-base-200 border border-base-300 rounded-sm font-mono text-sm text-base-content break-all">
                {transactionHash}
              </div>
              <button
                onClick={() => copyToClipboard(transactionHash, "hash")}
                className={`p-3 border rounded-sm transition-all ${
                  copiedField === "hash"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-base-200 border-base-300 text-base-content/60 hover:border-primary hover:text-primary"
                }`}
                title="Copy hash"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-base-200 border border-base-300 rounded-sm">
            <p className="text-xs text-base-content/60">
              <span className="text-primary font-semibold">Tip:</span> Your contract has been saved locally. 
              You can view and manage your deployed contracts from the dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
          <button
            onClick={onClose}
            className="flex-1 btn bg-base-300 border-base-300 hover:bg-base-100 text-base-content font-display uppercase tracking-wider rounded-sm"
          >
            Close
          </button>
          <a
            href={`https://etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn btn-fhenix font-bold tracking-wider rounded-sm relative overflow-hidden group/btn font-display uppercase"
          >
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
