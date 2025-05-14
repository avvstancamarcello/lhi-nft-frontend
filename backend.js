require('dotenv').config();
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const https = require('https');

const app = express();
app.use(express.json());
app.use(cors());

const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-rpc.com";
const provider = new ethers.JsonRpcProvider(POLYGON_RPC);

// ABI minimale per balanceOf(address, uint256)
const CONTRACT_ADDRESS = "0x6a6d5Dc29ad8ff23209186775873e123b31c26E9";
const CONTRACT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)"
];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

const keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));
const decryptor = JSON.parse(fs.readFileSync("keys_decryptor.json", "utf8"));

function findFileNameByTokenId(tokenId) {
  // Possibili nomi file (con e senza zero iniziale, .jpg/.JPG)
  const idStr = tokenId.toString();
  const idStrPadded = idStr.padStart(2, "0");
  const possibleNames = [
    `${idStr}.jpg.enc`,
    `${idStr}.JPG.enc`,
    `${idStrPadded}.jpg.enc`,
    `${idStrPadded}.JPG.enc`
  ];
  for (const entry of keys) {
    for (const name of possibleNames) {
      if (entry.fileName.toLowerCase() === name.toLowerCase()) {
        return entry.fileName;
      }
    }
  }
  return null;
}

const LOG_FILE = "backend_access.log";
function logAccess({ address, tokenId, fileName, result, error }) {
  const now = new Date().toISOString();
  const logLine = `${now} | address: ${address} | tokenId: ${tokenId} | file: ${fileName || "-"} | result: ${result} | error: ${error || "-"}\n`;
  fs.appendFile(LOG_FILE, logLine, (err) => {
    if (err) console.error("Logging error:", err);
  });
}

app.get("/get-key", async (req, res) => {
  const { tokenId, address } = req.query;
  let fileName = null;
  try {
    if (!tokenId || !address) {
      logAccess({ address, tokenId, fileName, result: "fail", error: "Missing tokenId or address" });
      return res.status(400).json({ error: "Missing tokenId or address" });
    }
    fileName = findFileNameByTokenId(tokenId);
    if (!fileName) {
      logAccess({ address, tokenId, fileName, result: "fail", error: "File not found for tokenId" });
      return res.status(404).json({ error: "File not found for tokenId" });
    }
    // Verifica on-chain che l'address sia owner di almeno 1 NFT di quel tokenId
    const balance = await contract.balanceOf(address, tokenId);
    if (balance <= 0) {
      logAccess({ address, tokenId, fileName, result: "fail", error: "Address does not own this NFT" });
      return res.status(403).json({ error: "Address does not own this NFT" });
    }
    const key = decryptor[fileName];
    if (!key) {
      logAccess({ address, tokenId, fileName, result: "fail", error: "Key not found for file" });
      return res.status(404).json({ error: "Key not found for file" });
    }
    logAccess({ address, tokenId, fileName, result: "success" });
    res.json({ key });
  } catch (err) {
    logAccess({ address, tokenId, fileName, result: "fail", error: err.message });
    return res.status(500).json({ error: "On-chain verification failed" });
  }
});

// Wrapper per loggare tutte le richieste
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const logLine = `${now} | endpoint: ${req.method} ${req.originalUrl} | ip: ${req.ip}\n`;
  fs.appendFile(LOG_FILE, logLine, (err) => {
    if (err) console.error("Logging error:", err);
  });
  next();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// --- Nuova parte per minting e acquisto NFT ---

const ABI = require('./LHI_NFT_Mobile/LHILecceNFT_ABI.json');
const PROVIDER_URL = 'http://127.0.0.1:8545'; // Cambia se usi un altro nodo locale
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'INSERISCI_LA_TUA_PRIVATE_KEY';
const ACQUISTI_FILE = './acquisti.json';

const providerMint = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, providerMint);
const contractMint = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// Utility per registrare un acquisto
function registraAcquisto(acquisto) {
  let acquisti = [];
  if (fs.existsSync(ACQUISTI_FILE)) {
    acquisti = JSON.parse(fs.readFileSync(ACQUISTI_FILE));
  }
  acquisti.push(acquisto);
  fs.writeFileSync(ACQUISTI_FILE, JSON.stringify(acquisti, null, 2));
}

// Endpoint per mintare NFT
app.post('/mint', async (req, res) => {
  const { user, tokenId, quantity } = req.body;
  try {
    const tx = await contractMint.mintNFT(tokenId, quantity, false, { from: user });
    await tx.wait();
    registraAcquisto({ user, tokenId, quantity, txHash: tx.hash, timestamp: Date.now() });
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint per vedere tutti gli acquisti
app.get('/acquisti', (req, res) => {
  if (!fs.existsSync(ACQUISTI_FILE)) return res.json([]);
  const acquisti = JSON.parse(fs.readFileSync(ACQUISTI_FILE));
  res.json(acquisti);
});

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};
https.createServer(options, app).listen(3443, () => {
  console.log('Backend HTTPS listening on port 3443');
});