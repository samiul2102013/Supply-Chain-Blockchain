# AI Coding Agent Instructions - Supply Chain Blockchain DApp

## Architecture Overview

This is a **blockchain-based supply chain management system** with a clear separation:
- **Backend** (`backend/`): Hardhat-based Ethereum development environment with Solidity smart contracts
- **Frontend** (`client/`): Next.js 14 App Router with TypeScript, Tailwind CSS, and Web3.js

The architecture follows a **decentralized model**: Next.js frontend → Web3.js → MetaMask → Ethereum (Ganache local) → SupplyChain.sol smart contract. The contract is the single source of truth; the frontend has no backend API server.

### Key Components
- **Smart Contract** ([backend/contracts/SupplyChain.sol](backend/contracts/SupplyChain.sol)): Role-based supply chain with 5 stages (Init → RawMaterialSupply → Manufacture → Distribution → Retail → Sold)
- **Web3 Integration** ([client/src/lib/web3.ts](client/src/lib/web3.ts)): Handles MetaMask connection, network switching, and contract instance creation
- **Contract Utilities** ([client/src/lib/contractUtils.ts](client/src/lib/contractUtils.ts)): Helper functions for owner checks
- **Deployment State** ([client/src/deployments.json](client/src/deployments.json)): Maps network chainId to deployed contract addresses

## Critical Developer Workflows

### Smart Contract Development
```bash
# From backend/ directory:
npm run compile          # Compile contracts, generates typechain-types/
npm run deploy:ganache   # Deploy to Ganache (updates client/src/deployments.json)
npm run deploy:local     # Deploy to Hardhat node
npm run node             # Start local Hardhat node
```

**Artifact Generation Flow**: Compilation outputs to `backend/client/src/artifacts/` (note the nested path in [hardhat.config.ts](backend/hardhat.config.ts) `paths.artifacts`). The frontend imports from `client/src/artifacts/` which should match this path.

### Frontend Development
```bash
# From client/ directory:
npm run dev    # Start Next.js dev server on localhost:3000
npm run build  # Production build
```

**Web3 Connection Pattern**: Every page calls `loadWeb3()` → `getContract()` which returns `{ contract, account, web3 }`. Always handle network mismatch errors from [getContract()](client/src/lib/web3.ts) - it throws detailed errors with available networks.

## Project-Specific Conventions

### Role-Based Access Control
The contract enforces strict roles via Ethereum addresses:
- **Owner**: Only address that deployed the contract (checked via `onlyByOwner` modifier)
- **RMS/MAN/DIS/RET**: Must be registered by owner before they can perform actions

**Frontend Pattern**: All role management pages ([roles/page.tsx](client/src/app/roles/page.tsx)) check `isOwner` state using [checkIsOwner()](client/src/lib/contractUtils.ts). Display different UI for owner vs non-owner.

### Supply Chain State Machine
Products progress linearly through stages. Each transition function **validates previous stage**:
```solidity
// Example: Manufacturing can only occur after RawMaterialSupply
require(ProductStock[_productID].stage == STAGE.RawMaterialSupply);
```

**Frontend Implication**: The [supply/page.tsx](client/src/app/supply/page.tsx) shows stage-specific forms. When calling contract methods like `RMSsupply()`, `Manufacturing()`, handle reverts for wrong stage/unauthorized user.

### Error Handling Pattern
Smart contract calls return transaction receipts. Pages use this pattern:
```typescript
try {
  const receipt = await supplyChain.methods.methodName(args).send({ from: currentAccount })
  if (receipt) {
    loadBlockchainData()  // Refresh state
    alert('Success message')
  }
} catch (err: any) {
  // Extract error from err.message or err.error.message
  alert(errorMessage)
}
```

Always refresh data after successful transactions since blockchain state changed.

### Network Configuration
Ganache can use chainId `1337` or `5777` (see [hardhat.config.ts](backend/hardhat.config.ts) networks). The [deployments.json](client/src/deployments.json) keys match these chainIds. When MetaMask is on wrong network, [web3.ts](client/src/lib/web3.ts) throws error listing available networks.

**Adding New Networks**: 
1. Update `hardhat.config.ts` networks section
2. Deploy with `--network <name>`
3. Contract address auto-updates in [deployments.json](client/src/deployments.json)
4. MetaMask can auto-add network via [switchToNetwork()](client/src/lib/web3.ts)

## Integration Points

### Contract ↔ Frontend Data Flow
1. **Reading State**: Use `.call()` for view functions (free, no gas)
   ```typescript
   const count = await contract.methods.productCtr().call()
   ```
2. **Writing State**: Use `.send({ from: account })` for transactions (costs gas)
   ```typescript
   await contract.methods.addProduct(name, desc).send({ from: currentAccount })
   ```

### TypeChain Types
After `npm run compile`, TypeScript types generate in [backend/typechain-types/](backend/typechain-types/). Use these for type-safe contract interaction if importing from backend to frontend.

### Artifact Import Pattern
The frontend imports contract ABIs from [lib/contracts.ts](client/src/lib/contracts.ts):
```typescript
import SupplyChainArtifact from '../artifacts/contracts/SupplyChain.sol/SupplyChain.json'
```
The ABI (`.abi` property) is passed to `web3.eth.Contract` constructor. **Do not modify artifacts manually** - always regenerate via compilation.

## Common Pitfalls

1. **Ganache Not Running**: `getContract()` will timeout. Check Ganache is on correct port (7545/8545) matching hardhat.config.ts
2. **Wrong MetaMask Network**: Error lists available networks from deployments.json. Manually switch MetaMask to the correct network (chainId 1337 for Ganache)
3. **Insufficient Roles**: Contract requires at least 1 of each role before `addProduct()`. Check counters: `rmsCtr`, `manCtr`, etc.
4. **Stage Progression**: Cannot skip stages. If Manufacturing fails, check product is in RawMaterialSupply stage first
5. **Owner-Only Actions**: Many functions have `onlyByOwner` modifier. Non-owner calls will revert

## Page-Specific Logic

- **[page.tsx](client/src/app/page.tsx)**: Landing page with supply chain flow visualization, no contract interaction
- **[roles/page.tsx](client/src/app/roles/page.tsx)**: Owner-only role registration. Displays all registered participants by type
- **[addmed/page.tsx](client/src/app/addmed/page.tsx)**: Owner-only product creation (note: variable names use "medicine" terminology but applies to any product)
- **[supply/page.tsx](client/src/app/supply/page.tsx)**: Stage-specific forms for RMS/MAN/DIS/RET to progress products. Non-owner page
- **[track/page.tsx](client/src/app/track/page.tsx)**: Public product tracking by ID with QR code generation

## Development Environment

- **Node.js**: 18+ required for both backend and frontend
- **Ganache**: Personal blockchain, typically on `http://127.0.0.1:7545` with chainId 1337 or 5777
- **MetaMask**: Import Ganache account using private key from Ganache UI
- **Solidity Version**: 0.8.19 (specified in hardhat.config.ts and contract pragma)

When making changes to the smart contract, follow: Edit contract → `npm run compile` → `npm run deploy:ganache` → Verify deployments.json updated → Restart Next.js dev server to pick up new artifacts.
