require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: { // Aggiungi questa configurazione per localhost
      url: "http://127.0.0.1:8545",
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/",
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    amoy: { // Rete corretta per la testnet di Polygon
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology", // Usa la variabile corretta
      accounts: [PRIVATE_KEY],
      chainId: 80002, // Chain ID corretto per Amoy
      // gasPrice: 8000000000, // Rimuovi se non necessario
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org/",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    baseSepolia: { // Usa un nome coerente: baseSepolia
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org", // Usa la variabile corretta
      accounts: [PRIVATE_KEY],
      chainId: 84532, // Chain ID corretto per Base Sepolia
      // gasPrice: 1000000000, // Rimuovi se non necessario
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY, // Usiamo la stessa API key per Amoy
      base: process.env.BASESCAN_API_KEY,
      baseGoerli: process.env.BASESCAN_API_KEY, // Usa baseSepolia
      sepolia: process.env.ETHERSCAN_API_KEY, // Usa Etherscan per Sepolia
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
      {  //Rinomina in baseSepolia
        network: "baseSepolia",  // Usa lo stesso nome della rete
        chainId: 84532, // Chain ID corretto
        urls: {
            apiURL:  "https://api-sepolia.basescan.org/api",
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
        //Aggiungi la configurazione per Amoy, se vuoi verificarlo.
        {
            network: "amoy",
            chainId: 80002,
            urls:{
                apiURL: "https://api-amoy.polygonscan.com/api",
                browserURL: "https://amoy.polygonscan.com/"
            }
        }
    ],
  },
};