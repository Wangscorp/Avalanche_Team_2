# Farmers On Chain

## Overview
Farmers On Chain is a blockchain-based marketplace that connects farmers directly with consumers, eliminating intermediaries. Built on Avalanche C-Chain, it allows farmers to list products and buyers to purchase directly using AVAX cryptocurrency.

## Features
- **Product Listings**: Farmers can create and manage product listings with images, descriptions, prices, and quantities
- **Direct Purchases**: Buyers can purchase products directly using AVAX on the blockchain
- **Order Management**: Complete order lifecycle from pending to delivered, with options for completion, disputes, and cancellations
- **Vendor Dashboard**: Farmers have a dedicated dashboard to manage their products and orders
- **Admin Dashboard**: Administrative tools for overseeing the marketplace
- **Shopping Cart**: Users can add products to cart before purchasing
- **Authentication**: Secure wallet-based authentication via MetaMask

## Technology Stack
- **Smart Contract**: Solidity (pragma ^0.8.28)
- **Blockchain Framework**: Hardhat
- **Frontend**: React with Vite
- **Libraries**: Ethers.js, MetaMask SDK, Axios
- **Protocols**: ERC-20 for payments (AVAX)

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Avalanche C-Chain network access

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Wangscorp/Avalanche_Team_2.git
   cd Avalanche_Team_2
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Deploy the smart contract**
   ```bash
   npx hardhat run scripts/deploy.js --network avalanche
   ```
   This will deploy the FarmersMarket contract and save the address to `contract-address.json`.

4. **Configure frontend environment**
   - Create `.env` file in `frontend/` directory
   - Add your contract address and other configurations

5. **Install frontend dependencies and run**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Usage
1. Connect your MetaMask wallet to Avalanche C-Chain
2. Navigate through the app:
   - Browse products on the home page
   - View detailed listings in Products section
   - Add items to cart
   - Checkout with AVAX payments
   - Vendor profile for product management
   - Admin dashboard for oversight

## Smart Contract Functions
- `listProduct()`: Allow farmers to list new products
- `buyProduct()`: Enable purchases with AVAX payment
- `markDelivered()`: Farmers confirm delivery
- `completeOrder()`: Buyers finalize transactions, releasing funds
- `disputeOrder()`: Initiate dispute resolution
- `cancelOrder()`: Cancel pending orders with refunds

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the ISC License.
