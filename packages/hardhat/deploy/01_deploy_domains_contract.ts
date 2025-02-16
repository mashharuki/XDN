import {Contract} from "ethers";
import {ethers, upgrades} from "hardhat";
import {DeployFunction} from "hardhat-deploy/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {writeContractAddress} from "../helper/contractsJsonHelper";

const deployDomainsContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  console.log(
    "===================================== [START] ===================================== "
  );
  // get deployment accounts data
  const {deployer} = await hre.getNamedAccounts();
  const {deploy} = hre.deployments;

  // Deploy SampleForwarder contract
  await deploy("SampleForwarder", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const forwarder = await hre.ethers.getContract<Contract>(
    "SampleForwarder",
    deployer
  );

  // Top Level Domain
  const tld = "xenea";

  // deploy Domains contract via upgradeable proxy contact
  const Domains = await ethers.getContractFactory("Domains");
  // deploy
  const domains = await upgrades.deployProxy(Domains, [tld, deployer], {
    initializer: "initialize",
    constructorArgs: [forwarder.target],
  });

  console.log(`Domains Contract is deployed: ${domains.target}`);

  // write Contract Address
  writeContractAddress({
    group: "contracts",
    name: "Domains",
    value: await domains.getAddress(),
    network: hre.network.name,
  });

  writeContractAddress({
    group: "contracts",
    name: "SampleForwarder",
    value: await forwarder.getAddress(),
    network: hre.network.name,
  });

  console.log(
    "===================================== [END] ===================================== "
  );
};

export default deployDomainsContract;

deployDomainsContract.tags = ["Domains"];
