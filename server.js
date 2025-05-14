const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Legge le chiavi dalla variabile di ambiente KEYS_JSON
let keys;
try {
  keys = JSON.parse(process.env.KEYS_JSON || '{}');
} catch (err) {
  console.error("❌ Errore nel parsing di KEYS_JSON:", err.message);
  process.exit(1); // Fermiamo il server se KEYS_JSON è invalido
}

// Provider Polygon
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');

// Contratto
const CONTRACT_ADDRESS = '0x6a6d5Dc29ad8ff23209186775873e123b31c26E9';
const CONTRACT_ABI = ['function balanceOf(address owner, uint256 id) view returns (uint256)'];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Route di verifica
app.get('/', (req, res) => {
  res.send('✅ Server attivo su Heroku e KEYS_JSON caricato!');
});

// Route POST /get-key
app.post('/get-key', async (req, res) => {
  const { address, tokenId } = req.body;
  if (!address || !tokenId) {
    return res.status(400).json({ error: 'Missing address or tokenId' });
  }

  try {
    const balance = await contract.balanceOf(address, tokenId);
    if (balance.toNumber() > 0) {
      const key = keys[`${tokenId.padStart(2, '0')}.jpg.enc`] || keys[`${tokenId}.jpg.enc`] || keys[`${tokenId}.JPG.enc`];
      if (key) {
        return res.json({ success: true, key });
      } else {
        return res.status(404).json({ error: 'Key not found for tokenId' });
      }
    } else {
      return res.status(403).json({ error: 'You do not own this token' });
    }
  } catch (err) {
    console.error('❌ Errore in /get-key:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend in esecuzione sulla porta ${PORT}`));
