import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DeployedContract {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isShielded: boolean;
  deployer: string;
  chainId: number;
  transactionHash: string;
  deployedAt: number; // timestamp
}

interface DeployedContractsState {
  contracts: DeployedContract[];
  addContract: (contract: DeployedContract) => void;
  getContractsByDeployer: (deployer: string) => DeployedContract[];
  getContractsByChain: (chainId: number) => DeployedContract[];
  removeContract: (address: string) => void;
  clearAll: () => void;
}

export const useDeployedContractsStore = create<DeployedContractsState>()(
  persist(
    (set, get) => ({
      contracts: [],

      addContract: (contract: DeployedContract) =>
        set((state) => ({
          contracts: [contract, ...state.contracts],
        })),

      getContractsByDeployer: (deployer: string) => {
        return get().contracts.filter(
          (contract) =>
            contract.deployer.toLowerCase() === deployer.toLowerCase()
        );
      },

      getContractsByChain: (chainId: number) => {
        return get().contracts.filter(
          (contract) => contract.chainId === chainId
        );
      },

      removeContract: (address: string) =>
        set((state) => ({
          contracts: state.contracts.filter(
            (contract) =>
              contract.address.toLowerCase() !== address.toLowerCase()
          ),
        })),

      clearAll: () => set({ contracts: [] }),
    }),
    {
      name: "deployed-contracts-storage",
    }
  )
);
