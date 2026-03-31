# Task Completion Checklist for XDN

After completing any task, run the following as appropriate:

## Contract Changes
1. `yarn contract compile` - Verify contracts compile without errors
2. `yarn contract test` - Run all Hardhat tests
3. `yarn contract lint` - Lint TypeScript/Solidity files
4. `yarn contract format` - Format code with Prettier

## Frontend Changes
1. `yarn frontend lint` - Run ESLint
2. `yarn frontend check-types` - TypeScript type check
3. `yarn frontend format` - Format with Prettier
4. `yarn frontend build` - Verify production build succeeds

## General
- `yarn format` - Format both frontend and contract
- Ensure pre-commit hooks pass (husky + lint-staged handles this automatically)
