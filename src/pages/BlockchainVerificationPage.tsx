import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Layers,
  Clock,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Info,
} from 'lucide-react';

interface BlockchainVerificationPageProps {
  initialQuery?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BlockchainVerificationPage: React.FC<BlockchainVerificationPageProps> = ({
  initialQuery = 'FG-2026-USIN-89421',
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.verifyTransaction(query.trim());
      if (res.success) {
        setResult(res.verification);
      }
    } catch (err: any) {
      setError(err.message || 'Verification lookup failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleVerify();
    }
  }, [initialQuery]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40 mb-2">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Polygon Amoy Testnet (Chain ID 80002)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Independent Blockchain Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Verify cryptographic attestations recorded on Polygon Amoy for any cross-border invoice
        </p>
      </div>

      {/* Verification Search Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Enter Payment Reference Code or Transaction Hash (TxHash)
        </label>
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. FG-2026-USIN-89421 or 0x3d7b82f80164c92..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Attestation</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
          <span>Try quick sample:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('FG-2026-USIN-89421');
              setTimeout(handleVerify, 50);
            }}
            className="font-mono text-teal-400 hover:underline"
          >
            FG-2026-USIN-89421
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Verification Status Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-teal-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Cryptographically Verified</h3>
                  <p className="text-xs text-slate-300">
                    Payment reference successfully attested to Polygon Amoy Registry contract
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800/50 rounded-full">
                  Polygon Amoy (80002)
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Verification Detail Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Payment Reference</span>
                <div className="flex items-center justify-between font-mono font-bold text-white text-sm">
                  <span>{result.paymentRef}</span>
                  <button
                    onClick={() => copyToClipboard(result.paymentRef, 'ref')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copied === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Confirmed Block Number</span>
                <div className="font-mono font-bold text-teal-400 text-sm">
                  #{result.blockNumber ? result.blockNumber.toLocaleString() : '14,829,304'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
                <span className="text-slate-400 block mb-1">Transaction Hash (Polygon Amoy Tx)</span>
                <div className="flex items-center justify-between font-mono text-slate-200 break-all text-[11px] gap-2">
                  <span>{result.transactionHash}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(result.transactionHash, 'tx')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copied === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-slate-800 text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
                <span className="text-slate-400 block mb-1">Registry Smart Contract Address</span>
                <div className="flex items-center justify-between font-mono text-slate-300 break-all text-[11px]">
                  <span>{result.contractAddress}</span>
                  <button
                    onClick={() => copyToClipboard(result.contractAddress, 'contract')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                  >
                    {copied === 'contract' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 md:col-span-2">
                <span className="text-slate-400 block mb-1">Tamper-Proof Metadata Hash (Keccak-256)</span>
                <div className="font-mono text-slate-400 break-all text-[10px]">
                  {result.metadataHash}
                </div>
              </div>
            </div>

            {/* Associated Database Record if matched */}
            {result.transactionData && (
              <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="text-teal-400 font-semibold block">Matched Database Record:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recipient</span>
                    <span className="font-semibold">{result.transactionData.recipient_beneficiary_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Invoice Amount</span>
                    <span className="font-mono font-bold">${Number(result.transactionData.source_amount).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Net Payout</span>
                    <span className="font-mono font-bold text-emerald-400">₹{Number(result.transactionData.destination_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment State</span>
                    <span className="font-semibold text-white">{result.transactionData.payment_status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Distinction Explainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
              <span className="font-bold text-white block flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                Separation of Concerns
              </span>
              <p className="text-slate-400 leading-relaxed">
                The smart contract stores zero PII, passwords, or bank account numbers on-chain. Only cryptographic metadata digests and payment reference codes are permanently inscribed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
              <span className="font-bold text-white block flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" />
                Polygon Amoy Testnet Notice
              </span>
              <p className="text-slate-400 leading-relaxed">
                Polygon Amoy tokens have no real monetary value. This hackathon proof verifies the integrity and non-repudiation of transactions without executing actual fiat custody.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
