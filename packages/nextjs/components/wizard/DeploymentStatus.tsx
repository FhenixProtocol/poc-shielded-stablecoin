"use client";

import { Loader2, CheckCircle2 } from "lucide-react";

interface DeploymentStatusProps {
  deployedTxHash: string | null;
  deployedAddress: string | null;
  isDeploying: boolean;
}

export const DeploymentStatus = ({
  deployedTxHash,
  deployedAddress,
  isDeploying,
}: DeploymentStatusProps) => {
  // Show pending status
  if (deployedTxHash && !deployedAddress && isDeploying) {
    return (
      <div className="mt-3 p-3 bg-base-200 border border-fhenix-border rounded-sm">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-4 h-4 text-fhenix-primary animate-spin" />
          <p className="text-[9px] font-pixel text-fhenix-muted uppercase tracking-widest">
            {"// Waiting for Confirmation"}
          </p>
        </div>
        <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
          TX Hash:
        </p>
        <p className="text-[10px] font-mono text-white break-all">
          {deployedTxHash}
        </p>
      </div>
    );
  }

  // Show success status
  if (deployedAddress) {
    return (
      <div className="mt-3 p-3 bg-fhenix-primary/10 border border-fhenix-primary rounded-sm">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-fhenix-primary" />
          <p className="text-[9px] font-pixel text-fhenix-primary uppercase tracking-widest">
            {"// Contract Deployed Successfully"}
          </p>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
              Contract Address:
            </p>
            <p className="text-[10px] font-mono text-white break-all bg-base-300 p-2 rounded-sm border border-fhenix-primary/20">
              {deployedAddress}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-pixel text-fhenix-muted uppercase tracking-widest mb-1">
              TX Hash:
            </p>
            <p className="text-[9px] font-mono text-fhenix-muted break-all">
              {deployedTxHash}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

