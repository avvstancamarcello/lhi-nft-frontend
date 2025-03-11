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
    hardhat: { // Rete locale
      chainId: 31337,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/", // Usa la tua variabile o un URL di fallback
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com/",
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      gasPrice: 8000000000, // A volte necessario su Mumbai
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org/",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    baseGoerli: {
      url: process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org/",
      accounts: [PRIVATE_KEY],
      chainId: 84531,
      gasPrice: 1000000000, // Potrebbe essere necessario su Goerli
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY, // Puoi usare la stessa API key
      base: process.env.BASESCAN_API_KEY,
      baseGoerli: process.env.BASESCAN_API_KEY, // Puoi usare la stessa API key
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
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
    ],
  },
};