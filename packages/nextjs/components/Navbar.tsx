"use client";

import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Wallet, LogOut, Network, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { chains, switchChain } = useSwitchChain();
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNetworkDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNetworkSwitch = (chainId: number) => {
    switchChain({ chainId });
    setIsNetworkDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-[150px]">
              {/* Logo for Light Mode (Dark Text) */}
              <Image
                src="/logo_light.svg"
                alt="Fhenix Logo"
                fill
                className="object-contain theme-logo-light"
                priority
              />
              {/* Logo for Dark Mode (White Text) */}
              <Image
                src="/fhenix_logo_dark.svg"
                alt="Fhenix Logo"
                fill
                className="object-contain theme-logo-dark"
                priority
              />
            </div>
          </div>

          {/* Right side - Network & Wallet */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Network Selector */}
            {isConnected && chain && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsNetworkDropdownOpen(!isNetworkDropdownOpen)
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-base-200 border border-base-300 hover:border-primary rounded-sm transition-all group"
                >
                  <Network className="w-4 h-4 text-primary" />
                  <span className="text-base-content text-sm font-medium hidden sm:inline">
                    {chain.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-base-content/50 transition-transform ${
                      isNetworkDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Network Dropdown */}
                {isNetworkDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-base-100 border border-base-300 rounded-sm shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-base-300 bg-base-200">
                      <p className="text-[9px] font-pixel text-base-content/50 uppercase tracking-widest">
                        {"// Select Network"}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {chains.map((availableChain) => (
                        <button
                          key={availableChain.id}
                          onClick={() => handleNetworkSwitch(availableChain.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors ${
                            chain.id === availableChain.id
                              ? "bg-primary/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                chain.id === availableChain.id
                                  ? "bg-primary"
                                  : "bg-base-content/30"
                              }`}
                            />
                            <span className="text-base-content text-sm font-medium">
                              {availableChain.name}
                            </span>
                          </div>
                          {chain.id === availableChain.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Connection */}
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary rounded-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-base-content text-sm font-mono hidden sm:inline">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="p-2 bg-base-200 border border-base-300 hover:border-red-500 hover:bg-red-500/10 rounded-sm transition-all group"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4 text-base-content/50 group-hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openConnectModal?.()}
                className="flex items-center gap-2 px-4 py-2 btn-fhenix font-bold rounded-sm font-display uppercase text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
