"use client";

import { WizardControls } from "@/components/wizard/WizardControls";
import { CodePreview } from "@/components/wizard/CodePreview";
import { Navbar } from "@/components/Navbar";
import { EncryptedText } from "@/components/EncryptedText";
import { useNavigationStore } from "@/services/store/navigationStore";
import { DeployedContractsList } from "@/components/DeployedContractsList";
import { TokenInteraction } from "@/components/TokenInteraction";

export default function Home() {
  const { activeTab } = useNavigationStore();

  return (
    <div className="min-h-screen bg-base-200 font-sans selection:bg-primary selection:text-base-100">
      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] [data-theme='fhenixdark']_&]:opacity-20 transition-opacity duration-300"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Background Mask/Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 p-4 md:p-8 pb-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-primary opacity-50"></div>
            <span className="text-primary font-pixel text-xs tracking-widest uppercase">
              {activeTab === "create" && "Confidential Token Wizard"}
              {activeTab === "manage" && "Token Manager"}
              {activeTab === "interact" && "Token Interaction"}
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-base-content tracking-tight font-display uppercase">
            <EncryptedText text="Shielded Stablecoin" />
          </h1>
          <p className="text-base-content/60 text-lg font-medium">
            {activeTab === "create" &&
              "Deploy privacy-preserving ERC20 tokens powered by FHE."}
            {activeTab === "manage" &&
              "Manage your deployed tokens, mint supply, and toggle privacy."}
            {activeTab === "interact" &&
              "Transfer tokens securely and access advanced features."}
          </p>
        </header>

        {activeTab === "create" && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel: Controls */}
            <div className="lg:col-span-3">
              <WizardControls />
            </div>

            {/* Right Panel: Code Preview */}
            <div className="lg:col-span-9 h-[600px] lg:h-auto lg:aspect-auto lg:max-h-[620px]">
              <CodePreview />
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="flex-1">
            <DeployedContractsList />
          </div>
        )}

        {activeTab === "interact" && (
          <div className="flex-1">
            <TokenInteraction />
          </div>
        )}
      </main>
    </div>
  );
}
