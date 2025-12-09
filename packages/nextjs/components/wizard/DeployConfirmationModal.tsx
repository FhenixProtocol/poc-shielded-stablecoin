"use client";

import {
  X,
  Shield,
  Coins,
  Hash,
  Network,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface DeployConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeploying?: boolean;
  transactionHash?: string | null;
  tokenDetails: {
    name: string;
    symbol: string;
    decimals: number;
    isShielded: boolean;
  };
  chainName?: string;
}

export const DeployConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeploying = false,
  transactionHash,
  tokenDetails,
  chainName,
}: DeployConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isDeploying ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-base-100 border border-base-300 rounded-sm shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
          <div className="flex items-center gap-2">
            {isDeploying ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-primary" />
            )}
            <h3 className="text-lg font-bold text-base-content uppercase tracking-wider font-display">
              {isDeploying ? "Deploying..." : "Confirm Deployment"}
            </h3>
          </div>
          {!isDeploying && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-base-300 rounded-sm transition-colors"
            >
              <X className="w-5 h-5 text-base-content/60 hover:text-base-content" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-base-content/60">
            Please review the contract details before deployment:
          </p>

          {/* Contract Details */}
          <div className="space-y-3">
            {/* Token Name */}
            <div className="flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-sm">
              <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold">
                  Token Name
                </span>
              </div>
              <span className="text-base-content font-mono text-sm font-medium">
                {tokenDetails.name}
              </span>
            </div>

            {/* Symbol */}
            <div className="flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-sm">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-primary" />
                <span className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold">
                  Symbol
                </span>
              </div>
              <span className="text-base-content font-mono text-sm font-medium uppercase">
                {tokenDetails.symbol}
              </span>
            </div>

            {/* Decimals */}
            <div className="flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-sm">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-primary text-center font-bold text-base">
                  #
                </span>
                <span className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold">
                  Decimals
                </span>
              </div>
              <span className="text-base-content font-mono text-sm font-medium">
                {tokenDetails.decimals}
              </span>
            </div>

            {/* Shield Mode */}
            <div className="flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-sm">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold">
                  Shield Mode
                </span>
              </div>
              <span
                className={`font-mono text-sm font-medium ${
                  tokenDetails.isShielded
                    ? "text-primary"
                    : "text-base-content/60"
                }`}
              >
                {tokenDetails.isShielded ? "ENABLED" : "DISABLED"}
              </span>
            </div>

            {/* Network */}
            {chainName && (
              <div className="flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-sm">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="text-sm font-display text-base-content/60 uppercase tracking-wide font-semibold">
                    Network
                  </span>
                </div>
                <span className="text-base-content font-mono text-sm font-medium">
                  {chainName}
                </span>
              </div>
            )}
          </div>

          {/* Loading State with Transaction Hash */}
          {isDeploying && (
            <div className="p-4 bg-base-200 border border-base-300 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm font-display text-base-content font-semibold">
                  {transactionHash
                    ? "Waiting for confirmation..."
                    : "Sending transaction..."}
                </span>
              </div>
              {transactionHash && (
                <div className="mt-2">
                  <p className="text-xs text-base-content/60 uppercase tracking-wide mb-1">
                    Transaction Hash:
                  </p>
                  <p className="text-xs font-mono text-primary break-all">
                    {transactionHash}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Warning - only show when not deploying */}
          {!isDeploying && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-sm">
              <p className="text-xs text-base-content">
                <span className="font-bold">Note:</span> This action will deploy
                a smart contract to the blockchain. Make sure all details are
                correct as this cannot be undone.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="flex-1 btn bg-base-300 border-base-300 hover:bg-base-100 text-base-content font-display uppercase tracking-wider rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeploying}
            className="flex-1 btn btn-fhenix font-bold tracking-wider rounded-sm relative overflow-hidden group/btn font-display uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
