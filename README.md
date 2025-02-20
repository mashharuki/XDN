# 🏗 Xenea Domain Name Service (XDN)

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/cdn-nextjs)

[![Lint & Test Smart Contracts](https://github.com/mashharuki/CDN/actions/workflows/lint.yaml/badge.svg)](https://github.com/mashharuki/CDN/actions/workflows/lint.yaml)

![](./docs/banner.png)

---

## About XDN

The Xenea Domain Name Service simplifies the ethereal address, which is a long string of alphanumeric characters starting with "0x," to make it easier to remember and simpler to use as a string of characters(like **ENS**).

The Xenea Domain is minted as NFT(ERC721).

## how to work

### Contract

- setup

  ```bash
  yarn setup --network kura
  ```

- test

  ```bash
  yarn test
  ```

- compile contract

  ```bash
  yarn hardhat:compile
  ```

- deploy to kura

  ```bash
  yarn deploy --network kura
  ```

- register new domain

  ```bash
  yarn hardhat:register --name cdn --amount 0.001 --year 1 --network kura
  ```

- gasless register new domain

  ```bash
  yarn hardhat:gaslessRegister --name cdn2 --year 1 --network kura
  ```

- check price of new domain name

  ```bash
  yarn hardhat:price --name test  --network kura
  ```

- set record data

  ```bash
  yarn hardhat:setRecord --name cdn --record sample --network kura
  ```

- withdraw from domains contract

  ```bash
  yarn hardhat:withdraw --network kura
  ```

- get tokenId's tokenURI

  ```bash
  yarn hardhat:getTokenURI --tokenid 0 --network kura
  ```

- check dmain name registered status

  ```bash
  yarn hardhat:checkRegistered --name cdn --network kura
  ```

### Frontend

- build Frontend

  ```bash
  yarn next:build
  ```

- start Frontend

  ```bash
  yarn start
  ```

### CDK

- deploy CDK Stack

  ```bash
  yarn cdk deploy
  ```

- destroy CDK Stack

  ```bash
  yarn cdke destroy '*' --force
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
