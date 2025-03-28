require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL); // Usa l'URL RPC della rete che vuoi testare

  try {
    const balance = await provider.getBalance(process.env.WALLET_ADDRESS);
    console.log(`Account address: ${process.env.WALLET_ADDRESS}`);
    console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);
  } catch (error) {
    console.error('Errore nella verifica della chiave privata:', error);
  }
}

main();