# AGENTS.md — XDN (Xenea Domain Name Service)

This file provides AI agents (Copilot, Antigravity, Claude, etc.) with the context needed to contribute effectively to this repository.

---

## Project Overview

**XDN** is a decentralized domain name service built on the **CrossValue Chain (Xenea)**, similar to ENS (Ethereum Name Service). Users can register human-readable domain names (e.g., `alice.xdn`) that map to their wallet addresses. Each domain is minted as an **ERC721 NFT** with an on-chain SVG image and an expiration date.

### Key Features
- Domain registration with pricing based on name length (3/4/5+ chars)
- Gasless registration via ERC-2771 meta-transactions (trusted forwarder)
- UUPS upgradeable proxy pattern (OpenZeppelin)
- Whitelist-based free minting
- Domain expiration and burn mechanics
- AWS CDK infrastructure for backend support

---

## Repository Structure

```
XDN/
├── packages/
│   ├── contract/          # Solidity smart contracts (Hardhat)
│   │   ├── contracts/
│   │   │   ├── Domains.sol          # Main contract (ERC721 + UUPS + ERC2771)
│   │   │   ├── SampleForwarder.sol  # Meta-transaction forwarder
│   │   │   ├── lib/                 # StringUtils, Base64 libraries
│   │   │   ├── interfaces/          # Contract interfaces
│   │   │   └── mock/                # Mock contracts for testing
│   │   ├── deploy/        # hardhat-deploy scripts
│   │   ├── tasks/         # Hardhat custom tasks (xdn/, upgrade/, utils/)
│   │   ├── test/          # Mocha/Chai tests
│   │   ├── helper/        # Deploy helper utilities
│   │   └── hardhat.config.ts
│   ├── frontend/          # Next.js 14 frontend
│   │   ├── app/           # App Router pages (domains/, api/)
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API/contract interaction services
│   │   ├── utils/         # Utility functions
│   │   ├── contracts/     # ABI + address JSON (auto-generated)
│   │   └── config/        # Wagmi / chain configuration
│   └── cdk/               # AWS CDK infrastructure
│       ├── bin/           # CDK app entry point
│       ├── lib/           # CDK stack definitions
│       └── resources/     # Lambda functions, etc.
├── docs/                  # Project documentation and assets
├── package.json           # Root workspace configuration
└── AGENTS.md              # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.22, Hardhat, OpenZeppelin (upgradeable) |
| Contract Testing | Mocha, Chai, hardhat-chai-matchers |
| Contract Deployment | hardhat-deploy, UUPS proxy |
| Meta-transactions | ERC-2771 (ERC2771ContextUpgradeable) |
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Web3 Frontend | wagmi v2, viem, RainbowKit |
| UI Styling | Tailwind CSS v3, DaisyUI v4 |
| Package Manager | Yarn v3 (Workspaces) |
| Infrastructure | AWS CDK (TypeScript) |
| Target Network | CrossValue Chain / Xenea testnet ("kura") |

---

## Environment Variables

### Contract (`packages/contract/.env`)
```
DEPLOYER_PRIVATE_KEY=       # Wallet private key (without 0x prefix)
ALCHEMY_API_KEY=            # Alchemy API key (optional, for mainnet forking)
ETHERSCAN_API_KEY=          # Etherscan API key (optional, for verification)
```

### Frontend (`packages/frontend/.env.local`)
See `packages/frontend/.env.example` for required variables. Typically includes contract addresses and RPC URLs.

---

## Essential Commands

All commands are run from the **project root**.

### Contract

```bash
# Compile contracts
yarn contract compile

# Run tests (with gas report)
yarn contract test

# Deploy to kura testnet
yarn contract deploy --network kura

# Lint
yarn contract lint

# Format
yarn contract format

# Setup (reset contract address JSON)
yarn contract setup --network kura
```

### Hardhat Tasks (run from root)

```bash
# Register a domain
yarn contract task:register --name <name> --amount 0.001 --year 1 --network kura

# Gasless register (meta-transaction)
yarn contract task:gaslessRegister --name <name> --year 1 --network kura

# Check registration status
yarn contract task:checkRegistered --name <name> --network kura

# Get price
yarn contract task:price --name <name> --year 1 --network kura

# Set record data
yarn contract task:setRecord --name <name> --record <data> --network kura

# Free mint (whitelist required)
yarn contract task:freeMint --name <name> --year 1 --network kura

# Upgrade contract
yarn contract task:upgradeDomains --newcontract DomainsV2 --network kura

# Batch register from CSV
yarn contract task:batchRegister --file sample.csv --network kura

# Add addresses to whitelist (CSV)
yarn contract task:addToWhitelist --file sample.csv --network kura

# Withdraw contract balance
yarn contract task:withdraw --network kura
```

### Frontend

```bash
# Start dev server (http://localhost:3000)
yarn frontend dev

# Build for production
yarn frontend build

# Type check
yarn frontend check-types

# Lint
yarn frontend lint

# Format
yarn frontend format
```

### Infrastructure (CDK)

```bash
# Deploy all stacks
yarn cdk deploy

# Destroy all stacks
yarn cdk destroy '*' --force
```

### Root-level

```bash
# Format contract + frontend
yarn format
```

---

## Smart Contract Architecture

### `Domains.sol`

The main contract inherits from:
- `ERC721URIStorageUpgradeable` — NFT with on-chain metadata
- `OwnableUpgradeable` — Owner-only admin functions
- `UUPSUpgradeable` — Upgradeable proxy pattern
- `ERC2771ContextUpgradeable` — Gasless meta-transactions

**Key storage:**
| Variable | Type | Purpose |
|---|---|---|
| `domains` | `mapping(string => address)` | Domain name → owner address |
| `records` | `mapping(string => string)` | Domain name → record data |
| `names` | `mapping(uint => string)` | Token ID → domain name |
| `ownerDomains` | `mapping(address => string[])` | Owner → list of domains |
| `expirationDates` | `mapping(uint256 => uint256)` | Token ID → expiry timestamp |
| `whitelist` | `mapping(address => bool)` | Free mint eligibility |

**Pricing logic** (`price()` function):
- 3 chars: `0.001 XCR × years`
- 4 chars: `0.003 XCR × years`
- 5+ chars: `0.005 XCR × years`

**Domain constraints:** 3–10 characters (enforced by `valid()`)

---

## Code Style & Conventions

### Solidity
- Pragma: `>=0.8.19`, compiled at `0.8.22`
- Japanese comments are fine (existing codebase uses them)
- Use NatSpec (`/** @param ... */`) for public/external functions
- Custom errors preferred over `require` strings where possible
- Emit events for all state-changing operations
- Follow OpenZeppelin naming conventions for upgradeable contracts

### TypeScript (Contract & Frontend)
- Strict TypeScript mode enabled
- ESLint + Prettier enforced via pre-commit hooks (husky + lint-staged)
- Use `async/await` over callbacks
- Named exports preferred

### Frontend (React / Next.js)
- Next.js **App Router** (`app/` directory)
- Use `wagmi` hooks for all blockchain interactions
- DaisyUI component classes with Tailwind utility classes
- Keep components in `components/`, business logic in `services/` and `hooks/`

---

## Testing

### Contract Tests
```bash
yarn contract test
```
- Framework: Mocha + Chai + `hardhat-chai-matchers`
- Gas reporting auto-enabled (`REPORT_GAS=true`)
- Test files in `packages/contract/test/`

### When adding new contract features:
1. Write tests in `packages/contract/test/` first
2. Implement in `packages/contract/contracts/`
3. Add Hardhat task in `packages/contract/tasks/xdn/` if needed
4. Run full test suite before committing

---

## Deployment Workflow

1. **Compile**: `yarn contract compile`
2. **Test**: `yarn contract test`
3. **Deploy**: `yarn contract deploy --network kura`
   - Deploys using `hardhat-deploy` scripts in `packages/contract/deploy/`
   - Contract addresses auto-written to `packages/frontend/contracts/`
4. **Setup**: `yarn contract setup --network kura` (resets address JSON if needed)
5. **Verify**: `yarn contract hardhat-verify --network kura` (if supported)

---

## Important Notes for Agents

1. **Do not commit private keys or `.env` files.** The `.gitignore` excludes them, but always verify.
2. **Contract upgrades**: The `Domains` contract uses UUPS proxy. Always use `task:upgradeDomains` for upgrades — never redeploy the proxy directly.
3. **Meta-transactions**: The `register()` function returns half the paid amount to `msg.sender`. This is intentional for the gasless relayer flow.
4. **Network**: The primary testnet is `kura` (CrossValue Chain). RPC: `https://rpc-kura.cross.technology/`
5. **Frontend contract addresses**: Located in `packages/frontend/contracts/`. These are auto-generated from deployment and should not be edited manually.
6. **Yarn v3**: Use `yarn` (not `npm`). The `.yarnrc.yml` and `.yarn/` folder manage the Yarn Berry setup.
7. **Pre-commit hooks**: husky runs lint-staged automatically. Ensure `yarn contract lint` and `yarn frontend lint` pass before committing.
