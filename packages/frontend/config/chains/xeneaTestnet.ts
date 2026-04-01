import * as chains from "viem/chains";

/**
 * Xenea testnet config
 */
export const xeneaTestnet: chains.Chain = {
  id: 1096,
  name: "Xenea Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "TXENE",
    symbol: "TXENE",
  },
  rpcUrls: {
    default: { http: ["https://rpc-ubusuna.xeneascan.com"] },
  },
  blockExplorers: {
    default: {
      name: "XeneaScan",
      url: "https://ubusuna.xeneascan.com/",
    },
  },
};
