const fs = require("fs");

// Leggi il file pinata_ipfs_database.txt
const data = fs.readFileSync("pinata_ipfs_database.txt", "utf8");

// Mappatura per tokenId -> CID e valore monetario
const nftData = {};

// Funzione per calcolare il valore monetario
const calculateMonetaryValue = (fileName) => {
  const baseValue = 10; // 100 corrisponde a 10 unità monetarie
  const numericPart = parseInt(fileName.match(/\d+/)[0], 10); // Estrai il numero dal nome del file
  return (numericPart / 10) * baseValue; // Calcola il valore in unità monetarie
};

// Analizza ogni riga del file
data.split("\n").forEach((line, index) => {
  const [fileName, cid] = line.split(",").map((item) => item.trim());
  if (fileName && cid) {
    const value = calculateMonetaryValue(fileName); // Calcola il valore monetario
    nftData[index + 1] = { cid, value }; // Usa index + 1 come tokenId
  }
});

// Stampa i risultati
console.log("Mappatura NFT (tokenId -> CID e valore):");
console.log(nftData);

// Genera i comandi per impostare i CID nel contratto
Object.entries(nftData).forEach(([tokenId, { cid, value }]) => {
  console.log(`await contract.setTokenCID(${tokenId}, "${cid}"); // Valore: ${value} unità monetarie`);
});
