# Supply Chain Blockchain - Admin Workflow Guide

## Owner/Admin Account
- **Address**: `0xeE4360a736C124b42aD7927146EC398A4A193061`
- **Network**: Sepolia Testnet
- **Contract Address**: `0x08BbFB500941196b2e05e7f4D6f6bae753b281d4`

---

## Complete Workflow Steps

### Step 1: Connect MetaMask
1. Open your Vercel deployment: `https://supply-chain-blockchain-nine-vercel.app`
2. Click "Connect MetaMask"
3. Import the owner account using the private key from `backend/.env`
4. Switch MetaMask to **Sepolia Testnet**
5. Approve the connection request

### Step 2: Register Supply Chain Roles (Admin Only)
Go to **Roles Management** page at `/roles`

#### 2.1 Register Vendors (Raw Material Suppliers)
- Vendor supplies raw materials to manufacturers
- Click "Vendors" tab → "Add Vendor"
- Fill in:
  - **Address**: Wallet address of the vendor
  - **Name**: Vendor company name (e.g., "TextileCo")
  - **Location**: City/Country (e.g., "Bangladesh")
  - **Contact Info**: Phone or email
  - **Material Types**: Materials they supply (e.g., "Cotton, Polyester, Linen")
- Click "Register Vendor"
- **Repeat for at least 1-2 vendors**

#### 2.2 Register Manufacturers
- Manufacturers process raw materials into products
- Click "Manufacturers" tab → "Add Manufacturer"
- Fill in:
  - **Address**: Manufacturer's wallet address
  - **Name**: Company name (e.g., "FabricFactory")
  - **Location**: City/Country
- Click "Register Manufacturer"
- **Minimum: 1 manufacturer required**

#### 2.3 Register Distributors
- Distributors transport products to retailers
- Click "Distributors" tab → "Add Distributor"
- Fill in:
  - **Address**: Distributor's wallet address
  - **Name**: Company name (e.g., "LogisticsPro")
  - **Location**: City/Country
- Click "Register Distributor"
- **Minimum: 1 distributor required**

#### 2.4 Register Retailers
- Retailers sell products to consumers
- Click "Retailers" tab → "Add Retailer"
- Fill in:
  - **Address**: Retailer's wallet address
  - **Name**: Store name (e.g., "FashionHub")
  - **Location**: City/Country
- Click "Register Retailer"
- **Minimum: 1 retailer required**

**✅ After this step, you have a complete supply chain network!**

---

### Step 3: Create Raw Materials (Vendor Admin)
Go to **Materials** page at `/materials`

**Materials** are inventory items tracked from vendors:
- Click "Add Material"
- Fill in:
  - **Material Name**: e.g., "Premium Cotton Fabric"
  - **Category**: e.g., "Textiles"
  - **Vendor**: Select from registered vendors
  - **Available Quantity**: e.g., "1000"
  - **Unit**: e.g., "kg" or "meters"
  - **Price Per Unit**: e.g., "$5"
- Click "Create Material"

**Repeat to create 3-4 different materials** (e.g., Cotton, Polyester, Thread, Buttons)

**✅ Now you have raw materials in the inventory!**

---

### Step 4: Create Products (Owner/Admin)
Go to **Add Product** page at `/addmed`

**Products** are final goods that go through the supply chain:
- Click "Add Product" tab
- Fill in:
  - **Product Name**: e.g., "Premium T-Shirt"
  - **Description**: e.g., "100% Cotton Premium T-Shirt"
  - **Target Quantity**: e.g., "500" (units to produce)
- Click "Create Product"

**✅ Product is now in "Init" stage, ready for materials assignment**

---

### Step 5: Assign Materials to Products (Owner/Admin)
Still on **Add Product** page (`/addmed`):
- Click "Assign Materials" tab
- Select:
  - **Product**: Your newly created product
  - **Material**: Select from available materials (e.g., Cotton Fabric)
  - **Quantity to Use**: e.g., "200" (kg needed for this product)
- Click "Assign Material"
- **Repeat for multiple materials** (e.g., Fabric + Thread + Buttons)

**✅ Product now has materials assigned, stage: "MaterialsAssigned"**

---

### Step 6: Start Manufacturing Process
Go to **Supply Chain Operations** page at `/supply`

This page is role-based and shows different operations based on user role:

#### 6.1 As Manufacturer (if you have manufacturer wallet)
- Switch MetaMask to the **Manufacturer's wallet** (that you registered)
- Go to `/supply` page
- You'll see yellow badge: "Manufacturer"
- Click "Start Manufacturing" for your product
- **Status**: Product moves to "Manufacturing" stage

#### 6.2 As Distributor
- Switch MetaMask to the **Distributor's wallet**
- Go to `/supply` page
- You'll see orange badge: "Distributor"
- Wait for product to reach "Manufacturing" stage
- Click "Start Distribution" for the product
- **Status**: Product moves to "Distribution" stage

#### 6.3 As Retailer
- Switch MetaMask to the **Retailer's wallet**
- Go to `/supply` page
- You'll see blue badge: "Retailer"
- Wait for product to reach "Distribution" stage
- Click "Stock Retail" for the product
- **Status**: Product moves to "Retail" stage

#### 6.4 Final Sale
- Consumer can visit **Track Product** page at `/track`
- Enter Product ID to see full supply chain history
- View materials used, timeline, and handlers
- See QR code with tracking link

---

## Complete Workflow Summary

```
Owner creates product
    ↓
Owner assigns materials
    ↓
Product: Init → MaterialsAssigned
    ↓
Manufacturer processes materials
    ↓
Product: Manufacturing
    ↓
Distributor transports product
    ↓
Product: Distribution
    ↓
Retailer stocks product
    ↓
Product: Retail
    ↓
Consumer can track product history
```

---

## Testing Checklist

- [ ] MetaMask connected to Sepolia Testnet
- [ ] Owner account recognized as admin
- [ ] All 4 roles (Vendor, Manufacturer, Distributor, Retailer) registered
- [ ] At least 3 materials created
- [ ] Product created successfully
- [ ] Materials assigned to product
- [ ] Can switch between role wallets (use browser's private window or multi-wallet setup)
- [ ] Product progresses through all stages
- [ ] Product is trackable with QR code

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Only owner can perform this action" | Ensure you're on owner account (0xeE4360...) |
| "Contract not deployed on current network" | Switch MetaMask to Sepolia Testnet |
| "Role not registered" | Go to Roles page and register the role first |
| "Cannot start manufacturing" | Product must be in "MaterialsAssigned" stage first |
| Transaction failed | Ensure you have enough SepoliaETH (gas fees) |
| Material not available | Check that material quantity is > 0 |

---

## Account Setup for Testing

To properly test the full workflow, you'll need **5 different wallet addresses**:

1. **Owner/Admin**: `0xeE4360a736C124b42aD7927146EC398A4A193061`
2. **Vendor Wallet**: Any address for raw material supplier
3. **Manufacturer Wallet**: Any address for processing
4. **Distributor Wallet**: Any address for shipping
5. **Retailer Wallet**: Any address for retail store

### Quick Setup Options:
- Use MetaMask test accounts (create multiple accounts in one extension)
- Use Ganache accounts if testing locally
- Request testnet ETH from [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

---

## Smart Contract Events (Advanced)

The contract emits events for each state change. You can monitor:
- `ProductCreated` - When new product is added
- `MaterialsAssigned` - When materials linked to product
- `ManufacturingStarted` - Manufacturing phase begins
- `DistributionStarted` - Distribution phase begins
- `RetailStocked` - Product at retail stage
- `ProductSold` - Final sale recorded

These are logged in blockchain explorer: https://sepolia.etherscan.io

---

## Next Steps After Testing

1. **Deploy to Production**: Switch to Ethereum Mainnet
2. **Integrate with Real Databases**: Store off-chain data in backend
3. **Add Permissions**: Implement multi-sig for critical operations
4. **Mobile App**: Create mobile tracking interface
5. **IoT Integration**: Connect real sensors for temperature/location tracking

---
