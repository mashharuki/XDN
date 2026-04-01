# XDN - Xenea Domain Name Service

## Purpose
XDN (Xenea Domain Name Service) simplifies Ethereum addresses (0x...) into human-readable strings, similar to ENS (Ethereum Name Service). Domains are minted as NFTs (ERC721) on the Xenea/CrossValue Chain.

## Project Structure
This is a **Yarn monorepo** (Yarn v3 workspaces) with 3 packages:
- `packages/contract` (`@se-2/hardhat`) - Solidity smart contracts (Hardhat)
- `packages/frontend` (`@se-2/nextjs`) - Next.js frontend
- `packages/cdk` (`@se-2/cdk`) - AWS CDK infrastructure

## Tech Stack
- **Language**: TypeScript + Solidity
- **Contract**: Hardhat, OpenZeppelin (ERC721 upgradeable), ethers v6, hardhat-deploy
- **Frontend**: Next.js 14, React 18, wagmi v2, RainbowKit, Tailwind CSS, DaisyUI, viem
- **Infrastructure**: AWS CDK
- **Network**: CrossValue Chain (Xenea testnet: "kura")

## Code Style
- Prettier for formatting (`.prettierrc.json` at root and in frontend)
- ESLint for linting (`.eslintrc.json` per package)
- husky + lint-staged for pre-commit hooks
- TypeScript strict mode
