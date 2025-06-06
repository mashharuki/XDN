import * as dotenv from "dotenv";
import {ethers, Wallet} from "ethers";
import {config} from "hardhat";
import QRCode from "qrcode";
dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.log(
      "🚫️ You don't have a deployer account. Run `yarn generate` first"
    );
    return;
  }

  // Get account from private key.
  const wallet = new Wallet(privateKey);
  const address = wallet.address;
  console.log(await QRCode.toString(address, {type: "terminal", small: true}));
  console.log("Public address:", address, "\n");

  // Balance on each network
  const availableNetworks = config.networks;
  for (const networkName in availableNetworks) {
    try {
      const network = availableNetworks[networkName];
      if (!("url" in network)) continue;
      const provider = new ethers.JsonRpcProvider(network.url);
      await provider._detectNetwork();
      const balance = await provider.getBalance(address);
      console.log("--", networkName, "-- 📡");
      console.log("   balance:", +ethers.formatEther(balance));
      console.log("   nonce:", +(await provider.getTransactionCount(address)));
    } catch (e) {
      console.log("Can't connect to network", networkName);
      console.error("error:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
