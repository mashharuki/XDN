import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import { intmaxwalletsdk } from "intmax-walletsdk/rainbowkit";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig;

const additionalWallets = [
  intmaxwalletsdk({
    wallet: {
      url: "https://wallet.intmax.io",
      name: "INTMAX Wallet",
      iconUrl: "https://wallet.intmax.io/favicon.ico",
    },
    metadata: {
      name: "INTMAX Wallet",
      description: "INTMAX Wallet",
      icons: ["https://wallet.intmax.io/favicon.ico"],
    },
  }),
];

// Wallets
const wallets = [
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  ...(!targetNetworks.some(network => network.id !== (chains.hardhat as chains.Chain).id) || !onlyLocalBurnerWallet
    ? [rainbowkitBurnerWallet]
    : []),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "IntmaxWallet",
      wallets: additionalWallets,
    },
    {
      groupName: "Other Wallets",
      wallets,
    },
  ],
  {
    appName: "Xenea Domain Name Service",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
