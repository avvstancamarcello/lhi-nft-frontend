const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ethers = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Carica chiavi locali (mappate per tokenId)
const keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));

// Configura provider (Polygon, via Infura o Alchemy)
const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');

// Indirizzo smart contract
const CONTRACT_ADDRESS = '0x6a6d5Dc29ad8ff23209186775873e123b31c26E9';
// ABI minima per leggere balance
const CONTRACT_ABI = [
    'function balanceOf(address owner, uint256 id) view returns (uint256)'
];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

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
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
