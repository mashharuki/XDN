import * as chains from "viem/chains";

/**
 * Xenea testnet config
 */
export const xeneaTestnet: chains.Chain = {
  id: 5555,
  name: "Xenea Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "XCR",
    symbol: "XCR",
  },
  rpcUrls: {
    default: { http: ["https://rpc-kura.cross.technology"] },
  },
  blockExplorers: {
    default: {
      name: "XeneaScan",
      url: "https://testnet.crossvaluescan.com/",
    },
  },
};
