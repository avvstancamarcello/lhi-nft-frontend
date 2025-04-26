const ethers = require("ethers");

function verifyPrivateKey(privateKey) {
  
  try {
    const wallet = new ethers.Wallet(privateKey);    node /home/avvocato/LHI-NFT-CORRETTO/verifyPrivateKey.cjs 0x9f3b04709565e73ffe523577b18b2cba7499688b03820fefe5fc25e57c8a9c3c
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

// Leggi la chiave privata dalla riga di comando
const privateKey = process.argv[2];

if (!privateKey) {
  console.error("Errore: specifica una chiave privata come argomento.");
  process.exit(1);
}

verifyPrivateKey(privateKey);
const ethers = require("ethers");

function verifyPrivateKey(privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Chiave privata valida!");
    console.log("Indirizzo del wallet:", wallet.address);
  } catch (error) {
    console.error("Errore: Chiave privata non valida.", error.message);
  }
}

// Leggi la chiave privata dalla riga di comando
const privateKey = process.argv[2];

if (!privateKey) {
  console.error("Errore: specifica una chiave privata come argomento.");
  process.exit(1);
}

verifyPrivateKey(privateKey);
