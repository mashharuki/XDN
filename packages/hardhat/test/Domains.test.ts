import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers, upgrades} from "hardhat";
import {ForwardRequest} from "../lib/types";
import {SampleForwarder, SampleForwarder__factory} from "../typechain-types";

describe("Domains", function () {
  /**
   * deploy Contract function
   * @returns
   */
  async function deployContract() {
    const accounts = await ethers.getSigners();
    const account1: HardhatEthersSigner = accounts[0];
    const account2: HardhatEthersSigner = accounts[1];
    // console.log(accounts);
    // deploy Forwarder Contract
    const SampleForwarder: SampleForwarder__factory =
      await ethers.getContractFactory("SampleForwarder");
    const forwarder: SampleForwarder = await SampleForwarder.deploy();
    // console.log(`Forwarder Contract is deployed: ${forwarder.target}`);
    await forwarder.waitForDeployment();
    // deploy Domains contract via upgradeable proxy contract
    const Domains = await ethers.getContractFactory("Domains");
    // deploy
    const domains = await upgrades.deployProxy(
      Domains,
      ["xenea", account1.address as `0x${string}`],
      {
        initializer: "initialize",
        constructorArgs: [forwarder.target],
      }
    );
    await domains.waitForDeployment();

    // console.log(`Domains Contract is deployed: ${domains.target}`);

    return {domains, forwarder, account1, account2};
  }

  /**
   * タイプスタンプをyyyy/mm/dd形式に変換するメソッド
   */
  /*
  const formatUnixTimestampBigInt = (timestamp: bigint): string => {
    // Unix タイムスタンプをミリ秒に変換
    const milliseconds = Number(timestamp) * 1000;
    const date = new Date(milliseconds);

    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので +1
    const day = ("0" + date.getDate()).slice(-2);

    return `${year}/${month}/${day}`;
  };
  */

  describe("Deployment", function () {
    it("Should have the right balance on deploy", async function () {
      const {domains} = await deployContract();

      const balance = await ethers.provider.getBalance(domains.target);
      const currentBalance = ethers.formatEther(balance);
      expect(currentBalance).to.equal("0.0");
    });

    it("check owner addrss", async function () {
      const {domains, account1} = await deployContract();
      const owner = await domains.owner();
      expect(account1.address).to.equal(owner);
    });

    it("check forwarder addrss", async function () {
      const {domains, forwarder} = await deployContract();
      expect(true).to.equal(await domains.isTrustedForwarder(forwarder.target));
    });
  });

  describe("Register", function () {
    it("Check Register function", async function () {
      const {domains, account1} = await deployContract();
      // priceを取得
      const price = await domains.price("haruki", 2);
      const txn = await domains
        .connect(account1)
        .register(account1.address, "haruki", 2, {
          value: ethers.parseEther(await ethers.formatEther(price)),
        });
      await txn.wait();

      const domainOwner = await domains.domains("haruki");
      expect(domainOwner).to.equal(account1.address);

      const balance = await ethers.provider.getBalance(domains.target);
      const currentBalance = ethers.formatEther(balance);
      expect(currentBalance).to.equal("0.005");
    });

    it("Check Register × 2 function", async function () {
      const {domains, account1, account2} = await deployContract();
      // priceを取得
      const price = await domains.price("haruki2", 2);
      const txn = await domains.register(account1.address, "haruki2", 2, {
        value: ethers.parseEther(await ethers.formatEther(price)),
      });
      await txn.wait();

      // priceを取得
      const price2 = await domains.price("haruki3", 2);
      const txn2 = await domains
        .connect(account2)
        .register(account2.address, "haruki3", 2, {
          value: ethers.parseEther(await ethers.formatEther(price2)),
        });
      await txn2.wait();

      const domainOwner = await domains.domains("haruki3");
      expect(domainOwner).to.equal(account2.address);

      const balance = await ethers.provider.getBalance(domains.target);
      const currentBalance = ethers.formatEther(balance);
      expect(currentBalance).to.equal("0.01");
    });

    it("get DomainsByOwner after Register × 2 function", async function () {
      const {domains, account1} = await deployContract();
      // priceを取得
      const price = await domains.price("haruki2", 2);
      const txn = await domains.register(account1.address, "haruki2", 2, {
        value: ethers.parseEther(await ethers.formatEther(price)),
      });
      await txn.wait();

      // priceを取得
      const price2 = await domains.price("haruki3", 2);
      const txn2 = await domains.register(account1.address, "haruki3", 2, {
        value: ethers.parseEther(await ethers.formatEther(price2)),
      });
      await txn2.wait();

      // get Domains By Owner
      const domainsByOwner = await domains.getDomainsByOwner(account1.address);
      expect(domainsByOwner.length).to.equal(2);
      expect(domainsByOwner[0]).to.equal("haruki2");
      expect(domainsByOwner[1]).to.equal("haruki3");
    });

    it("Withdraw", async function () {
      const {domains, account1} = await deployContract();
      // priceを取得
      const price = await domains.price("haruki4", 2);
      const txn = await domains
        .connect(account1)
        .register(account1.address, "haruki4", 2, {
          value: ethers.parseEther(await ethers.formatEther(price)),
        });
      await txn.wait();

      const domainOwner = await domains.domains("haruki4");
      expect(domainOwner).to.equal(account1.address);

      const balance = await ethers.provider.getBalance(domains.target);
      const currentBalance = ethers.formatEther(balance);
      expect(currentBalance).to.equal("0.005");

      await domains.withdraw();
      // check balance after withdraw
      const balance2 = await ethers.provider.getBalance(domains.target);
      const currentBalance2 = ethers.formatEther(balance2);
      expect(currentBalance2).to.equal("0.0");

      // get all names
      const allNames = await domains.getAllNames();
      expect(allNames.length).to.equal(1);
      expect(allNames[0]).to.equal("haruki4");
    });

    it("Should burn domain after expiration", async function () {
      const {domains, account1} = await deployContract();
      const price = await domains.price("expire", 1);
      const txn = await domains
        .connect(account1)
        .register(account1, "expire", 1, {
          value: ethers.parseEther(await ethers.formatEther(price)),
        });
      await txn.wait();

      const domainOwner = await domains.domains("expire");
      expect(domainOwner).to.equal(account1.address);
      // 1年経過させる。
      await time.increase(365 * 24 * 60 * 60 + 1);
      // check expired
      const txn2 = await domains.connect(account1).checkExpiration(0);
      await txn2.wait();
      // 所有状況を確認する。
      const expiredOwner = await domains.domains("expire");
      expect(expiredOwner).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Gasless Register", function () {
    it("gasless register", async function () {
      const {domains, forwarder, account1, account2} = await deployContract();
      // create encode function data
      const data = domains.interface.encodeFunctionData("register", [
        account1.address,
        "haruki5",
        2,
      ]);

      // get price
      const price = await domains.price("haruki5", 2);
      // get domain
      const domain = await forwarder.eip712Domain();
      // get deadline
      // get current blockchain timestamp
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTime = currentBlock!.timestamp;
      // set deadline to be 5 minutes in the future
      const futureTime = currentTime + 5 * 60; // 5 minutes in seconds
      const uint48Time = BigInt(futureTime) % 2n ** 48n;

      // create signature
      const signature = await account1.signTypedData(
        {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract,
        },
        {
          ForwardRequest: ForwardRequest,
        },
        {
          from: account1.address,
          to: domains.target,
          value: price.toString(),
          gas: 9000000n,
          nonce: await forwarder.nonces(account1.address),
          deadline: uint48Time,
          data: data,
        }
      );
      // create request data
      const request = {
        from: account1.address,
        to: domains.target,
        value: price.toString(),
        gas: 9000000n,
        nonce: await forwarder.nonces(account1.address),
        deadline: uint48Time,
        data: data,
        signature: signature,
      };

      console.log("uint48Time:", uint48Time);

      // オフチェーンで署名が合っているか確認する。
      const expectedSigner = ethers.verifyTypedData(
        {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract,
        },
        {
          ForwardRequest: ForwardRequest,
        },
        {
          from: account1.address,
          to: domains.target,
          value: price.toString(),
          gas: 9000000n,
          nonce: await forwarder.nonces(account1.address),
          deadline: uint48Time,
          data: data,
        },
        signature
      );
      // 署名者が期待通りか確認する。
      expect(expectedSigner).to.equal(account1.address);

      // check signature on chain before execute
      const verifyReslut = await forwarder.verify(request);
      expect(verifyReslut).to.equal(true);

      console.log("request:", request);

      // Fund the Forwarder contract with 0.001 ETH from account1
      await account1.sendTransaction({
        to: forwarder.target,
        value: price.toString(),
      });

      // execute
      /* */
      const tx = await forwarder.connect(account2).execute(request, {
        value: price.toString(),
      });

      await tx.wait();

      // Check the balance of account1 to ensure the NFT was minted
      const balance = await domains.balanceOf(account1.address);
      expect(balance).to.equal(1);
    });
  });
});
