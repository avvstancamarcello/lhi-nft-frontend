const { Wallet, JsonRpcProvider } = require("ethers");

const privateKey = "0x40aad33f643b436f6b89e6fd78adf046c527d616"; // Inserisci la tua chiave privata
const rpcUrl = "https://dawn-spring-hill.base-mainnet.quiknode.pro/85db06e7c4f5260e4128fdf91e8d03bf54b507d3"; // URL RPC della rete Base Mainnet

async function getWalletAddress() {
  try {
    console.log("Inizio verifica della chiave privata e connessione al server...");

    // Configura il provider con un timeout massimo di 40 secondi
    const provider = new JsonRpcProvider(rpcUrl, { timeout: 40000 });
    console.log("Connessione al server configurata con un timeout massimo di 40 secondi.");

    // Verifica la chiave privata
    const wallet = new Wallet(privateKey, provider);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);

    // Verifica il saldo del wallet
    console.log("Recupero del saldo del wallet...");
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("Errore durante la connessione o la verifica:", error.message);
  }
}

getWalletAddress();
const { Wallet, JsonRpcProvider } = require("ethers");

const privateKey = "0x40aad33f643b436f6b89e6fd78adf046c527d616"; // Inserisci la tua chiave privata
const rpcUrl = "https://dawn-spring-hill.base-mainnet.quiknode.pro/85db06e7c4f5260e4128fdf91e8d03bf54b507d3"; // URL RPC della rete Base Mainnet

async function getWalletAddress() {
  try {
    console.log("Connettendosi alla rete con un timeout massimo di 40 secondi...");
    const provider = new JsonRpcProvider(rpcUrl, { timeout: 40000 }); // Timeout di 40 secondi

    const wallet = new Wallet(privateKey, provider);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);

    // Verifica il saldo del wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("Errore durante la connessione o la verifica:", error.message);
  }
}

getWalletAddress();
const { Wallet } = require("ethers");

const privateKey = "0x40aad33f643b436f6b89e6fd78adf046c527d616"; // Inserisci la tua chiave privata
const wallet = new Wallet(privateKey);

console.log("Indirizzo del wallet:", wallet.address);
