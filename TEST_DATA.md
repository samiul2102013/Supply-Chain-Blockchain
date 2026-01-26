# Supply Chain Test Data - Admin Workflow

## 🔑 Owner/Admin Account
- **Wallet Address**: `0xeE4360a736C124b42aD7927146EC398A4A193061`
- **Status**: Already connected in screenshot
- **Role**: Owner/Admin

---

## 📋 FORM 1: VENDORS (Raw Material Suppliers)

### Vendor #1: TextileCo Bangladesh
**Form Fields to Fill:**
- Wallet Address (0x...): `0x1234567890123456789012345678901234567890`
- Vendor Name: `TextileCo Bangladesh`
- Location: `Dhaka, Bangladesh`
- Contact Info: `+880-1-23456789`
- Material Types: `Cotton Fabric, Organic Cotton, Linen`

**Action**: Click "Add Vendor" button

---

### Vendor #2: SynthFibers International
**Form Fields to Fill:**
- Wallet Address (0x...): `0x0987654321098765432109876543210987654321`
- Vendor Name: `SynthFibers International`
- Location: `Mumbai, India`
- Contact Info: `+91-22-1234567`
- Material Types: `Polyester, Nylon Thread, Acrylic`

**Action**: Click "Add Vendor" button

---

## 🏭 FORM 2: MANUFACTURERS

### Manufacturer #1: FabricFactory Ltd
**Form Fields to Fill:**
- Wallet Address (0x...): `0x1111111111111111111111111111111111111111`
- Manufacturer Name: `FabricFactory Ltd`
- Location: `Chittagong, Bangladesh`

**Action**: Click "Add Manufacturer" button

---

## 🚚 FORM 3: DISTRIBUTORS

### Distributor #1: LogisticsPro Express
**Form Fields to Fill:**
- Wallet Address (0x...): `0x2222222222222222222222222222222222222222`
- Distributor Name: `LogisticsPro Express`
- Location: `Bangkok, Thailand`

**Action**: Click "Add Distributor" button

---

## 🏪 FORM 4: RETAILERS

### Retailer #1: FashionHub Store
**Form Fields to Fill:**
- Wallet Address (0x...): `0x3333333333333333333333333333333333333333`
- Retailer Name: `FashionHub Store`
- Location: `Singapore`

**Action**: Click "Add Retailer" button

---

## 📦 FORM 5: CREATE MATERIALS (On `/materials` page)

### Material #1: Premium Cotton Fabric
**Form Fields to Fill:**
- Material Name: `Premium Cotton Fabric`
- Category: `Textiles`
- Vendor: Select `TextileCo Bangladesh` (from dropdown)
- Available Quantity: `1000`
- Unit: `meters`
- Price Per Unit: `5.50`

**Action**: Click "Create Material" button

---

### Material #2: Polyester Thread
**Form Fields to Fill:**
- Material Name: `Polyester Thread`
- Category: `Thread & Yarn`
- Vendor: Select `SynthFibers International` (from dropdown)
- Available Quantity: `500`
- Unit: `spools`
- Price Per Unit: `2.25`

**Action**: Click "Create Material" button

---

### Material #3: Metal Buttons
**Form Fields to Fill:**
- Material Name: `Metal Buttons`
- Category: `Accessories`
- Vendor: Select `TextileCo Bangladesh` (from dropdown)
- Available Quantity: `5000`
- Unit: `pieces`
- Price Per Unit: `0.15`

**Action**: Click "Create Material" button

---

### Material #4: Metal Zipper
**Form Fields to Fill:**
- Material Name: `Metal Zipper`
- Category: `Accessories`
- Vendor: Select `SynthFibers International` (from dropdown)
- Available Quantity: `2000`
- Unit: `pieces`
- Price Per Unit: `0.75`

**Action**: Click "Create Material" button

---

## 👕 FORM 6: CREATE PRODUCT (On `/addmed` page)

### Product: Premium Cotton T-Shirt
**Tab: "Add Product"**
- Product Name: `Premium Cotton T-Shirt`
- Description: `High-quality 100% organic cotton t-shirt with premium stitching`
- Target Quantity: `500`

**Action**: Click "Create Product" button

**✅ PRODUCT CREATED - Now you need to assign materials to it**

---

## 📌 FORM 7: ASSIGN MATERIALS TO PRODUCT (On `/addmed` page)

**Tab: "Assign Materials"**

### Assignment #1: Cotton Fabric
- Product (Select from dropdown): `Premium Cotton T-Shirt`
- Material (Select from dropdown): `Premium Cotton Fabric`
- Quantity to Use: `400` (meters for 500 shirts = 0.8m per shirt)

**Action**: Click "Assign Material" button

---

### Assignment #2: Polyester Thread
- Product (Select from dropdown): `Premium Cotton T-Shirt`
- Material (Select from dropdown): `Polyester Thread`
- Quantity to Use: `100` (spools)

**Action**: Click "Assign Material" button

---

### Assignment #3: Metal Buttons
- Product (Select from dropdown): `Premium Cotton T-Shirt`
- Material (Select from dropdown): `Metal Buttons`
- Quantity to Use: `1500` (3 buttons per shirt × 500 shirts)

**Action**: Click "Assign Material" button

---

### Assignment #4: Metal Zipper
- Product (Select from dropdown): `Premium Cotton T-Shirt`
- Material (Select from dropdown): `Metal Zipper`
- Quantity to Use: `500` (1 zipper per shirt)

**Action**: Click "Assign Material" button

**✅ PRODUCT NOW HAS ALL MATERIALS ASSIGNED**

---

## ✅ WORKFLOW SUMMARY

```
✓ Vendor #1: TextileCo Bangladesh - Registered
✓ Vendor #2: SynthFibers International - Registered
✓ Manufacturer: FabricFactory Ltd - Registered
✓ Distributor: LogisticsPro Express - Registered
✓ Retailer: FashionHub Store - Registered
✓ Material #1: Premium Cotton Fabric - Created
✓ Material #2: Polyester Thread - Created
✓ Material #3: Metal Buttons - Created
✓ Material #4: Metal Zipper - Created
✓ Product: Premium Cotton T-Shirt - Created
✓ Materials Assigned to Product - Complete
```

**Status**: Product is now in "MaterialsAssigned" stage ✅
**Next Step**: Switch to Manufacturer wallet and click "Start Manufacturing" on `/supply` page

---

## 🔄 NEXT WORKFLOW STEPS (After Product Created)

### Step 8: Manufacturing
1. Switch MetaMask to **FabricFactory Ltd** wallet: `0x1111111111111111111111111111111111111111`
2. Go to `/supply` page
3. Find "Premium Cotton T-Shirt" product
4. Click "Start Manufacturing"
5. Product moves to "Manufacturing" stage ✓

### Step 9: Distribution
1. Switch MetaMask to **LogisticsPro Express** wallet: `0x2222222222222222222222222222222222222222`
2. Go to `/supply` page
3. Find product at "Manufacturing" stage
4. Click "Start Distribution"
5. Product moves to "Distribution" stage ✓

### Step 10: Retail
1. Switch MetaMask to **FashionHub Store** wallet: `0x3333333333333333333333333333333333333333`
2. Go to `/supply` page
3. Find product at "Distribution" stage
4. Click "Stock Retail"
5. Product moves to "Retail" stage ✓

### Step 11: Track Product
1. Go to `/track` page
2. Enter Product ID: `1`
3. View complete supply chain history
4. Scan QR code to share tracking link

---

## 📝 IMPORTANT NOTES

**Address Values Used:**
- All test wallet addresses start with `0x` and have 40 hexadecimal characters
- You can use the values provided above, or generate your own test addresses
- For actual testing with transactions, you'll need testnet ETH (get from Sepolia faucet)

**Field Validations:**
- All numeric fields accept numbers only
- Location can have multiple words (e.g., "New York, USA")
- Material Types and Contact Info are free text
- Addresses must start with `0x` followed by 40 hex characters

---
