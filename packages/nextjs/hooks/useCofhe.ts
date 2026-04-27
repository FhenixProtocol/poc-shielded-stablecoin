"use client";

import { useEffect, useState } from "react";
import { FheTypes, Encryptable } from "@cofhe/sdk";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { cofheClient } from "@/services/cofhe-client";
import { useCofheStore } from "@/services/store/cofheStore";

export function useCofhe() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const {
    isInitialized: globalIsInitialized,
    setIsInitialized: setGlobalIsInitialized,
  } = useCofheStore();

  const chainId = publicClient?.chain?.id;
  const accountAddress = walletClient?.account?.address;

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Reset connection when chain or account changes
  useEffect(() => {
    setGlobalIsInitialized(false);
  }, [chainId, accountAddress, setGlobalIsInitialized]);

  // Connect when wallet is ready
  useEffect(() => {
    if (!isConnected || !publicClient || !walletClient) return;
    if (globalIsInitialized || isInitializing) return;

    const connect = async () => {
      try {
        setIsInitializing(true);
        await cofheClient.connect(publicClient as never, walletClient as never);
        setGlobalIsInitialized(true);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to connect CoFHE client")
        );
      } finally {
        setIsInitializing(false);
      }
    };

    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletClient, publicClient, chainId, accountAddress]);

  return {
    isInitialized: globalIsInitialized,
    isInitializing,
    error,
    cofheClient,
    FheTypes,
    Encryptable,
  };
}

export { FheTypes, Encryptable } from "@cofhe/sdk";
