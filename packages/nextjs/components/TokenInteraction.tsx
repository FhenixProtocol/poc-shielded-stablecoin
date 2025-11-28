"use client";

import { Send, Vault } from "lucide-react";

export const TokenInteraction = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transfer Section */}
        <div className="bg-base-100 border border-base-300 rounded-sm p-6 relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-sm">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-base-content uppercase tracking-wider font-display">
              Transfer
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-base-content/60 text-sm">
              Send tokens securely. Supports both public and shielded transfers.
            </p>
            <div className="p-4 bg-base-200 border border-base-300 rounded-sm text-center">
              <span className="text-xs font-pixel text-base-content/40 uppercase tracking-widest">
                {"// Coming Soon: Transfer Logic"}
              </span>
            </div>
          </div>
        </div>

        {/* Vault Section */}
        <div className="bg-base-100 border border-base-300 rounded-sm p-6 relative overflow-hidden group hover:border-primary transition-colors opacity-75">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-base-200 rounded-sm">
              <Vault className="w-6 h-6 text-base-content/40" />
            </div>
            <h2 className="text-xl font-bold text-base-content/60 uppercase tracking-wider font-display">
              Vault
            </h2>
            <span className="px-2 py-0.5 bg-base-200 text-[10px] font-bold text-base-content/40 uppercase tracking-wider rounded-sm">
              Coming Soon
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-base-content/40 text-sm">
              Securely store your assets in a private vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


