const hre = require("hardhat");
const fs = require("fs"); // Importa il modulo 'fs' (File System)

async function main() {
  try {
    const LHILecceNFT = await hre.ethers.getContractFactory("LHILecceNFT"); // NOME CORRETTO
    const lhiLecceNFT = await LHILecceNFT.deploy(""); // Passa una stringa vuota come baseURI

    await lhiLecceNFT.waitForDeployment();

    const contractAddress = lhiLecceNFT.target;
    console.log(`LHILecceNFT deployed to ${contractAddress}`); // NOME CORRETTO

    // Salva l'indirizzo del contratto in un file JSON
    fs.writeFileSync(
      "contract-address.json",
      JSON.stringify({ address: contractAddress }, null, 2) // Usa JSON.stringify con indentazione (per leggibilità)
    );
    console.log("Contract address saved to contract-address.json");

  } catch (error) {
    console.error("Deployment error:", error);
    process.exitCode = 1;
  }
}

main();