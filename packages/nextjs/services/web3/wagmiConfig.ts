"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, sepolia, baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Shielded Stablecoin Wizard",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [arbitrumSepolia, baseSepolia, sepolia],
  ssr: true,
});
