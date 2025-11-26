"use client";

import { Lock } from "lucide-react";

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
        <span className="h-px flex-1 bg-fhenix-border"></span>
        <h3 className="text-[10px] font-pixel text-fhenix-muted uppercase tracking-widest">
          Security
        </h3>
        <span className="h-px flex-1 bg-fhenix-border"></span>
      </div>

      <div className="form-control w-full">
        <label className="label cursor-pointer justify-between items-center py-0">
          <span className="label-text font-bold text-white flex items-center gap-2 font-display tracking-wide">
            <Lock className="w-4 h-4 text-fhenix-primary" />
            SHIELD MODE
          </span>
          <input
            type="checkbox"
            className="toggle toggle-primary border-fhenix-primary bg-fhenix-primary hover:bg-fhenix-primary toggle-sm"
            checked={isShielded}
            onChange={(e) => onShieldedChange(e.target.checked)}
          />
        </label>
      </div>
    </div>
  );
};

