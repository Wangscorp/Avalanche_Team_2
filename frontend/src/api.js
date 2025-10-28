// Web3 and Contract configurations for Avalanche Farmers Market

import { ethers } from "ethers";

// Contract ABI - will be imported from deployments
const contractABI = [
  "function listProduct(string name, string description, string image, uint256 price, uint256 quantity)",
  "function updateProduct(uint256 productId, string name, string description, string image, uint256 price, uint256 quantity)",
  "function deactivationProduct(uint256 productId)",
  "function getProducts() view returns (tuple(uint256 id, address farmer, string name, string description, string image, uint256 price, uint256 quantity, bool isActive, uint256 createdAt)[])",
  "function getFarmerProducts(address farmer) view returns (tuple(uint256 id, address farmer, string name, string description, string image, uint256 price, uint256 quantity, bool isActive, uint256 createdAt)[])",
  "function buyProduct(uint256 productId, uint256 quantity) payable",
  "function markDelivered(uint256 orderId)",
  "function completeOrder(uint256 orderId)",
  "function cancelOrder(uint256 orderId)",
  "function disputeOrder(uint256 orderId)",
  "function getUserOrders() view returns (tuple(uint256 id, uint256 productId, address buyer, uint256 quantity, uint256 totalPrice, uint8 status, uint256 orderedAt, uint256 deliveredAt)[])",
  "function products(uint256) view returns (uint256 id, address farmer, string name, string description, string image, uint256 price, uint256 quantity, bool isActive, uint256 createdAt)",
  "function orders(uint256) view returns (uint256 id, uint256 productId, address buyer, uint256 quantity, uint256 totalPrice, uint8 status, uint256 orderedAt, uint256 deliveredAt)",
];

// Avalanche Fuji Testnet contract address (will be updated after deployment)
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourContractAddress";

// Avalanche Fuji Testnet chain ID
export const AVALANCHE_CHAIN_ID = 43113;

// Network configuration
const avalancheFuji = {
  chainId: `0x${AVALANCHE_CHAIN_ID.toString(16)}`,
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

// Global variables
let provider;
let signer;
let contract;

// Initialize provider
export const initializeProvider = () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  } else {
    throw new Error("Please install MetaMask!");
  }
};

// Connect wallet
export const connectWallet = async () => {
  try {
    await initializeProvider();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    await switchToAvalanche();
    return {
      address: accounts[0],
      signer,
      contract,
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};

// Switch to Avalanche Fuji testnet
export const switchToAvalanche = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: avalancheFuji.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [avalancheFuji],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

// Get contract instance (read-only)
export const getContract = () => {
  if (!contract) {
    throw new Error("Contract not initialized. Please connect wallet first.");
  }
  return contract;
};

// Get signer
export const getSigner = () => signer;

// Convert price to wei (assuming price is in AVAX with 2 decimal places for KSH equivalent)
export const priceToWei = (price) => {
  // Assuming 1 AVAX = 100,000 KSH, so price in KSH = price * 10^16 wei
  const kshToWei = BigInt(price) * BigInt(10) ** BigInt(16);
  return kshToWei.toString();
};

// Convert wei to price display
export const weiToPrice = (wei) => {
  const kshValue = BigInt(wei) / BigInt(10) ** BigInt(16);
  return kshValue.toString();
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  if (!window.ethereum) return false;
  try {
    await initializeProvider();
    const network = await provider.getNetwork();
    return network.chainId === BigInt(AVALANCHE_CHAIN_ID);
  } catch {
    return false;
  }
};
