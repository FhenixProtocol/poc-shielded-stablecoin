"use client";

import { Rocket, Loader2, CheckCircle2 } from "lucide-react";

interface DeployButtonProps {
  isConnected: boolean;
  isDeploying: boolean;
  isSuccess: boolean;
  onDeploy: () => void;
}

export const DeployButton = ({
  isConnected,
  isDeploying,
  isSuccess,
  onDeploy,
}: DeployButtonProps) => {
  return (
    <div>
      <button
        onClick={onDeploy}
        disabled={!isConnected || isDeploying || isSuccess}
        className="btn btn-fhenix w-full font-bold tracking-wider rounded-sm relative overflow-hidden group/btn h-12 font-display uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isDeploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              DEPLOYING...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              DEPLOYED!
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              DEPLOY CONTRACT
            </>
          )}
          {!isDeploying && !isSuccess && (
            <div className="w-2 h-2 bg-current rotate-45 group-hover/btn:rotate-90 transition-transform"></div>
          )}
        </span>
      </button>

      {!isConnected && (
        <p className="text-center text-[10px] font-pixel text-base-content/40 mt-3 uppercase tracking-widest">
          {"// Connect wallet in navbar to deploy"}
        </p>
      )}
    </div>
  );
};

