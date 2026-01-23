// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public Owner;

    constructor() {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only owner can perform this action");
        _;
    }

    // ============ ENUMS ============
    enum STAGE { 
        Init,               // Product created, waiting for materials
        MaterialsAssigned,  // Materials picked for this product
        Manufacturing,      // Being manufactured
        Distribution,       // Being distributed
        Retail,            // At retailer
        Sold               // Sold to consumer
    }

    // ============ COUNTERS ============
    uint256 public vendorCtr = 0;
    uint256 public materialCtr = 0;
    uint256 public productCtr = 0;
    uint256 public manufacturerCtr = 0;
    uint256 public distributorCtr = 0;
    uint256 public retailerCtr = 0;

    // ============ STRUCTS ============
    
    // Vendor/Supplier
    struct Vendor {
        uint256 id;
        address addr;
        string name;
        string location;
        string contactInfo;
        string materialTypes;
        uint256 registeredAt;
        bool isActive;
    }
    
    // Raw Material in inventory
    struct Material {
        uint256 id;
        string name;
        string category;
        uint256 totalQuantity;
        uint256 availableQuantity;
        string unit;
        uint256 pricePerUnit;
        uint256 vendorId;
        uint256 receivedAt;
        bool isActive;
    }
    
    // Product
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 targetQuantity;
        uint256 manufacturerId;
        uint256 distributorId;
        uint256 retailerId;
        STAGE stage;
        uint256 createdAt;
    }
    
    // Material used in a product
    struct ProductMaterialUsage {
        uint256 materialId;
        uint256 quantityUsed;
        uint256 assignedAt;
    }
    
    // Manufacturer
    struct Manufacturer {
        uint256 id;
        address addr;
        string name;
        string location;
        uint256 registeredAt;
    }
    
    // Distributor
    struct Distributor {
        uint256 id;
        address addr;
        string name;
        string location;
        uint256 registeredAt;
    }
    
    // Retailer
    struct Retailer {
        uint256 id;
        address addr;
        string name;
        string location;
        uint256 registeredAt;
    }
    
    // Product timeline
    struct ProductTimeline {
        uint256 createdAt;
        uint256 materialsAssignedAt;
        uint256 manufacturingStartedAt;
        uint256 manufacturingCompletedAt;
        uint256 distributionStartedAt;
        uint256 retailReceivedAt;
        uint256 soldAt;
    }

    // ============ MAPPINGS ============
    mapping(uint256 => Vendor) public vendors;
    mapping(uint256 => Material) public materials;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Manufacturer) public manufacturers;
    mapping(uint256 => Distributor) public distributors;
    mapping(uint256 => Retailer) public retailers;
    mapping(uint256 => ProductTimeline) public productTimelines;
    
    // Product to Materials mapping
    mapping(uint256 => ProductMaterialUsage[]) public productMaterials;
    
    // Material supply history
    struct MaterialSupply {
        uint256 id;
        uint256 materialId;
        uint256 vendorId;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 totalAmount;
        uint256 suppliedAt;
    }
    uint256 public supplyHistoryCtr = 0;
    mapping(uint256 => MaterialSupply) public supplyHistory;

    // ============ EVENTS ============
    event VendorAdded(uint256 indexed vendorId, string name, uint256 timestamp);
    event MaterialAdded(uint256 indexed materialId, string name, uint256 vendorId, uint256 quantity, uint256 timestamp);
    event MaterialRestocked(uint256 indexed materialId, uint256 quantity, uint256 vendorId, uint256 timestamp);
    event ProductCreated(uint256 indexed productId, string name, uint256 targetQuantity, uint256 timestamp);
    event MaterialsAssignedToProduct(uint256 indexed productId, uint256 materialId, uint256 quantity, uint256 timestamp);
    event StageUpdated(uint256 indexed productId, STAGE stage, address indexed actor, uint256 timestamp);
    event ManufacturerAdded(uint256 indexed id, string name, uint256 timestamp);
    event DistributorAdded(uint256 indexed id, string name, uint256 timestamp);
    event RetailerAdded(uint256 indexed id, string name, uint256 timestamp);

    // ============ VENDOR FUNCTIONS ============
    
    function addVendor(
        address _addr,
        string memory _name,
        string memory _location,
        string memory _contactInfo,
        string memory _materialTypes
    ) public onlyByOwner {
        vendorCtr++;
        vendors[vendorCtr] = Vendor({
            id: vendorCtr,
            addr: _addr,
            name: _name,
            location: _location,
            contactInfo: _contactInfo,
            materialTypes: _materialTypes,
            registeredAt: block.timestamp,
            isActive: true
        });
        emit VendorAdded(vendorCtr, _name, block.timestamp);
    }
    
    function getVendor(uint256 _vendorId) public view returns (Vendor memory) {
        require(_vendorId > 0 && _vendorId <= vendorCtr, "Invalid vendor ID");
        return vendors[_vendorId];
    }

    // ============ MATERIAL FUNCTIONS ============
    
    // Find vendor by address
    function findVendor(address _addr) public view returns (uint256) {
        for (uint256 i = 1; i <= vendorCtr; i++) {
            if (vendors[i].addr == _addr) return i;
        }
        return 0;
    }
    
    // Vendor adds their own material
    function vendorAddMaterial(
        string memory _name,
        string memory _category,
        uint256 _quantity,
        string memory _unit,
        uint256 _pricePerUnit
    ) public {
        uint256 vendorId = findVendor(msg.sender);
        require(vendorId > 0, "You are not a registered vendor");
        require(vendors[vendorId].isActive, "Your vendor account is not active");
        require(_quantity > 0, "Quantity must be > 0");
        
        materialCtr++;
        materials[materialCtr] = Material({
            id: materialCtr,
            name: _name,
            category: _category,
            totalQuantity: _quantity,
            availableQuantity: _quantity,
            unit: _unit,
            pricePerUnit: _pricePerUnit,
            vendorId: vendorId,
            receivedAt: block.timestamp,
            isActive: true
        });
        
        supplyHistoryCtr++;
        supplyHistory[supplyHistoryCtr] = MaterialSupply({
            id: supplyHistoryCtr,
            materialId: materialCtr,
            vendorId: vendorId,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            totalAmount: _quantity * _pricePerUnit,
            suppliedAt: block.timestamp
        });
        
        emit MaterialAdded(materialCtr, _name, vendorId, _quantity, block.timestamp);
    }
    
    // Vendor restocks their own material
    function vendorRestockMaterial(
        uint256 _materialId,
        uint256 _quantity,
        uint256 _pricePerUnit
    ) public {
        uint256 vendorId = findVendor(msg.sender);
        require(vendorId > 0, "You are not a registered vendor");
        require(_materialId > 0 && _materialId <= materialCtr, "Invalid material ID");
        require(materials[_materialId].vendorId == vendorId, "This material belongs to another vendor");
        require(_quantity > 0, "Quantity must be > 0");
        
        materials[_materialId].totalQuantity += _quantity;
        materials[_materialId].availableQuantity += _quantity;
        
        supplyHistoryCtr++;
        supplyHistory[supplyHistoryCtr] = MaterialSupply({
            id: supplyHistoryCtr,
            materialId: _materialId,
            vendorId: vendorId,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            totalAmount: _quantity * _pricePerUnit,
            suppliedAt: block.timestamp
        });
        
        emit MaterialRestocked(_materialId, _quantity, vendorId, block.timestamp);
    }
    
    // Admin adds material (kept for admin use)
    function addMaterial(
        string memory _name,
        string memory _category,
        uint256 _quantity,
        string memory _unit,
        uint256 _pricePerUnit,
        uint256 _vendorId
    ) public onlyByOwner {
        require(_vendorId > 0 && _vendorId <= vendorCtr, "Invalid vendor ID");
        require(_quantity > 0, "Quantity must be > 0");
        require(vendors[_vendorId].isActive, "Vendor is not active");
        
        materialCtr++;
        materials[materialCtr] = Material({
            id: materialCtr,
            name: _name,
            category: _category,
            totalQuantity: _quantity,
            availableQuantity: _quantity,
            unit: _unit,
            pricePerUnit: _pricePerUnit,
            vendorId: _vendorId,
            receivedAt: block.timestamp,
            isActive: true
        });
        
        supplyHistoryCtr++;
        supplyHistory[supplyHistoryCtr] = MaterialSupply({
            id: supplyHistoryCtr,
            materialId: materialCtr,
            vendorId: _vendorId,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            totalAmount: _quantity * _pricePerUnit,
            suppliedAt: block.timestamp
        });
        
        emit MaterialAdded(materialCtr, _name, _vendorId, _quantity, block.timestamp);
    }
    
    function restockMaterial(
        uint256 _materialId,
        uint256 _quantity,
        uint256 _vendorId,
        uint256 _pricePerUnit
    ) public onlyByOwner {
        require(_materialId > 0 && _materialId <= materialCtr, "Invalid material ID");
        require(_vendorId > 0 && _vendorId <= vendorCtr, "Invalid vendor ID");
        require(_quantity > 0, "Quantity must be > 0");
        
        materials[_materialId].totalQuantity += _quantity;
        materials[_materialId].availableQuantity += _quantity;
        
        supplyHistoryCtr++;
        supplyHistory[supplyHistoryCtr] = MaterialSupply({
            id: supplyHistoryCtr,
            materialId: _materialId,
            vendorId: _vendorId,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            totalAmount: _quantity * _pricePerUnit,
            suppliedAt: block.timestamp
        });
        
        emit MaterialRestocked(_materialId, _quantity, _vendorId, block.timestamp);
    }
    
    function getMaterial(uint256 _materialId) public view returns (Material memory) {
        require(_materialId > 0 && _materialId <= materialCtr, "Invalid material ID");
        return materials[_materialId];
    }

    // ============ MANUFACTURER/DISTRIBUTOR/RETAILER FUNCTIONS ============
    
    function addManufacturer(address _addr, string memory _name, string memory _location) public onlyByOwner {
        manufacturerCtr++;
        manufacturers[manufacturerCtr] = Manufacturer({
            id: manufacturerCtr,
            addr: _addr,
            name: _name,
            location: _location,
            registeredAt: block.timestamp
        });
        emit ManufacturerAdded(manufacturerCtr, _name, block.timestamp);
    }
    
    function addDistributor(address _addr, string memory _name, string memory _location) public onlyByOwner {
        distributorCtr++;
        distributors[distributorCtr] = Distributor({
            id: distributorCtr,
            addr: _addr,
            name: _name,
            location: _location,
            registeredAt: block.timestamp
        });
        emit DistributorAdded(distributorCtr, _name, block.timestamp);
    }
    
    function addRetailer(address _addr, string memory _name, string memory _location) public onlyByOwner {
        retailerCtr++;
        retailers[retailerCtr] = Retailer({
            id: retailerCtr,
            addr: _addr,
            name: _name,
            location: _location,
            registeredAt: block.timestamp
        });
        emit RetailerAdded(retailerCtr, _name, block.timestamp);
    }
    
    function findManufacturer(address _addr) public view returns (uint256) {
        for (uint256 i = 1; i <= manufacturerCtr; i++) {
            if (manufacturers[i].addr == _addr) return i;
        }
        return 0;
    }
    
    function findDistributor(address _addr) public view returns (uint256) {
        for (uint256 i = 1; i <= distributorCtr; i++) {
            if (distributors[i].addr == _addr) return i;
        }
        return 0;
    }
    
    function findRetailer(address _addr) public view returns (uint256) {
        for (uint256 i = 1; i <= retailerCtr; i++) {
            if (retailers[i].addr == _addr) return i;
        }
        return 0;
    }

    // ============ PRODUCT FUNCTIONS ============
    
    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _targetQuantity
    ) public onlyByOwner {
        require(_targetQuantity > 0, "Target quantity must be > 0");
        
        productCtr++;
        products[productCtr] = Product({
            id: productCtr,
            name: _name,
            description: _description,
            targetQuantity: _targetQuantity,
            manufacturerId: 0,
            distributorId: 0,
            retailerId: 0,
            stage: STAGE.Init,
            createdAt: block.timestamp
        });
        
        productTimelines[productCtr].createdAt = block.timestamp;
        
        emit ProductCreated(productCtr, _name, _targetQuantity, block.timestamp);
    }
    
    // Manufacturer selects materials for a product and starts manufacturing
    function manufacturerSelectMaterial(
        uint256 _productId,
        uint256 _materialId,
        uint256 _quantity
    ) public {
        uint256 mId = findManufacturer(msg.sender);
        require(mId > 0, "You are not a registered manufacturer");
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        require(_materialId > 0 && _materialId <= materialCtr, "Invalid material ID");
        require(products[_productId].stage == STAGE.Init || products[_productId].stage == STAGE.MaterialsAssigned, 
                "Cannot assign materials at this stage");
        require(materials[_materialId].availableQuantity >= _quantity, "Insufficient material quantity");
        require(_quantity > 0, "Quantity must be > 0");
        
        // If first material assignment, set manufacturer
        if (products[_productId].manufacturerId == 0) {
            products[_productId].manufacturerId = mId;
        } else {
            require(products[_productId].manufacturerId == mId, "Another manufacturer already assigned");
        }
        
        // Deduct material quantity
        materials[_materialId].availableQuantity -= _quantity;
        
        productMaterials[_productId].push(ProductMaterialUsage({
            materialId: _materialId,
            quantityUsed: _quantity,
            assignedAt: block.timestamp
        }));
        
        if (products[_productId].stage == STAGE.Init) {
            products[_productId].stage = STAGE.MaterialsAssigned;
            productTimelines[_productId].materialsAssignedAt = block.timestamp;
        }
        
        emit MaterialsAssignedToProduct(_productId, _materialId, _quantity, block.timestamp);
    }
    
    // Manufacturer confirms and starts manufacturing after selecting materials
    function confirmAndStartManufacturing(uint256 _productId) public {
        uint256 mId = findManufacturer(msg.sender);
        require(mId > 0, "You are not a registered manufacturer");
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        require(products[_productId].stage == STAGE.MaterialsAssigned, "Materials not yet assigned");
        require(products[_productId].manufacturerId == mId, "You are not assigned to this product");
        require(productMaterials[_productId].length > 0, "No materials assigned");
        
        products[_productId].stage = STAGE.Manufacturing;
        productTimelines[_productId].manufacturingStartedAt = block.timestamp;
        
        emit StageUpdated(_productId, STAGE.Manufacturing, msg.sender, block.timestamp);
    }
    
    // Admin can also assign materials (kept for flexibility)
    function assignMaterialToProduct(
        uint256 _productId,
        uint256 _materialId,
        uint256 _quantity
    ) public onlyByOwner {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        require(_materialId > 0 && _materialId <= materialCtr, "Invalid material ID");
        require(products[_productId].stage == STAGE.Init || products[_productId].stage == STAGE.MaterialsAssigned, 
                "Cannot assign materials at this stage");
        require(materials[_materialId].availableQuantity >= _quantity, "Insufficient material quantity");
        require(_quantity > 0, "Quantity must be > 0");
        
        materials[_materialId].availableQuantity -= _quantity;
        
        productMaterials[_productId].push(ProductMaterialUsage({
            materialId: _materialId,
            quantityUsed: _quantity,
            assignedAt: block.timestamp
        }));
        
        if (products[_productId].stage == STAGE.Init) {
            products[_productId].stage = STAGE.MaterialsAssigned;
            productTimelines[_productId].materialsAssignedAt = block.timestamp;
        }
        
        emit MaterialsAssignedToProduct(_productId, _materialId, _quantity, block.timestamp);
    }
    
    function getProductMaterials(uint256 _productId) public view returns (ProductMaterialUsage[] memory) {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        return productMaterials[_productId];
    }
    
    function getProductMaterialsCount(uint256 _productId) public view returns (uint256) {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        return productMaterials[_productId].length;
    }

    // ============ SUPPLY CHAIN STAGE FUNCTIONS ============
    
    function startManufacturing(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        uint256 mId = findManufacturer(msg.sender);
        require(mId > 0, "You are not a registered manufacturer");
        require(products[_productId].stage == STAGE.MaterialsAssigned, "Materials not yet assigned");
        require(productMaterials[_productId].length > 0, "No materials assigned to this product");
        
        products[_productId].manufacturerId = mId;
        products[_productId].stage = STAGE.Manufacturing;
        productTimelines[_productId].manufacturingStartedAt = block.timestamp;
        
        emit StageUpdated(_productId, STAGE.Manufacturing, msg.sender, block.timestamp);
    }
    
    function startDistribution(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        uint256 dId = findDistributor(msg.sender);
        require(dId > 0, "You are not a registered distributor");
        require(products[_productId].stage == STAGE.Manufacturing, "Product not in manufacturing stage");
        
        products[_productId].distributorId = dId;
        products[_productId].stage = STAGE.Distribution;
        productTimelines[_productId].manufacturingCompletedAt = block.timestamp;
        productTimelines[_productId].distributionStartedAt = block.timestamp;
        
        emit StageUpdated(_productId, STAGE.Distribution, msg.sender, block.timestamp);
    }
    
    function receiveAtRetail(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        uint256 rId = findRetailer(msg.sender);
        require(rId > 0, "You are not a registered retailer");
        require(products[_productId].stage == STAGE.Distribution, "Product not in distribution stage");
        
        products[_productId].retailerId = rId;
        products[_productId].stage = STAGE.Retail;
        productTimelines[_productId].retailReceivedAt = block.timestamp;
        
        emit StageUpdated(_productId, STAGE.Retail, msg.sender, block.timestamp);
    }
    
    function markAsSold(uint256 _productId) public {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        uint256 rId = findRetailer(msg.sender);
        require(rId > 0, "You are not a registered retailer");
        require(products[_productId].stage == STAGE.Retail, "Product not at retail stage");
        require(products[_productId].retailerId == rId, "You are not the assigned retailer");
        
        products[_productId].stage = STAGE.Sold;
        productTimelines[_productId].soldAt = block.timestamp;
        
        emit StageUpdated(_productId, STAGE.Sold, msg.sender, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============
    
    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        return products[_productId];
    }
    
    function getProductTimeline(uint256 _productId) public view returns (ProductTimeline memory) {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        return productTimelines[_productId];
    }
    
    function showStage(uint256 _productId) public view returns (string memory) {
        require(_productId > 0 && _productId <= productCtr, "Invalid product ID");
        STAGE s = products[_productId].stage;
        if (s == STAGE.Init) return "Product Created - Awaiting Materials";
        if (s == STAGE.MaterialsAssigned) return "Materials Assigned - Ready for Manufacturing";
        if (s == STAGE.Manufacturing) return "Manufacturing in Progress";
        if (s == STAGE.Distribution) return "In Distribution";
        if (s == STAGE.Retail) return "At Retail Store";
        if (s == STAGE.Sold) return "Sold to Consumer";
        return "Unknown";
    }
}
