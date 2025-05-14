const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const morgan = require('morgan'); // Importa il middleware per il logging

const app = express();

// Middleware per il logging delle richieste HTTP
app.use(morgan('combined')); // 'combined' fornisce un log standard dettagliato
app.use(cors());
app.use(express.json());

// Legge le chiavi dalla variabile di ambiente KEYS_JSON
let keys;
try {
    keys = JSON.parse(process.env.KEYS_JSON || '{}');
    console.log('✅ KEYS_JSON caricato con successo.');
} catch (err) {
    console.error("❌ Errore nel parsing di KEYS_JSON:", err.message);
    process.exit(1); // Fermiamo il server se KEYS_JSON è invalido
}

// Provider Polygon
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
console.log('🔗 Connessione al provider Polygon stabilita.');

// Contratto
const CONTRACT_ADDRESS = '0x6a6d5Dc29ad8ff23209186775873e123b31c26E9';
const CONTRACT_ABI = ['function balanceOf(address owner, uint256 id) view returns (uint256)'];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
console.log(`📄 Contratto NFT istanziato all'indirizzo: ${CONTRACT_ADDRESS}`);

// Route di verifica
app.get('/', (req, res) => {
    res.send('✅ Server attivo su Heroku e KEYS_JSON caricato!');
    console.log('ℹ️ Route /: Server attivo e KEYS_JSON caricato.');
});

// Route POST /get-key
app.post('/get-key', async (req, res) => {
    const { address, tokenId } = req.body;
    console.log(`➡️ Ricevuta richiesta POST a /get-key con address: ${address}, tokenId: ${tokenId}`);

    if (!address || !tokenId) {
        console.warn('⚠️ Richiesta a /get-key mancante di address o tokenId.');
        return res.status(400).json({ error: 'Missing address or tokenId' });
    }

    try {
        const balance = await contract.balanceOf(address, tokenId);
        console.log(`ℹ️ Bilancio per l'indirizzo ${address}, tokenId ${tokenId}: ${balance.toNumber()}`);

        if (balance.toNumber() > 0) {
            // Ricerca case-insensitive della chiave
            const key = keys[`${tokenId.padStart(2, '0')}.jpg.enc`.toLowerCase()] || keys[`${tokenId}.jpg.enc`.toLowerCase()] || keys[`${tokenId}.JPG.enc`.toLowerCase()];
            if (key) {
                console.log(`🔑 Chiave trovata per tokenId ${tokenId}.`);
                return res.json({ success: true, key });
            } else {
                console.warn(`🔑 Chiave NON trovata per tokenId ${tokenId}.`);
                return res.status(404).json({ error: 'Key not found for tokenId' });
            }
        } else {
            console.warn(`🚫 L'indirizzo ${address} non possiede il token con ID ${tokenId}.`);
            return res.status(403).json({ error: 'You do not own this token' });
        }
    } catch (err) {
        console.error('❌ Errore in /get-key:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend in esecuzione sulla porta ${PORT}`));
console.log(`🚀 Backend in ascolto sulla porta ${PORT}`);
