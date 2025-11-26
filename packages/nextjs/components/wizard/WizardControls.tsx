"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { Info, Lock } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-6 p-6 bg-base-100 rounded-xl shadow-lg h-full">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Token Details Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-base-content/70">Token Details</h3>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Name</span>
          </label>
          <input
            type="text"
            placeholder="MyShieldedToken"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Ticker (Symbol)</span>
          </label>
          <input
            type="text"
            placeholder="MST"
            className="input input-bordered w-full"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Decimals</span>
          </label>
          <input
            type="number"
            placeholder="18"
            className="input input-bordered w-full no-spinners"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            min={0}
            max={255}
          />
        </div>
      </div>

      <div className="divider"></div>

      {/* Features Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-base-content/70">Features</h3>
        
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isShielded}
              readOnly
              // User requested "always be on", so we make it read-only or disable interaction
              onClick={() => { /* Prevent toggle off */ }}
            />
            <span className="label-text font-medium flex items-center gap-2">
              Shield Mode
              <Lock className="w-4 h-4 text-primary" />
            </span>
          </label>
          <div className="text-xs text-base-content/50 mt-1 ml-14">
            Enables Fully Homomorphic Encryption (FHE) for confidential balances and transfers.
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button className="btn btn-primary w-full text-lg">
          Deploy Contract
        </button>
        <p className="text-center text-xs text-base-content/50 mt-2">
          Wallet connection required for deployment
        </p>
      </div>
    </div>
  );
};

