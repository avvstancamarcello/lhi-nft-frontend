Ecco il codice completo da copiare in *src/App.js*, con collegamento al contratto all’indirizzo 0x6a6d5dc29ad8ff23209186775873e123b31c26e9 e 20 pulsanti di mint da 5 a 100:

```js
import React, { useState } from 'react';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './abi';

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert('Install MetaMask');
    }
  };

  const mintNFT = async (amount) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      const price = await contract.methods.price().call();
      await contract.methods.mint(amount).send({
        from: account,
        value: web3.utils.toWei((price * amount).toString(), 'wei')
      });
      setStatus(Minted ${amount} NFTs);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const options = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  return (
    <div>
      <h1>LHI NFT Mint</h1>
      {!account ? (
  <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {account}</p>
          {options.map((amount) => (
            <button key={amount} onClick={() => mintNFT(amount)}>
              Mint {amount}
            </button>
          ))}
          <p>{status}</p>
        </>
      )}
    </div>
  );
}

export default App;
```
