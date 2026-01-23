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

    enum STAGE { Init, RawMaterialSupply, Manufacture, Distribution, Retail, sold }

    uint256 public productCtr = 0;
    uint256 public rmsCtr = 0;
    uint256 public manCtr = 0;
    uint256 public disCtr = 0;
    uint256 public retCtr = 0;

    // Timestamp tracking for each stage
    struct ProductHistory {
        uint256 orderedTimestamp;
        uint256 rmsTimestamp;
        uint256 manufacturingTimestamp;
        uint256 distributionTimestamp;
        uint256 retailTimestamp;
        uint256 soldTimestamp;
    }

    struct product {
        uint256 id;
        string name;
        string description;
        uint256 quantity;           // NEW: Product quantity
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        STAGE stage;
    }

    mapping(uint256 => product) public ProductStock;
    mapping(uint256 => ProductHistory) public ProductTimestamps;  // NEW: Timestamp tracking

    // Events for blockchain logging
    event ProductAdded(uint256 indexed productId, string name, uint256 quantity, uint256 timestamp);
    event StageUpdated(uint256 indexed productId, STAGE stage, address indexed actor, uint256 timestamp);
    event RoleAdded(string roleType, uint256 indexed roleId, address indexed addr, string name);

    function showStage(uint256 _productID) public view returns (string memory) {
        require(productCtr > 0, "No products exist");
        if (ProductStock[_productID].stage == STAGE.Init) return "Product Ordered";
        else if (ProductStock[_productID].stage == STAGE.RawMaterialSupply) return "Raw Material Supply Stage";
        else if (ProductStock[_productID].stage == STAGE.Manufacture) return "Manufacturing Stage";
        else if (ProductStock[_productID].stage == STAGE.Distribution) return "Distribution Stage";
        else if (ProductStock[_productID].stage == STAGE.Retail) return "Retail Stage";
        else if (ProductStock[_productID].stage == STAGE.sold) return "Product Sold";
        return "";
    }

    // Get all timestamps for a product
    function getProductTimestamps(uint256 _productID) public view returns (
        uint256 ordered,
        uint256 rms,
        uint256 manufacturing,
        uint256 distribution,
        uint256 retail,
        uint256 sold_time
    ) {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        ProductHistory memory history = ProductTimestamps[_productID];
        return (
            history.orderedTimestamp,
            history.rmsTimestamp,
            history.manufacturingTimestamp,
            history.distributionTimestamp,
            history.retailTimestamp,
            history.soldTimestamp
        );
    }

    struct rawMaterialSupplier { address addr; uint256 id; string name; string place; }
    mapping(uint256 => rawMaterialSupplier) public RMS;

    struct manufacturer { address addr; uint256 id; string name; string place; }
    mapping(uint256 => manufacturer) public MAN;

    struct distributor { address addr; uint256 id; string name; string place; }
    mapping(uint256 => distributor) public DIS;

    struct retailer { address addr; uint256 id; string name; string place; }
    mapping(uint256 => retailer) public RET;

    function addRMS(address _address, string memory _name, string memory _place) public onlyByOwner() {
        rmsCtr++;
        RMS[rmsCtr] = rawMaterialSupplier(_address, rmsCtr, _name, _place);
        emit RoleAdded("RMS", rmsCtr, _address, _name);
    }

    function addManufacturer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        manCtr++;
        MAN[manCtr] = manufacturer(_address, manCtr, _name, _place);
        emit RoleAdded("Manufacturer", manCtr, _address, _name);
    }

    function addDistributor(address _address, string memory _name, string memory _place) public onlyByOwner() {
        disCtr++;
        DIS[disCtr] = distributor(_address, disCtr, _name, _place);
        emit RoleAdded("Distributor", disCtr, _address, _name);
    }

    function addRetailer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        retCtr++;
        RET[retCtr] = retailer(_address, retCtr, _name, _place);
        emit RoleAdded("Retailer", retCtr, _address, _name);
    }

    function RMSsupply(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "You are not a registered Raw Material Supplier");
        require(ProductStock[_productID].stage == STAGE.Init, "Product not in Init stage");
        ProductStock[_productID].RMSid = _id;
        ProductStock[_productID].stage = STAGE.RawMaterialSupply;
        ProductTimestamps[_productID].rmsTimestamp = block.timestamp;
        emit StageUpdated(_productID, STAGE.RawMaterialSupply, msg.sender, block.timestamp);
    }

    function findRMS(address _address) private view returns (uint256) {
        require(rmsCtr > 0);
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return RMS[i].id;
        }
        return 0;
    }

    function Manufacturing(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "You are not a registered Manufacturer");
        require(ProductStock[_productID].stage == STAGE.RawMaterialSupply, "Product not in RawMaterialSupply stage");
        ProductStock[_productID].MANid = _id;
        ProductStock[_productID].stage = STAGE.Manufacture;
        ProductTimestamps[_productID].manufacturingTimestamp = block.timestamp;
        emit StageUpdated(_productID, STAGE.Manufacture, msg.sender, block.timestamp);
    }

    function findMAN(address _address) private view returns (uint256) {
        require(manCtr > 0);
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        return 0;
    }

    function Distribute(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "You are not a registered Distributor");
        require(ProductStock[_productID].stage == STAGE.Manufacture, "Product not in Manufacture stage");
        ProductStock[_productID].DISid = _id;
        ProductStock[_productID].stage = STAGE.Distribution;
        ProductTimestamps[_productID].distributionTimestamp = block.timestamp;
        emit StageUpdated(_productID, STAGE.Distribution, msg.sender, block.timestamp);
    }

    function findDIS(address _address) private view returns (uint256) {
        require(disCtr > 0);
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        return 0;
    }

    function Retail(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "You are not a registered Retailer");
        require(ProductStock[_productID].stage == STAGE.Distribution, "Product not in Distribution stage");
        ProductStock[_productID].RETid = _id;
        ProductStock[_productID].stage = STAGE.Retail;
        ProductTimestamps[_productID].retailTimestamp = block.timestamp;
        emit StageUpdated(_productID, STAGE.Retail, msg.sender, block.timestamp);
    }

    function findRET(address _address) private view returns (uint256) {
        require(retCtr > 0);
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return RET[i].id;
        }
        return 0;
    }

    function sold(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr, "Invalid product ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "You are not a registered Retailer");
        require(_id == ProductStock[_productID].RETid, "You are not the assigned Retailer for this product");
        require(ProductStock[_productID].stage == STAGE.Retail, "Product not in Retail stage");
        ProductStock[_productID].stage = STAGE.sold;
        ProductTimestamps[_productID].soldTimestamp = block.timestamp;
        emit StageUpdated(_productID, STAGE.sold, msg.sender, block.timestamp);
    }

    function addProduct(string memory _name, string memory _description, uint256 _quantity) public onlyByOwner() {
        require((rmsCtr > 0) && (manCtr > 0) && (disCtr > 0) && (retCtr > 0), "Register at least one of each role first");
        require(_quantity > 0, "Quantity must be greater than 0");
        productCtr++;
        ProductStock[productCtr] = product(productCtr, _name, _description, _quantity, 0, 0, 0, 0, STAGE.Init);
        ProductTimestamps[productCtr].orderedTimestamp = block.timestamp;
        emit ProductAdded(productCtr, _name, _quantity, block.timestamp);
    }

    // Legacy function for backward compatibility (default quantity = 1)
    function addMedicine(string memory _name, string memory _description) public onlyByOwner() {
        addProduct(_name, _description, 1);
    }
}
