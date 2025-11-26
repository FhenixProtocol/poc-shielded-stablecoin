"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { generateContract } from "@/utils/generateContract";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

export const CodePreview = () => {
  const { name, symbol, decimals, isShielded } = useWizardStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
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
      <div className="bg-[#1e1e1e] rounded-xl h-full w-full flex items-center justify-center text-gray-500">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800">
        <span className="text-sm font-medium text-gray-300">
          ShieldedStablecoin.sol
        </span>
        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-xs text-gray-400 hover:text-white flex gap-1"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language="solidity"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "transparent",
            fontSize: "0.9rem",
            lineHeight: "1.5",
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

