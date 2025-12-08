"use client";

import { useWizardStore } from "@/services/store/wizardStore";
import { generateContract } from "@/utils/generateContract";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, FileCode, Code2 } from "lucide-react";
import { useState, useEffect } from "react";

export const CodePreview = () => {
  const { name, symbol, decimals, isShielded } = useWizardStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("fhenixlight");

  useEffect(() => {
    setMounted(true);
    // Initial theme check
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "fhenixlight";
    setTheme(currentTheme);

    // Observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const newTheme =
            document.documentElement.getAttribute("data-theme") ||
            "fhenixlight";
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const code = generateContract({ name, symbol, decimals, isShielded });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="bg-base-100 rounded-none border border-base-300 h-full w-full flex items-center justify-center text-base-content/50 font-mono text-sm animate-pulse">
        INITIALIZING PREVIEW...
      </div>
    );
  }

  const isDark = theme === "fhenixdark";
  const syntaxStyle = isDark ? materialDark : materialLight;

  return (
    <div className="relative h-full flex flex-col bg-base-100 rounded-none border border-base-300 shadow-2xl overflow-hidden group">
      {/* Tech accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

      <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-base-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-base-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-base-300"></div>
          </div>
          <div className="h-4 w-px bg-base-300 mx-1"></div>
          <div className="flex items-center gap-2 text-primary font-mono font-medium text-s tracking-wide">
            <FileCode className="w-3.5 h-3.5" />
            <span>ShieldedStablecoin.sol</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-xs h-7 min-h-0 rounded-sm text-base-content/60 hover:text-base-content hover:bg-base-300 flex gap-1.5 font-mono uppercase tracking-wider text-[10px] border border-transparent hover:border-primary/30 transition-all"
        >
          {copied ? (
            <>
              <Check size={12} className="text-primary" />
              <span className="text-primary">COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>COPY CODE</span>
            </>
          )}
        </button>
      </div>

      <div
        className={`flex-1 overflow-auto custom-scrollbar ${isDark ? "bg-[#0B1120]/80" : "bg-[#fafafa]"} backdrop-blur-sm relative transition-colors duration-300`}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <SyntaxHighlighter
          language="solidity"
          style={syntaxStyle}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            backgroundColor: "transparent", // Fixed: using backgroundColor instead of background
            fontSize: "0.85rem",
            lineHeight: "1.6",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: isDark ? "#334155" : "#94a3b8", // Darker grey for light mode line numbers
            textAlign: "right",
            borderRight: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
            marginRight: "1em",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 bg-base-200 border-t border-base-300 flex items-center px-4 justify-between text-sm font-pixel text-base-content/40 uppercase tracking-widest"></div>
    </div>
  );
};
