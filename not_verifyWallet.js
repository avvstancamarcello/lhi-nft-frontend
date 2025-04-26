require("dotenv").config();
const { ethers } = require("ethers");

async function verifyWallet() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL;

  console.log("DEBUG: Lunghezza PRIVATE_KEY:", privateKey.length); // Verifica la lunghezza
  console.log("DEBUG: BASE_RPC_URL:", rpcUrl);    // Log per debug

  if (!privateKey || privateKey.length !== 66 || !privateKey.startsWith("0x")) {
    console.error("Errore: PRIVATE_KEY non è valida. Deve essere una stringa esadecimale di 64 caratteri preceduta da '0x'.");
    process.exit(1);
  }

  if (!privateKey || !rpcUrl) {
    console.error("Errore: PRIVATE_KEY o BASE_RPC_URL non sono definiti nel file .env.");
    process.exit(1);
  }

  try {
    console.log("DEBUG: Creazione del provider...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    console.log("DEBUG: Creazione del wallet...");
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Indirizzo del wallet:", wallet.address);

    console.log("DEBUG: Recupero del saldo...");
    const balance = await provider.getBalance(wallet.address);
    console.log(`Saldo del wallet: ${ethers.formatEther(balance)} ETH`);

    const requiredGas = ethers.ethers.utils.parseEther("0.01"); // Esempio: 0.01 ETH richiesti per il deploy
    if (BigInt(balance) >= BigInt(requiredGas)) {
      console.log("Il wallet dispone di fondi sufficienti per il deploy.");
    } else {
      console.error("Saldo insufficiente! Ricarica il wallet con almeno 0.01 ETH.");
    }
  } catch (error) {
    console.error("Errore durante la verifica del wallet:", error.message);
  }
}

verifyWallet();
