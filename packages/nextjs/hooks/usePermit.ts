"use client";

import { useState, useCallback } from "react";
import { cofheClient } from "@/services/cofhe-client";
import { useCofheStore } from "@/services/store/cofheStore";

export function usePermit() {
  const { isInitialized: isCofheInitialized, permitVersion, bumpPermitVersion } = useCofheStore();

  const [isGeneratingPermit, setIsGeneratingPermit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasValidPermit = isCofheInitialized
    ? !!cofheClient.permits.getActivePermit()
    : false;

  const generatePermit = useCallback(async () => {
    if (!isCofheInitialized || isGeneratingPermit) {
      return { success: false, error: "CoFHE not ready" };
    }

    try {
      setIsGeneratingPermit(true);
      setError(null);

      await cofheClient.permits.getOrCreateSelfPermit();
      bumpPermitVersion();
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create permit";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsGeneratingPermit(false);
    }
  }, [isCofheInitialized, isGeneratingPermit, bumpPermitVersion]);

  const removePermit = useCallback(async () => {
    if (!isCofheInitialized) return false;

    try {
      const activePermit = cofheClient.permits.getActivePermit();
      if (!activePermit?.hash) return false;

      cofheClient.permits.removePermit(activePermit.hash);
      bumpPermitVersion();
      return true;
    } catch (err) {
      console.error("Error removing permit:", err);
      return false;
    }
  }, [isCofheInitialized, bumpPermitVersion]);

  const checkPermit = useCallback(() => {
    if (!isCofheInitialized) return false;
    return !!cofheClient.permits.getActivePermit();
  }, [isCofheInitialized]);

  // Suppress unused var warning — permitVersion is read to force re-renders
  void permitVersion;

  return {
    hasValidPermit,
    isGeneratingPermit,
    error,
    generatePermit,
    checkPermit,
    removePermit,
  };
}
