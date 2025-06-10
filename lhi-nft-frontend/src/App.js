// App.js - React frontend con supporto per MetaMask, Coinbase Wallet e Binance (via WalletConnect)

import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './abi';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState('');
  const [contract, setContract] = useState(null);

  const tokenValues = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            137: 'https://polygon-rpc.com' // Polygon Mainnet
          }
        }
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: 'LHI NFT App',
          rpc: 'https://polygon-rpc.com',
          chainId: 137
        }
      }
    }
  });

  const connectWallet = async () => {
    try {
      const externalProvider = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(externalProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(address);
      setProvider(ethersProvider);
      setContract(nftContract);
      setStatus('✅ Wallet connesso: ' + address);
    } catch (err) {
      setStatus('❌ Errore connessione wallet: ' + err.message);
    }
  };

  const mintNFT = async (amount) => {
    try {
      const price = await contract.price();
      const total = BigNumber.from(price).mul(amount);
      
      const tx = await contract.mint(amount, {
        value: total
      });

      await tx.wait();
      setStatus(`✅ Mint completato per ${amount} NFT`);
    } catch (err) {
      setStatus('❌ Errore durante mint: ' + err.message);
    }
  };

  const getDecryptionKey = async (tokenId) => {
    try {
      const response = await fetch(`${backendUrl}/get-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: account,
          tokenId: tokenId
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus(`🔑 Chiave token ${tokenId}: ${data.key}`);
      } else {
        setStatus('⚠️ Errore backend: ' + data.error);
      }
    } catch (err) {
      setStatus('❌ Errore rete: ' + err.message);
    }
  };

  return (
    <div>
      <h1>LHI NFT Mint</h1>
      {!account ? (
        <button onClick={connectWallet}>Connetti Wallet</button>
      ) : (
        <>
          <p>Wallet: {account}</p>
          <button onClick={() => getDecryptionKey('06')}>🔐 Ottieni chiave token #06</button>
          <div>
            {tokenValues.map(amount => (
              <button key={amount} onClick={() => mintNFT(amount)}>Mint {amount}</button>
            ))}
          </div>
          <p>{status}</p>
        </>
      )}
    </div>
  );
}

export default App;
