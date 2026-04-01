# Suggested Commands for XDN

## Root-level (run from project root `/Users/harukikondo/git/XDN`)

```bash
# Format all code
yarn format

# Install dependencies
yarn install
```

## Contract (`packages/contract`)

```bash
# Setup (reset contract addresses)
yarn contract setup --network kura

# Compile contracts
yarn contract compile

# Run tests
yarn contract test

# Deploy to kura testnet
yarn contract deploy --network kura

# Register domain
yarn contract task:register --name <name> --amount 0.001 --year 1 --network kura

# Gasless register
yarn contract task:gaslessRegister --name <name> --year 1 --network kura

# Check domain price
yarn contract task:price --name <name> --year 1 --network kura

# Set record data
yarn contract task:setRecord --name <name> --record <data> --network kura

# Withdraw
yarn contract task:withdraw --network kura

# Get tokenURI
yarn contract task:getTokenURI --tokenid 0 --network kura

# Check registration status
yarn contract task:checkRegistered --name <name> --network kura

# Upgrade contract
yarn contract task:upgradeDomains --newcontract DomainsV2 --network kura

# Batch register
yarn contract task:batchRegister --file sample.csv --network kura

# Add whitelist
yarn contract task:addToWhitelist --file sample.csv --network kura

# Free mint
yarn contract task:freeMint --name <name> --year 1 --network kura

# Lint
yarn contract lint

# Format
yarn contract format
```

## Frontend (`packages/frontend`)

```bash
# Start dev server
yarn frontend dev

# Build
yarn frontend build

# Lint
yarn frontend lint

# Format
yarn frontend format

# Type check
yarn frontend check-types

# Deploy to Vercel
yarn frontend vercel
```

## CDK (`packages/cdk`)

```bash
# Deploy CDK stack
yarn cdk deploy

# Destroy CDK stack
yarn cdk destroy '*' --force
```
