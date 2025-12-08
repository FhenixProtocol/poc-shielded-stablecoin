"use client";

import { Lock, LockOpen } from "lucide-react";

interface SecuritySettingsProps {
  isShielded: boolean;
  onShieldedChange: (isShielded: boolean) => void;
}

export const SecuritySettings = ({
  isShielded,
  onShieldedChange,
}: SecuritySettingsProps) => {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-base-300"></span>
        <h3 className="text-sm font-pixel text-base-content/60 uppercase tracking-widest">
          Security
        </h3>
        <span className="h-px flex-1 bg-base-300"></span>
      </div>

      <button
        type="button"
        onClick={() => onShieldedChange(!isShielded)}
        className={`btn w-full font-bold tracking-wider rounded-sm relative overflow-hidden group/btn h-12 font-display uppercase ${
          isShielded
            ? "btn-outline border-error text-error hover:bg-error hover:text-error-content"
            : "btn-fhenix"
        }`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {isShielded ? (
            <>
              <LockOpen className="w-4 h-4" />
              REMOVE CONFIDENTIALITY
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              ADD CONFIDENTIALITY
            </>
          )}
        </span>
      </button>
    </div>
  );
};
