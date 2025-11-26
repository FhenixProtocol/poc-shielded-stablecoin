"use client";

import { WizardControls } from "@/components/wizard/WizardControls";
import { CodePreview } from "@/components/wizard/CodePreview";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200 font-sans selection:bg-fhenix-primary selection:text-fhenix-dark">
      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(#1E293B 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 p-4 md:p-8 pb-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-fhenix-primary opacity-50"></div>
            <span className="text-fhenix-primary font-pixel text-xs tracking-widest uppercase">
              Confidential Token Wizard
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight font-display uppercase">
            Shielded Stablecoin
          </h1>
          <p className="text-fhenix-muted text-lg font-medium">
            Deploy privacy-preserving ERC20 tokens powered by FHE.
          </p>
        </header>

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
      </main>
    </div>
  );
}
