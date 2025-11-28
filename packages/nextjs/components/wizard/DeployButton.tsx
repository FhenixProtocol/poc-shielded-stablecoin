"use client";

import { Rocket, Loader2, CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";

interface DeployButtonProps {
  isConnected: boolean;
  isDeploying: boolean;
  isSuccess: boolean;
  isShielded: boolean;
  onDeploy: () => void;
}

export const DeployButton = ({
  isConnected,
  isDeploying,
  isSuccess,
  isShielded,
  onDeploy,
}: DeployButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isDisabled = !isConnected || isDeploying || isSuccess || !isShielded;

  return (
    <div className="relative">
      <div
        className="relative"
        onMouseEnter={() => !isShielded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={onDeploy}
          disabled={isDisabled}
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

        {/* Tooltip for disabled shield mode */}
        {showTooltip && !isShielded && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-base-200 border border-primary/30 rounded-sm p-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs font-display text-base-content whitespace-nowrap">
                  Only deploys shielded tokens
                </p>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-2 h-2 bg-base-200 border-r border-b border-primary/30 rotate-45"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isConnected && (
        <p className="text-center text-[10px] font-pixel text-base-content/40 mt-3 uppercase tracking-widest">
          {"// Connect wallet in navbar to deploy"}
        </p>
      )}
    </div>
  );
};
