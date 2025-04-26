const { Wallet } = require("ethers");

const privateKey = "0x40aad33f643b436f6b89e6fd78adf046c527d616"; // Inserisci la tua chiave privata
const wallet = new Wallet(privateKey);

console.log("Indirizzo del wallet:", wallet.address);
