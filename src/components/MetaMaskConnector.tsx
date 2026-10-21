import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const MetaMaskConnector: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { showToast } = useToast();

  const AMOY_CHAIN_ID_HEX = '0x13882'; // 80002

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check existing accounts
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);

      // Check chainId
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((id: string) => setChainId(id))
        .catch(console.error);

      // Listen for account change
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      };

      const handleChainChanged = (id: string) => {
        setChainId(id);
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      showToast('MetaMask not detected in browser. Please install MetaMask extension to test Web3 wallet integration.', 'info');
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        showToast('MetaMask wallet connected successfully.', 'success');

        // Check if on Polygon Amoy
        const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChain);

        if (currentChain !== AMOY_CHAIN_ID_HEX) {
          await switchToAmoy();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to connect MetaMask wallet.', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const switchToAmoy = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AMOY_CHAIN_ID_HEX }],
      });
      showToast('Switched to Polygon Amoy Testnet (Chain ID 80002)', 'success');
    } catch (switchError: any) {
      // 4902 error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: AMOY_CHAIN_ID_HEX,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'POL',
                  symbol: 'POL',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              },
            ],
          });
          showToast('Added and switched to Polygon Amoy Testnet', 'success');
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  const isAmoy = chainId === AMOY_CHAIN_ID_HEX;

  if (account) {
    return (
      <div className="flex items-center gap-2">
        {!isAmoy ? (
          <button
            onClick={switchToAmoy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Click to switch to Polygon Amoy"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch to Amoy (80002)</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-purple-950/60 border border-purple-800/40 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Polygon Amoy</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-800 border border-slate-700 text-slate-200">
          <Wallet className="w-3.5 h-3.5 text-teal-400" />
          <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
      aria-label="Connect MetaMask Wallet"
    >
      <Wallet className="w-3.5 h-3.5 text-teal-400" />
      <span>{connecting ? 'Connecting...' : 'Connect MetaMask'}</span>
    </button>
  );
};
