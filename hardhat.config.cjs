require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY; // Usa la variabile d'ambiente per la chiave privata

if (!PRIVATE_KEY) {
  throw new Error("Per favore, definisci PRIVATE_KEY nel file .env");
}

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    polygon: {
      url: "https://proportionate-dry-brook.matic.quiknode.pro/752b1e43a682209ddc19a49978c10acac9458739",
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    amoy: {
      url: "https://cold-yolo-tent.matic-amoy.quiknode.pro/0946df8b9a68a2c0cbe86704a1e292aaa4697b95",
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
    base: {
      url: "https://dawn-spring-hill.base-mainnet.quiknode.pro/85db06e7c4f5260e4128fdf91e8d03bf54b507d3",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    baseSepolia: {
      url: "https://evocative-sparkling-model.base-sepolia.quiknode.pro/0787ca6fcee8ea4b0f0adc88d6f69abcf3a69729",
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    sepolia: {
      url: "https://blue-multi-hill.ethereum-sepolia.quiknode.pro/5328e177aeef3cd63a0dc5a02af208d21bc094a0",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY, // Richiama la variabile dal file .env
      base: process.env.BASESCAN_API_KEY, // Richiama la variabile dal file .env
      sepolia: process.env.ETHERSCAN_API_KEY, // Richiama la variabile dal file .env
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/",
        },
      },
    ],
  },
};