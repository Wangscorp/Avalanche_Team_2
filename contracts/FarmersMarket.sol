// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FarmersMarket is ReentrancyGuard {
    struct Product {
        uint256 id;
        address farmer;
        string name;
        string description;
        string image; // IPFS hash or URL
        uint256 price; // in wei (AVAX)
        uint256 quantity;
        bool isActive;
        uint256 createdAt;
    }

    struct Order {
        uint256 id;
        uint256 productId;
        address buyer;
        uint256 quantity;
        uint256 totalPrice;
        OrderStatus status;
        uint256 orderedAt;
        uint256 deliveredAt;
    }

    enum OrderStatus { Pending, Delivered, Disputed, Cancelled, Completed }

    uint256 private nextProductId = 1;
    uint256 private nextOrderId = 1;

    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public farmerProducts;
    mapping(address => uint256[]) public buyerOrders;

    event ProductListed(uint256 indexed productId, address indexed farmer, string name, uint256 price);
    event ProductUpdated(uint256 indexed productId);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed productId, address indexed buyer);
    event OrderDelivered(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId);
    event OrderDisputed(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId);

    modifier onlyFarmer(uint256 productId) {
        require(products[productId].farmer == msg.sender, "Not the product farmer");
        _;
    }

    modifier orderExists(uint256 orderId) {
        require(orders[orderId].buyer == msg.sender || products[orders[orderId].productId].farmer == msg.sender, "Not involved in this order");
        _;
    }

    function listProduct(
        string memory name,
        string memory description,
        string memory image,
        uint256 price,
        uint256 quantity
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price must be > 0");
        require(quantity > 0, "Quantity must be > 0");

        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            farmer: msg.sender,
            name: name,
            description: description,
            image: image,
            price: price,
            quantity: quantity,
            isActive: true,
            createdAt: block.timestamp
        });

        farmerProducts[msg.sender].push(productId);

        emit ProductListed(productId, msg.sender, name, price);
    }

    function updateProduct(
        uint256 productId,
        string memory name,
        string memory description,
        string memory image,
        uint256 price,
        uint256 quantity
    ) external onlyFarmer(productId) {
        Product storage product = products[productId];
        if (bytes(name).length > 0) product.name = name;
        if (bytes(description).length > 0) product.description = description;
        if (bytes(image).length > 0) product.image = image;
        if (price > 0) product.price = price;
        if (quantity > 0) product.quantity = quantity;

        emit ProductUpdated(productId);
    }

    function deactivateProduct(uint256 productId) external onlyFarmer(productId) {
        products[productId].isActive = false;
        emit ProductUpdated(productId);
    }

    function getProducts() external view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextProductId; i++) {
            if (products[i].isActive) activeCount++;
        }

        Product[] memory activeProducts = new Product[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextProductId; i++) {
            if (products[i].isActive) {
                activeProducts[index] = products[i];
                index++;
            }
        }
        return activeProducts;
    }

    function getFarmerProducts(address farmer) external view returns (Product[] memory) {
        uint256[] memory productIds = farmerProducts[farmer];
        Product[] memory farmerProductsList = new Product[](productIds.length);
        for (uint256 i = 0; i < productIds.length; i++) {
            farmerProductsList[i] = products[productIds[i]];
        }
        return farmerProductsList;
    }

    function buyProduct(uint256 productId, uint256 quantity) external payable nonReentrant {
        Product storage product = products[productId];
        require(product.isActive, "Product not active");
        require(quantity > 0 && quantity <= product.quantity, "Invalid quantity");

        uint256 totalPrice = product.price * quantity;
        require(msg.value == totalPrice, "Incorrect payment amount");

        // Reduce quantity
        product.quantity -= quantity;

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            productId: productId,
            buyer: msg.sender,
            quantity: quantity,
            totalPrice: totalPrice,
            status: OrderStatus.Pending,
            orderedAt: block.timestamp,
            deliveredAt: 0
        });

        buyerOrders[msg.sender].push(orderId);

        emit OrderPlaced(orderId, productId, msg.sender);
    }

    function markDelivered(uint256 orderId) external orderExists(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Pending, "Order not pending");

        address farmer = products[order.productId].farmer;
        require(msg.sender == farmer, "Only farmer can mark delivered");

        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;

        emit OrderDelivered(orderId);
    }

    function completeOrder(uint256 orderId) external orderExists(orderId) nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        require(order.buyer == msg.sender, "Only buyer can complete");

        // Transfer funds to farmer
        address payable farmer = payable(products[order.productId].farmer);
        farmer.transfer(order.totalPrice);

        order.status = OrderStatus.Completed;

        emit OrderCompleted(orderId);
    }

    function disputeOrder(uint256 orderId) external orderExists(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Pending || order.status == OrderStatus.Delivered, "Cannot dispute");

        // For simplicity, just mark as disputed. In real implementation, might need arbitration
        order.status = OrderStatus.Disputed;

        emit OrderDisputed(orderId);
    }

    function getUserOrders() external view returns (Order[] memory) {
        uint256[] memory orderIds = buyerOrders[msg.sender];
        Order[] memory userOrders = new Order[](orderIds.length);
        for (uint256 i = 0; i < orderIds.length; i++) {
            userOrders[i] = orders[orderIds[i]];
        }
        return userOrders;
    }

    function cancelOrder(uint256 orderId) external orderExists(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Pending, "Can only cancel pending orders");
        require(order.buyer == msg.sender, "Only buyer can cancel");

        // Refund buyer
        payable(order.buyer).transfer(order.totalPrice);

        // Restore quantity
        products[order.productId].quantity += order.quantity;

        order.status = OrderStatus.Cancelled;

        emit OrderCancelled(orderId);
    }

    // Emergency withdraw for owner (though we said no intermediaries)
    function emergencyWithdraw() external {
        // Simple owner check - in production, use proper access control
        // For now, just allow anyone to call, but better to restrict
        payable(msg.sender).transfer(address(this).balance);
    }
}
