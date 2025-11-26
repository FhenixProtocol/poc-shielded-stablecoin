"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { Lock, Zap, Wallet, Rocket, LogOut } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const WizardControls = () => {
  const {
    name,
    symbol,
    decimals,
    isShielded,
    setName,
    setSymbol,
    setDecimals,
    setIsShielded,
  } = useWizardStore();

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const handleButtonClick = () => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
      // TODO: Deploy contract logic
      console.log("Deploy contract with:", {
        name,
        symbol,
        decimals,
        isShielded,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-base-100 border border-fhenix-border rounded-none shadow-2xl h-full relative overflow-hidden group">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-fhenix-primary opacity-50"></div>

      <div className="flex items-center gap-2 mb-2 border-b border-fhenix-border pb-4">
        <div className="p-2 bg-fhenix-primary/10 rounded-sm">
          <Zap className="w-5 h-5 text-fhenix-primary" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
          Configuration
        </h2>
      </div>

      {/* Token Details Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-fhenix-border"></span>
          <h3 className="text-[10px] font-pixel text-fhenix-muted uppercase tracking-widest">
            Token Params
          </h3>
          <span className="h-px flex-1 bg-fhenix-border"></span>
        </div>

        <div className="form-control w-full group/input">
          <label className="label">
            <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
              Name
            </span>
          </label>
          <input
            type="text"
            placeholder="Fhenix USD"
            className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 font-mono text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="form-control w-1/2 group/input">
            <label className="label">
              <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
                Ticker
              </span>
            </label>
            <input
              type="text"
              placeholder="FUSD"
              className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 uppercase font-mono text-sm"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>

          <div className="form-control w-1/2 group/input">
            <label className="label">
              <span className="label-text font-medium text-fhenix-muted group-focus-within/input:text-fhenix-primary transition-colors font-display uppercase text-xs tracking-wide">
                Decimals
              </span>
            </label>
            <input
              type="number"
              placeholder="18"
              className="input input-bordered w-full bg-base-200 border-fhenix-border focus:border-fhenix-primary focus:ring-1 focus:ring-fhenix-primary/50 rounded-sm transition-all text-white placeholder:text-fhenix-muted/30 no-spinners font-mono text-sm"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              min={0}
              max={255}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
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
              onChange={(e) => setIsShielded(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={handleButtonClick}
          className="btn border-none w-full text-white font-bold tracking-wider rounded-sm relative overflow-hidden group/btn h-12 font-display uppercase"
        >
          <div className="absolute inset-0 bg-fhenix-gradient opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
          <span className="relative z-10 flex items-center gap-2">
            {isConnected ? (
              <>
                <Rocket className="w-4 h-4" />
                DEPLOY CONTRACT
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                CONNECT WALLET
              </>
            )}
            <div className="w-2 h-2 bg-white rotate-45 group-hover/btn:rotate-90 transition-transform"></div>
          </span>
        </button>
        {isConnected ? (
          <div className="flex items-center justify-center gap-2 mt-3">
            <p className="text-[10px] font-pixel text-fhenix-primary/70 uppercase tracking-widest">
              {"// "}
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <button
              onClick={() => disconnect()}
              className="btn btn-ghost btn-xs h-5 min-h-0 px-2 text-fhenix-muted hover:text-red-400 hover:bg-red-400/10 rounded-sm transition-all"
              title="Disconnect"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <p className="text-center text-[10px] font-pixel text-fhenix-muted/50 mt-3 uppercase tracking-widest">
            {"// Connect to Deploy"}
          </p>
        )}
      </div>
    </div>
  );
};
