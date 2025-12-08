"use client";

import { WizardControls } from "@/components/wizard/WizardControls";
import { CodePreview } from "@/components/wizard/CodePreview";
import { Navbar } from "@/components/Navbar";
import { EncryptedText } from "@/components/EncryptedText";
import { useNavigationStore, UserSubTab } from "@/services/store/navigationStore";
import { DeployedContractsList } from "@/components/DeployedContractsList";
import { TokenInteraction } from "@/components/TokenInteraction";
import { Coins, ArrowLeftRight } from "lucide-react";

export default function Home() {
  const { activeTab, userSubTab, setUserSubTab } = useNavigationStore();

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
            <span className="text-primary font-pixel text-sm tracking-widest uppercase">
              {activeTab === "issuer" && "Confidential Token Wizard"}
              {activeTab === "user" && userSubTab === "tokens" && "Token Manager"}
              {activeTab === "user" && userSubTab === "interact" && "Token Interaction"}
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-base-content tracking-tight font-display uppercase">
            <EncryptedText text="Shielded Stablecoin" />
          </h1>
          <p className="text-base-content/60 text-lg font-medium">
            {activeTab === "issuer" &&
              "Deploy privacy-preserving ERC20 tokens powered by FHE."}
            {activeTab === "user" && userSubTab === "tokens" &&
              "Manage your tokens, mint supply, and toggle privacy."}
            {activeTab === "user" && userSubTab === "interact" &&
              "Transfer tokens securely and access advanced features."}
          </p>
        </header>

        {activeTab === "issuer" && (
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

        {activeTab === "user" && (
          <div className="flex-1 flex flex-col gap-6">
            {/* Sub-tabs for User section */}
            <div className="flex items-center gap-2">
              {(["tokens", "interact"] as UserSubTab[]).map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setUserSubTab(subTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-display uppercase tracking-wider transition-all font-bold border ${
                    userSubTab === subTab
                      ? "btn-fhenix border-primary"
                      : "bg-base-100 border-base-300 text-base-content/60 hover:text-base-content hover:border-primary/50"
                  }`}
                >
                  {subTab === "tokens" && <Coins className="w-4 h-4" />}
                  {subTab === "interact" && <ArrowLeftRight className="w-4 h-4" />}
                  {subTab === "tokens" && "Tokens"}
                  {subTab === "interact" && "Interact"}
                </button>
              ))}
            </div>

            {/* Content based on sub-tab */}
            {userSubTab === "tokens" && <DeployedContractsList />}
            {userSubTab === "interact" && <TokenInteraction />}
          </div>
        )}
      </main>
    </div>
  );
}
