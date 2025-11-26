"use client";

import { WizardControls } from "@/components/wizard/WizardControls";
import { CodePreview } from "@/components/wizard/CodePreview";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      <main className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary w-fit">
            Shielded Stablecoin Wizard
          </h1>
          <p className="text-base-content/70 text-lg">
            Create and deploy privacy-enabled stablecoins in minutes.
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 h-full min-h-0">
            <WizardControls />
          </div>

          {/* Right Panel: Code Preview */}
          <div className="lg:col-span-8 h-full min-h-[500px] lg:min-h-0">
            <CodePreview />
          </div>
        </div>
      </main>
    </div>
  );
}
