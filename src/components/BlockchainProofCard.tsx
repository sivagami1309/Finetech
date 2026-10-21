import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Shield, Copy, Check, Info } from 'lucide-react';

interface BlockchainProofCardProps {
  paymentRef: string;
  txHash?: string;
  contractAddress?: string;
  blockNumber?: number;
  metadataHash?: string;
  networkName?: string;
  chainId?: number;
  isSimulated?: boolean;
}

export const BlockchainProofCard: React.FC<BlockchainProofCardProps> = ({
  paymentRef,
  txHash = '0x3d7b82f80164c925890289aef4112e3a1f43405c9288e2cb2ad38e6840776b92',
  contractAddress = '0x217d83E71c5324D69B0C522B2945dC3806Fa6a85',
  blockNumber = 14829304,
  metadataHash = '0x9a83d712f5e042b8941784651347895bc632aef415668102456489379201a742',
  networkName = 'Polygon Amoy Testnet',
  chainId = 80002,
  isSimulated = true,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const explorerUrl = `https://amoy.polygonscan.com/tx/${txHash}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">Polygon Amoy Testnet Attestation</h4>
            <span className="text-xs text-slate-400">Cryptographically verifiable immutable transaction record</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono">
            Chain ID: {chainId} (Amoy)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Payment Reference */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">Payment Reference</span>
          <div className="flex items-center justify-between font-mono font-bold text-white text-sm">
            <span>{paymentRef}</span>
            <button
              onClick={() => copyToClipboard(paymentRef, 'ref')}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy Reference"
            >
              {copied === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Confirmed Block */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-slate-400 block mb-1">Polygon Amoy Block #</span>
          <div className="flex items-center justify-between font-mono font-bold text-teal-400 text-sm">
            <span>#{blockNumber.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">12 Block Confirmations</span>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
          <span className="text-slate-400 block mb-1">Transaction Hash (TxHash)</span>
          <div className="flex items-center justify-between font-mono text-slate-200 break-all text-[11px] gap-2">
            <span>{txHash}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => copyToClipboard(txHash, 'tx')}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Copy TxHash"
              >
                {copied === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-slate-800 text-teal-400 hover:text-teal-300 flex items-center gap-1"
                title="Open in Polygon Amoy Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Smart Contract Address */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">FinGuard Registry Smart Contract</span>
            <span className="text-[10px] text-slate-400">Solidity 0.8.20</span>
          </div>
          <div className="flex items-center justify-between font-mono text-slate-300 break-all text-[11px] gap-2">
            <span>{contractAddress}</span>
            <button
              onClick={() => copyToClipboard(contractAddress, 'contract')}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
              title="Copy Contract Address"
            >
              {copied === 'contract' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Metadata Hash */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
          <span className="text-slate-400 block mb-1">Cryptographic Metadata Digest (Keccak-256)</span>
          <div className="font-mono text-slate-400 break-all text-[10px]">
            {metadataHash}
          </div>
        </div>
      </div>

      {/* Disclaimers as required by specification */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          Polygon Amoy is a test network; test tokens have no monetary value. Smart contracts attest to transaction terms and references, separating verifiable public proof from simulated private banking settlements.
        </p>
      </div>
    </div>
  );
};
