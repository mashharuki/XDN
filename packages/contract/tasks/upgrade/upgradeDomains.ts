import "dotenv/config";
import {task} from "hardhat/config";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {loadDeployedContractAddresses} from "../../helper/contractsJsonHelper";

task("upgradeDomains", "upgrade Domains Contract")
  .addParam("newcontract", "Name of New Contract")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "===================================== [START] ===================================== "
    );

    // get Contract Address
    const {
      contracts: {Domains, SampleForwarder},
    } = loadDeployedContractAddresses(hre.network.name);

    try {
      // get new contract factory
      const NewContract = await hre.ethers.getContractFactory(
        taskArgs.newcontract
      );
      // update contract via proxy
      const newContract = await hre.upgrades.upgradeProxy(
        Domains,
        NewContract as any,
        {
          constructorArgs: [SampleForwarder],
        }
      );

      console.log("Upgraded Contract address:", await newContract.getAddress());

      console.log(
        "===================================== [END] ===================================== "
      );
    } catch (e) {
      console.error("err:", e);
    }
  });
