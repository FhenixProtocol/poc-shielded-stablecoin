"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { generateContract } from "@/utils/generateContract";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, FileCode, Code2 } from "lucide-react";
import { useState, useEffect } from "react";

export const CodePreview = () => {
  const { name, symbol, decimals, isShielded } = useWizardStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const code = generateContract({ name, symbol, decimals, isShielded });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="bg-fhenix-card rounded-none border border-fhenix-border h-full w-full flex items-center justify-center text-fhenix-muted font-mono text-sm animate-pulse">
        INITIALIZING PREVIEW...
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-fhenix-card rounded-none border border-fhenix-border shadow-2xl overflow-hidden group">
      {/* Tech accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fhenix-primary/50 to-transparent opacity-50"></div>

      <div className="flex items-center justify-between px-4 py-3 bg-[#0B1120] border-b border-fhenix-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-fhenix-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-fhenix-border"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-fhenix-border"></div>
          </div>
          <div className="h-4 w-px bg-fhenix-border mx-1"></div>
          <div className="flex items-center gap-2 text-fhenix-primary/80 font-mono text-xs tracking-wide">
            <FileCode className="w-3.5 h-3.5" />
            <span>ShieldedStablecoin.sol</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-xs h-7 min-h-0 rounded-sm text-fhenix-muted hover:text-white hover:bg-fhenix-primary/10 flex gap-1.5 font-mono uppercase tracking-wider text-[10px] border border-transparent hover:border-fhenix-primary/30 transition-all"
        >
          {copied ? (
            <>
              <Check size={12} className="text-fhenix-primary" />
              <span className="text-fhenix-primary">COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>COPY CODE</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0B1120]/80 backdrop-blur-sm relative">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <SyntaxHighlighter
          language="solidity"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "transparent",
            fontSize: "0.85rem",
            lineHeight: "1.6",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#334155",
            textAlign: "right",
            borderRight: "1px solid #1e293b",
            marginRight: "1em",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 bg-fhenix-card border-t border-fhenix-border flex items-center px-4 justify-between text-[10px] font-pixel text-fhenix-muted/60 uppercase tracking-widest"></div>
    </div>
  );
};
