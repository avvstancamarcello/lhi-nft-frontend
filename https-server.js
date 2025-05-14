const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'LHI_NFT_Mobile')));

const PORT = 3443;
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server running at https://localhost:${PORT}/`);
});
