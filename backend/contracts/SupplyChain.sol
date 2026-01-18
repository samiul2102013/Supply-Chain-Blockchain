// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public Owner;

    constructor() {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner);
        _;
    }

    enum STAGE { Init, RawMaterialSupply, Manufacture, Distribution, Retail, sold }

    uint256 public productCtr = 0;
    uint256 public rmsCtr = 0;
    uint256 public manCtr = 0;
    uint256 public disCtr = 0;
    uint256 public retCtr = 0;

    struct product {
        uint256 id;
        string name;
        string description;
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        STAGE stage;
    }

    mapping(uint256 => product) public ProductStock;

    function showStage(uint256 _productID) public view returns (string memory) {
        require(productCtr > 0);
        if (ProductStock[_productID].stage == STAGE.Init) return "Product Ordered";
        else if (ProductStock[_productID].stage == STAGE.RawMaterialSupply) return "Raw Material Supply Stage";
        else if (ProductStock[_productID].stage == STAGE.Manufacture) return "Manufacturing Stage";
        else if (ProductStock[_productID].stage == STAGE.Distribution) return "Distribution Stage";
        else if (ProductStock[_productID].stage == STAGE.Retail) return "Retail Stage";
        else if (ProductStock[_productID].stage == STAGE.sold) return "Product Sold";
        return "";
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
    }

    function addManufacturer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        manCtr++;
        MAN[manCtr] = manufacturer(_address, manCtr, _name, _place);
    }

    function addDistributor(address _address, string memory _name, string memory _place) public onlyByOwner() {
        disCtr++;
        DIS[disCtr] = distributor(_address, disCtr, _name, _place);
    }

    function addRetailer(address _address, string memory _name, string memory _place) public onlyByOwner() {
        retCtr++;
        RET[retCtr] = retailer(_address, retCtr, _name, _place);
    }

    function RMSsupply(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr);
        uint256 _id = findRMS(msg.sender);
        require(_id > 0);
        require(ProductStock[_productID].stage == STAGE.Init);
        ProductStock[_productID].RMSid = _id;
        ProductStock[_productID].stage = STAGE.RawMaterialSupply;
    }

    function findRMS(address _address) private view returns (uint256) {
        require(rmsCtr > 0);
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return RMS[i].id;
        }
        return 0;
    }

    function Manufacturing(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr);
        uint256 _id = findMAN(msg.sender);
        require(_id > 0);
        require(ProductStock[_productID].stage == STAGE.RawMaterialSupply);
        ProductStock[_productID].MANid = _id;
        ProductStock[_productID].stage = STAGE.Manufacture;
    }

    function findMAN(address _address) private view returns (uint256) {
        require(manCtr > 0);
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        return 0;
    }

    function Distribute(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr);
        uint256 _id = findDIS(msg.sender);
        require(_id > 0);
        require(ProductStock[_productID].stage == STAGE.Manufacture);
        ProductStock[_productID].DISid = _id;
        ProductStock[_productID].stage = STAGE.Distribution;
    }

    function findDIS(address _address) private view returns (uint256) {
        require(disCtr > 0);
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        return 0;
    }

    function Retail(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr);
        uint256 _id = findRET(msg.sender);
        require(_id > 0);
        require(ProductStock[_productID].stage == STAGE.Distribution);
        ProductStock[_productID].RETid = _id;
        ProductStock[_productID].stage = STAGE.Retail;
    }

    function findRET(address _address) private view returns (uint256) {
        require(retCtr > 0);
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return RET[i].id;
        }
        return 0;
    }

    function sold(uint256 _productID) public {
        require(_productID > 0 && _productID <= productCtr);
        uint256 _id = findRET(msg.sender);
        require(_id > 0);
        require(_id == ProductStock[_productID].RETid);
        require(ProductStock[_productID].stage == STAGE.Retail);
        ProductStock[_productID].stage = STAGE.sold;
    }

    function addProduct(string memory _name, string memory _description) public onlyByOwner() {
        require((rmsCtr > 0) && (manCtr > 0) && (disCtr > 0) && (retCtr > 0));
        productCtr++;
        ProductStock[productCtr] = product(productCtr, _name, _description, 0, 0, 0, 0, STAGE.Init);
    }
}
