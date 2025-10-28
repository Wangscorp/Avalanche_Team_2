require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // Avalanche is EVM compatible, latest Solidity version is fine
  networks: {
    hardhat: {}, // For local development
    avalancheFujiTestnet: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [], // Will add private key later
    },
    avalancheMainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: [], // Private key for mainnet
    }
  },
  gasReporter: {
    enabled: true,
  }
};
