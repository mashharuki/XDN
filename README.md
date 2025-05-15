# 🏗 Xenea Domain Name Service (XDN)

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/xdn)

[![Lint & Test Smart Contracts](https://github.com/mashharuki/XDN/actions/workflows/lint.yaml/badge.svg)](https://github.com/mashharuki/XDN/actions/workflows/lint.yaml)

![](./docs/banner.png)

---

## About XDN

The Xenea Domain Name Service simplifies the ethereal address, which is a long string of alphanumeric characters starting with "0x," to make it easier to remember and simpler to use as a string of characters(like **ENS**).

The Xenea Domain is minted as NFT(ERC721).

## how to work

### Contract

- **setup**

  ```bash
  yarn contract setup --network kura
  ```

- **test**

  ```bash
  yarn contract test
  ```

- **compile contract**

  ```bash
  yarn contract compile
  ```

- **deploy to kura**

  ```bash
  yarn contract deploy --network kura
  ```

- **register new domain**

  ```bash
  yarn contract task:register --name cdn --amount 0.001 --year 1 --network kura
  ```

- **gasless register new domain**

  ```bash
  yarn contract task:gaslessRegister --name cdn2 --year 1 --network kura
  ```

- **check price of new domain name**

  ```bash
  yarn contract task:price --name test --year 1 --network kura
  ```

- **set record data**

  ```bash
  yarn contract task:setRecord --name cdn --record sample --network kura
  ```

- **withdraw from domains contract**

  ```bash
  yarn contract task:withdraw --network kura
  ```

- **get tokenId's tokenURI**

  ```bash
  yarn contract task:getTokenURI --tokenid 0 --network kura
  ```

- **check dmain name registered status**

  ```bash
  yarn contract task:checkRegistered --name cdn --network kura
  ```

- **upgrade Contract**

  ```bash
  yarn contract task:upgradeDomains --newcontract DomainsV2 --network kura
  ```

- **batch register (Please upgrade before execute this task)**

  ```bash
  yarn contract task:batchRegister --file sample.csv --network kura
  ```

- **add new whitelist**

  ```bash
  yarn contract task:addToWhitelist --file sample.csv --network kura
  ```

- **free mint**

  ```bash
  yarn contract task:freeMint --name cdn --year 1 --network kura
  ```

### Frontend

- **build Frontend**

  ```bash
  yarn frontend build
  ```

- **start Frontend**

  ```bash
  yarn frontend dev
  ```

### CDK

- **deploy CDK Stack**

  ```bash
  yarn cdk deploy
  ```

- **destroy CDK Stack**

  ```bash
  yarn cdk destroy '*' --force
  ```

### 参考文献

1. [テストネット BlockExplorer](https://testnet.crossvaluescan.com/)
2. [Hardhat CrossValueChain Docs](https://docs.crossvalue.io/testnet/how-to-deploy-to-smart-contracts-hardhat)
3. [GitHub - ensdomains/ens-contracts](https://github.com/ensdomains/ens-contracts/tree/staging)
4. [ENS Dapp](https://app.ens.domains/unsupportedNetwork)
5. [ENS Docs](https://docs.ens.domains/registry/eth)
6. [daisyui Docs](https://daisyui.com/docs/themes)
7. [daisyui Next.js Example](https://stackblitz.com/edit/daisyui-nextjs?file=app%2Fpage.jsx)
8. [GitHub - Central-Data-Hub](https://github.com/cardene777/Central-Data-Hub)
9. [GitHub - Xenea-Indexer-Template](https://github.com/cardene777/Xenea-Indexer-Template)
10. [rindexer](https://rindexer.xyz/docs/introduction/installation)
11. [GitHub - rindexer](https://github.com/joshstevens19/rindexer)
