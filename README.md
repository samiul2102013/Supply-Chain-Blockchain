# 🔗 Supply Chain Blockchain DApp

<div align="center">

![Supply Chain Blockchain](https://www.mdpi.com/logistics/logistics-03-00005/article_deploy/html/images/logistics-03-00005-g001.png)

**A decentralized supply chain management system built on Ethereum blockchain using Solidity smart contracts, Next.js, and Web3.js**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-FFF1E2?logo=hardhat&logoColor=black)](https://hardhat.org/)

[⭐ Star](https://github.com/samiul2102013/Supply-Chain-Blockchain) • [🍴 Fork](https://github.com/samiul2102013/Supply-Chain-Blockchain/fork) • [🐛 Report Bug](https://github.com/samiul2102013/Supply-Chain-Blockchain/issues) • [💡 Request Feature](https://github.com/samiul2102013/Supply-Chain-Blockchain/issues)

</div>

---

<!--
## 🎥 Demo

Watch the demo video: [Canva Design Demo](https://www.canva.com/design/DAFb-i9v_cM/-fK0pKTuOkFq5dfCPQxh_w/watch?utm_content=DAFb-i9v_cM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink)
-->

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Usage Guide](#-usage-guide)
- [Smart Contract Details](#-smart-contract-details)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

**Supply Chain Blockchain DApp** is a comprehensive decentralized application that leverages blockchain technology to create a transparent, secure, and efficient supply chain management system. This project demonstrates how smart contracts can revolutionize traditional supply chain processes by eliminating paperwork, increasing transparency, and building a robust Root of Trust.

### Key Benefits

- ✅ **Transparency**: All transactions and product movements are recorded on the blockchain
- ✅ **Security**: Immutable records prevent tampering and fraud
- ✅ **Efficiency**: Automated processes reduce administrative overhead
- ✅ **Traceability**: Complete product journey from raw materials to consumer
- ✅ **Decentralization**: No single point of failure

## ✨ Features

- 🔐 **Role-Based Access Control**: Secure role assignment (Owner, Raw Material Supplier, Manufacturer, Distributor, Retailer)
- 📦 **Product Management**: Add and track products through the entire supply chain
- 🔄 **Supply Chain Flow**: Manage product stages (Order → Raw Material Supply → Manufacturing → Distribution → Retail → Sold)
- 📊 **Real-Time Tracking**: Track products with detailed stage information and QR codes
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔗 **Web3 Integration**: Seamless connection with MetaMask wallet
- 📱 **Mobile Responsive**: Works perfectly on all devices

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Web3.js** - Ethereum blockchain interaction
- **QRCode.react** - QR code generation for product tracking

### Backend/Blockchain
- **Solidity ^0.8.19** - Smart contract programming language
- **Hardhat** - Ethereum development environment
- **Ganache** - Personal blockchain for development
- **MetaMask** - Web3 wallet integration

### Development Tools
- **Node.js 18+** - JavaScript runtime
- **npm/yarn** - Package management
- **Git** - Version control

## 🏗 Architecture

The application follows a decentralized architecture where:

1. **Smart Contracts** (Solidity) handle all business logic and data storage on the blockchain
2. **Frontend** (Next.js) provides the user interface and interacts with the blockchain via Web3.js
3. **MetaMask** acts as the bridge between users and the Ethereum network
4. **Ganache** provides a local blockchain for development and testing

### System Flow

```
User → Next.js Frontend → Web3.js → MetaMask → Ethereum Network → Smart Contract
```

![Architecture Diagram](https://raw.githubusercontent.com/faizack619/Supply-Chain-Gode-Blockchain/master/client/public/Blank%20diagram.png)

### Supply Chain Flow

The product journey through the supply chain:

```
Order → Raw Material Supplier → Manufacturer → Distributor → Retailer → Consumer
```

![Supply Chain Flow](https://cdn-wordpress-info.futurelearn.com/info/wp-content/uploads/8d54ad89-e86f-4d7c-8208-74455976a4a9-2-768x489.png)

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Ganache** - [Download](https://trufflesuite.com/ganache/)
- **MetaMask** - [Chrome Extension](https://chrome.google.com/webstore/detail/metamask) | [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
- **VS Code** (Recommended) - [Download](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/samiul2102013/Supply-Chain-Blockchain.git
cd Supply-Chain-Blockchain
```

### Step 2: Install Dependencies

Install backend dependencies (Hardhat & Solidity):

```bash
cd backend
npm install
```

Install frontend dependencies (Next.js):

```bash
cd ../client
npm install
```

### Step 3: Configure Ganache

1. Open Ganache and create a new workspace (or use Quickstart)
2. Note the RPC Server URL (default: `http://127.0.0.1:7545`)
3. Check the Chain ID in Settings → Server (default: `1337` or `5777`)

### Step 4: Deploy Smart Contracts

From the `backend/` directory:

```bash
# Compile the smart contracts
npm run compile

# Deploy to Ganache (chainId 1337)
npm run deploy:ganache

# Or for Ganache with chainId 5777
npm run deploy:ganache5777
```

The deployment script automatically updates `client/src/deployments.json` with the contract address.

### Step 5: Configure MetaMask

1. Open MetaMask and click the network dropdown
2. Select "Add Network" → "Add a network manually"
3. Enter the following details:
   - **Network Name**: Ganache Local
   - **RPC URL**: `http://127.0.0.1:7545` (or your Ganache URL)
   - **Chain ID**: `1337` (or your Ganache Chain ID)
   - **Currency Symbol**: ETH
4. Click "Save"

5. Import an account from Ganache:
   - In Ganache, click the key icon next to an account to reveal the private key
   - In MetaMask, click the account icon → "Import Account"
   - Paste the private key and click "Import"

## 🚀 Running the Project

### Quick Start

```bash
# Terminal 1: Start Ganache
# Open Ganache application and start a workspace

# Terminal 2: Deploy contracts (from backend/)
cd backend
npm run deploy:ganache

# Terminal 3: Start frontend (from client/)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

#### Backend (`backend/` directory)

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run deploy:ganache` | Deploy to Ganache (chainId 1337) |
| `npm run deploy:ganache5777` | Deploy to Ganache (chainId 5777) |
| `npm run deploy:local` | Deploy to Hardhat local node |
| `npm run node` | Start Hardhat local node |
| `npm run test` | Run contract tests |
| `npm run clean` | Clean build artifacts |

#### Frontend (`client/` directory)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Production Build

```bash
cd client
npm run build
npm start
```

## 📖 Usage Guide

### 1. Connect Wallet

- Open the application at [http://localhost:3000](http://localhost:3000)
- Click "Connect Wallet" to connect MetaMask
- Ensure MetaMask is connected to Ganache network
- The first Ganache account (index 0) is the contract owner

### 2. Register Roles (Owner Only)

- Navigate to **"Register Roles"** page
- Only the contract owner can register new roles
- Add participants for each role:
  - **Raw Material Suppliers (RMS)**
  - **Manufacturers (MAN)**
  - **Distributors (DIS)**
  - **Retailers (RET)**
- Each role requires: Ethereum address, name, and location

### 3. Order Products (Owner Only)

- Go to **"Order Products"** page
- Only the contract owner can create orders
- Enter product details: name and description
- **Important**: At least one participant of each role must be registered first

### 4. Manage Supply Chain Flow

- Access **"Supply Chain Flow"** page
- Each role performs their specific action using their registered address:
  - **Raw Material Supplier**: Supply raw materials
  - **Manufacturer**: Manufacture products
  - **Distributor**: Distribute products
  - **Retailer**: Retail and mark as sold

### 5. Track Products

- Visit **"Track Products"** page
- Enter a product ID to view its complete journey
- View detailed information about each stage
- Generate QR codes for product verification

## 🔐 Smart Contract Details

The `SupplyChain.sol` smart contract implements a comprehensive supply chain management system with the following features:

### Roles

- **Owner**: Deploys the contract and can register other roles
- **Raw Material Supplier (RMS)**: Supplies raw materials
- **Manufacturer (MAN)**: Manufactures products
- **Distributor (DIS)**: Distributes products
- **Retailer (RET)**: Sells products to consumers

### Product Stages

1. **Ordered** (Stage 0): Product order created
2. **Raw Material Supplied** (Stage 1): Raw materials supplied
3. **Manufacturing** (Stage 2): Product being manufactured
4. **Distribution** (Stage 3): Product in distribution
5. **Retail** (Stage 4): Product at retailer
6. **Sold** (Stage 5): Product sold to consumer

### Key Functions

- `addRMS()`, `addManufacturer()`, `addDistributor()`, `addRetailer()`: Register participants
- `addProduct()`: Create new product orders
- `RMSsupply()`, `Manufacturing()`, `Distribute()`, `Retail()`, `sold()`: Progress products through stages
- `showStage()`: Get current stage of a product

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| MetaMask not connecting | Ensure Ganache is running and MetaMask is on the correct network |
| Transaction fails | Check you're using the correct account for the action (owner vs role) |
| Contract not found | Re-deploy contracts with `npm run deploy:ganache` |
| Wrong network error | Switch MetaMask to Ganache network (chainId 1337 or 5777) |
| "No roles registered" | Register at least one of each role before adding products |

## 📁 Project Structure

```
Supply-Chain-Blockchain/
├── backend/                    # Hardhat/Solidity backend
│   ├── contracts/              # Smart contracts
│   │   └── SupplyChain.sol     # Main supply chain contract
│   ├── scripts/                # Deployment scripts
│   ├── test/                   # Contract tests
│   ├── hardhat.config.ts       # Hardhat configuration
│   └── package.json
│
├── client/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── roles/          # Role management
│   │   │   ├── addmed/         # Add products
│   │   │   ├── supply/         # Supply chain flow
│   │   │   └── track/          # Product tracking
│   │   ├── lib/                # Utilities
│   │   │   ├── web3.ts         # Web3 connection
│   │   │   └── contracts.ts    # Contract imports
│   │   ├── artifacts/          # Compiled contract ABIs
│   │   └── deployments.json    # Deployed contract addresses
│   └── package.json
│
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

### External Resources

- [Solidity Documentation](https://docs.soliditylang.org/en/v0.8.19/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ganache Documentation](https://trufflesuite.com/docs/ganache/overview)
- [MetaMask Documentation](https://docs.metamask.io/)



## ⭐ Show Your Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🍴 Forking the project
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

<div align="center">

**Made with ❤️ using Solidity, Next.js, and Web3**

[⬆ Back to Top](#-supply-chain-blockchain-dapp)

</div>
