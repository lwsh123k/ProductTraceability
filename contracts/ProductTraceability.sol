// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

// 文件名和合约名相同
contract ProductTraceability {
    // 商品信息结构体
    struct Product {
        string name;        // 商品名称
        string manufacturer;// 生产厂商
        uint productionDate;// 生产日期
        string batchNumber; // 批次号，唯一标识
        string imgHash;     // 图片hash
        int8 visitedTime;  // 查看次数 
        string encryptedMessage;    // 加密后的信息
        uint timestamps;  // 时间戳
        address operators;// 操作者地址
    }

    // 商品信息映射
    mapping (string => Product) private products;
    // 用户权限，谁可以操作
    mapping (address => string) private permissions;

    // 记录商品信息
    function addProduct(string memory name, string memory manufacturer, uint productionDate, string memory batchNumber, string memory imgHash, string memory encryptedMessage) public {
        // 检查商品是否已存在
        require(bytes(products[batchNumber].name).length == 0, "Product already exists");

        // 记录商品信息
        products[batchNumber] = Product(name, manufacturer, productionDate, batchNumber, imgHash, -1, encryptedMessage, block.timestamp, msg.sender);
    }


    // 查询商品信息
    function getProduct(string memory batchNumber) public returns (string memory, string memory, uint, string memory, int8, string memory, uint) {
        // 检查商品是否存在
        require(bytes(products[batchNumber].name).length != 0, "Product does not exist");
        products[batchNumber].visitedTime = products[batchNumber].visitedTime + 1;
        // 返回商品信息
        return (products[batchNumber].name, products[batchNumber].manufacturer, products[batchNumber].productionDate, products[batchNumber].imgHash, products[batchNumber].visitedTime, products[batchNumber].encryptedMessage, products[batchNumber].timestamps);
    }
}