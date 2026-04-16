import { createCofheConfig, createCofheClient } from "@cofhe/sdk/web";
import { chains } from "@cofhe/sdk/chains";

type CofheClientInstance = ReturnType<typeof createCofheClient>;

let _instance: CofheClientInstance | null = null;

function createInstance(): CofheClientInstance {
  const config = createCofheConfig({
    supportedChains: [chains.arbSepolia, chains.baseSepolia, chains.sepolia],
  });
  return createCofheClient(config);
}

// Lazy singleton — only created in browser environment to avoid SSR issues
export function getCofheClient(): CofheClientInstance {
  if (typeof window === "undefined") {
    throw new Error("CoFHE client is only available in browser context");
  }
  if (!_instance) {
    _instance = createInstance();
  }
  return _instance;
}

// Convenience accessor — safe to use inside "use client" components/hooks
export const cofheClient = new Proxy({} as CofheClientInstance, {
  get(_target, prop) {
    return getCofheClient()[prop as keyof CofheClientInstance];
  },
});
