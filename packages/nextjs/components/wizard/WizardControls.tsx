"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { useContractDeployment } from "@/hooks/useContractDeployment";
import { TokenDetailsForm } from "./TokenDetailsForm";
import { SecuritySettings } from "./SecuritySettings";
import { DeployButton } from "./DeployButton";
import { DeploymentStatus } from "./DeploymentStatus";

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

  const { isConnected } = useAccount();
  const {
    isDeploying,
    deployedTxHash,
    deployedAddress,
    isSuccess,
    deployContract,
  } = useContractDeployment();

  const handleDeploy = () => {
    deployContract({
      name,
      symbol,
      decimals,
      isShielded,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-base-100 border border-fhenix-border rounded-none shadow-2xl h-full relative overflow-hidden group">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-fhenix-primary opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-fhenix-primary opacity-50"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 border-b border-fhenix-border pb-4">
        <div className="p-2 bg-fhenix-primary/10 rounded-sm">
          <Zap className="w-5 h-5 text-fhenix-primary" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
          Configuration
        </h2>
      </div>

      {/* Token Details Form */}
      <TokenDetailsForm
        name={name}
        symbol={symbol}
        decimals={decimals}
        onNameChange={setName}
        onSymbolChange={setSymbol}
        onDecimalsChange={setDecimals}
      />

      {/* Security Settings */}
      <SecuritySettings
        isShielded={isShielded}
        onShieldedChange={setIsShielded}
      />

      {/* Deploy Button and Status */}
      <div className="mt-auto pt-6">
        <DeployButton
          isConnected={isConnected}
          isDeploying={isDeploying}
          isSuccess={isSuccess}
          onDeploy={handleDeploy}
        />

        <DeploymentStatus
          deployedTxHash={deployedTxHash}
          deployedAddress={deployedAddress}
          isDeploying={isDeploying}
        />
      </div>
    </div>
  );
};
