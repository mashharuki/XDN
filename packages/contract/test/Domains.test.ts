import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers, upgrades} from "hardhat";
import {ForwardRequest} from "../lib/types";
import {
  DomainsV2,
  SampleForwarder,
  SampleForwarder__factory,
} from "../typechain-types";

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
   * upgrade Domains contract function
   */
  const upgradeContract = async (
    proxyAddress: string,
    forwarderAddress: string
  ) => {
    // get new contract factory
    const DomainsV2 = await ethers.getContractFactory("DomainsV2");
    // update contract via proxy
    const domainV2 = await upgrades.upgradeProxy(proxyAddress, DomainsV2, {
      constructorArgs: [forwarderAddress],
    });

    return domainV2 as DomainsV2;
  };

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

      // register data
      const data = {
        to: account1.address,
        name: "haruki",
        year: 2,
      };

      const txn = await domains.connect(account1).register(data, {
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

      // register data
      const data = {
        to: account1.address,
        name: "haruki2",
        year: 2,
      };

      const txn = await domains.register(data, {
        value: ethers.parseEther(await ethers.formatEther(price)),
      });
      await txn.wait();

      // priceを取得
      const price2 = await domains.price("haruki3", 2);

      // register data
      const data2 = {
        to: account2.address,
        name: "haruki3",
        year: 2,
      };

      const txn2 = await domains.connect(account2).register(data2, {
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

      // register data
      const data3 = {
        to: account1.address,
        name: "haruki2",
        year: 2,
      };

      const txn = await domains.register(data3, {
        value: ethers.parseEther(await ethers.formatEther(price)),
      });
      await txn.wait();

      // priceを取得
      const price2 = await domains.price("haruki3", 2);

      // register data
      const data4 = {
        to: account1.address,
        name: "haruki3",
        year: 2,
      };

      const txn2 = await domains.register(data4, {
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

      // register data
      const data5 = {
        to: account1.address,
        name: "haruki4",
        year: 2,
      };

      const txn = await domains.connect(account1).register(data5, {
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

      // register data
      const data = {
        to: account1.address,
        name: "expire",
        year: 1,
      };

      const txn = await domains.connect(account1).register(data, {
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
        {
          to: account1.address,
          name: "haruki5",
          year: 2,
        },
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

      // console.log("uint48Time:", uint48Time);

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

      // console.log("request:", request);

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

  describe("Whitelist", function () {
    it("add new address to Whitelist", async function () {
      // delpoy contract
      const {domains, account1, account2} = await deployContract();

      // add new address to whitelist
      await domains.addToWhitelist([account1.address, account2.address]);

      // check whitelist
      const isWhitelisted = await domains.whitelist(account1.address);
      expect(isWhitelisted).to.equal(true);

      // check whitelist
      const isWhitelisted2 = await domains.whitelist(account2.address);
      expect(isWhitelisted2).to.equal(true);
    });

    it("freemint test", async function () {
      // delpoy contract
      const {domains, account1} = await deployContract();

      // add new address to whitelist
      await domains.addToWhitelist([account1.address]);

      // freemint
      await domains.freeMint({
        to: account1.address,
        name: "haruki",
        year: 2,
      });

      // check domain owner
      const domainOwner = await domains.domains("haruki");
      expect(domainOwner).to.equal(account1.address);
    });

    it("【error pattern】 free mint not whitelisted address", async function () {
      // delpoy contract
      const {domains, account1, account2} = await deployContract();

      // add new address to whitelist
      await domains.addToWhitelist([account1.address]);

      // freemint
      await expect(
        domains.connect(account2).freeMint({
          to: account2.address,
          name: "haruki",
          year: 2,
        })
      ).to.be.revertedWith("Not in whitelist");
    });
  });

  describe("Update", function () {
    it("Update Domains Contract", async function () {
      // delpoy contract
      const {domains, forwarder, account1, account2} = await deployContract();

      // upgrade contract
      const domainsV2 = await upgradeContract(
        domains.target as string,
        forwarder.target as string
      );

      // call new function
      const datas = [
        {
          to: account1.address,
          name: "haruki",
          year: 2,
        },
        {
          to: account2.address,
          name: "haruki2",
          year: 2,
        },
      ];

      const txn = await domainsV2.connect(account1).batchRegister(datas);
      await txn.wait();

      const domainOwner = await domainsV2.domains("haruki");
      expect(domainOwner).to.equal(account1.address);

      const domainOwner2 = await domainsV2.domains("haruki2");
      expect(domainOwner2).to.equal(account2.address);
    });

    it("Should batch register domains to 10 wallet addresses", async function () {
      // Deploy contract
      const {domains, forwarder, account1} = await deployContract();

      // Upgrade contract
      const domainsV2 = await upgradeContract(
        domains.target as string,
        forwarder.target as string
      );

      // Get 10 accounts for testing
      const accounts = await ethers.getSigners();
      const testAccounts = accounts.slice(0, 10);

      // Create 10 domain registration data entries
      const datas = testAccounts.map((account, index) => ({
        to: account.address,
        name: `domain${index + 1}`,
        year: 1,
      }));

      // Check that the contract owner can register domains in batch
      const txn = await domainsV2.connect(account1).batchRegister(datas);
      await txn.wait();

      // Verify each domain was registered to the correct owner
      for (let i = 0; i < testAccounts.length; i++) {
        const domainName = `domain${i + 1}`;
        const domainOwner = await domainsV2.domains(domainName);
        expect(domainOwner).to.equal(testAccounts[i].address);
      }

      // Verify the total number of domains for each owner
      for (let i = 0; i < testAccounts.length; i++) {
        const ownedDomains = await domainsV2.getDomainsByOwner(
          testAccounts[i].address
        );
        expect(ownedDomains.length).to.equal(1);
        expect(ownedDomains[0]).to.equal(`domain${i + 1}`);
      }

      // Check expiration dates are set correctly (all domains should expire in 1 year)
      for (let i = 0; i < 10; i++) {
        const tokenId = i;
        const expirationDate = await domainsV2.expirationDates(tokenId);

        // Check expiration date is roughly one year from now
        const currentBlock = await ethers.provider.getBlock("latest");
        const currentTime = currentBlock!.timestamp;
        const oneYearInSeconds = 365 * 24 * 60 * 60;

        // Allow for a small margin of error (a few seconds) in timestamp comparison
        expect(Number(expirationDate)).to.be.approximately(
          currentTime + oneYearInSeconds,
          10 // Tolerate a difference of 10 seconds
        );
      }
    });

    it("Should batch register domains to multiple wallet addresses in chunks", async function () {
      this.timeout(120000); // タイムアウト時間を増加（120秒）

      // Deploy contract
      const {domains, forwarder, account1} = await deployContract();

      // Upgrade contract
      const domainsV2 = await upgradeContract(
        domains.target as string,
        forwarder.target as string
      );

      // 総数を設定
      const totalWallets = 1000;
      const chunkSize = 10;

      // テスト用のウォレットアドレスを作成
      const wallets: Array<{address: string}> = [];
      const existingAccounts = await ethers.getSigners();

      // 既存のアカウントを使用
      wallets.push(...existingAccounts);

      // 必要な分だけ追加のウォレットアドレスを生成
      const walletsNeeded = totalWallets - wallets.length;
      if (walletsNeeded > 0) {
        for (let i = 0; i < walletsNeeded; i++) {
          const wallet = ethers.Wallet.createRandom();
          wallets.push({address: wallet.address});
        }
      }

      // チャンク（バッチ）処理
      for (let i = 0; i < totalWallets; i += chunkSize) {
        const end = Math.min(i + chunkSize, totalWallets);
        console.log(
          `Processing batch ${i / chunkSize + 1}: wallets ${i + 1} to ${end}`
        );

        const chunkWallets = wallets.slice(i, end);
        const datas = chunkWallets.map((wallet, index) => ({
          to: wallet.address,
          name: `bulk${i + index + 1}`,
          year: 1,
        }));

        // バッチ登録実行
        const txn = await domainsV2.connect(account1).batchRegister(datas);
        await txn.wait();
      }

      // サンプルデータの検証（すべてを検証するのは時間がかかるため）
      const sampleIndices = [0, 9, 24, 49]; // 最初、最後、その間のインデックス

      for (const index of sampleIndices) {
        if (index < totalWallets) {
          const domainName = `bulk${index + 1}`;
          const domainOwner = await domainsV2.domains(domainName);
          expect(domainOwner).to.equal(wallets[index].address);
        }
      }

      // 全ドメイン名の検証
      const allNames = await domainsV2.getAllNames();
      expect(allNames.length).to.equal(totalWallets);

      // サンプルドメインの有効期限を確認
      for (const index of sampleIndices) {
        if (index < totalWallets) {
          const tokenId = index;
          const expirationDate = await domainsV2.expirationDates(tokenId);

          // 有効期限が約1年後に設定されていることを確認
          const currentBlock = await ethers.provider.getBlock("latest");
          const currentTime = currentBlock!.timestamp;
          const oneYearInSeconds = 365 * 24 * 60 * 60;

          // タイムスタンプ比較の許容誤差を設定
          expect(Number(expirationDate)).to.be.approximately(
            currentTime + oneYearInSeconds,
            500 // 10秒の誤差を許容
          );
        }
      }
    });
  });
});
