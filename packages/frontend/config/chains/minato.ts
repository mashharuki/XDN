import * as chains from "viem/chains";

/**
 * Sonuiem Minato network config
 */
export const minato: chains.Chain = {
  id: 1946,
  name: "Sonuiem Minato",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://rpc.minato.soneium.org/"] },
  },
  blockExplorers: {
    default: {
      name: "Soneium Blockscout",
      url: "https://soneium-minato.blockscout.com/",
    },
  },
};
