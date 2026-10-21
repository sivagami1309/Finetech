import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Transaction, TransactionStatusHistory, BlockchainRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FeeBreakdownCard } from '../components/FeeBreakdownCard';
import { BlockchainProofCard } from '../components/BlockchainProofCard';
import { SimulationControlModal } from '../components/SimulationControlModal';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Building,
  ExternalLink,
} from 'lucide-react';

interface TransactionDetailsPageProps {
  transactionId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const TransactionDetailsPage: React.FC<TransactionDetailsPageProps> = ({
  transactionId,
  onNavigate,
}) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [statusHistory, setStatusHistory] = useState<TransactionStatusHistory[]>([]);
  const [blockchainRecord, setBlockchainRecord] = useState<BlockchainRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);

  const fetchDetails = async () => {
    if (!transactionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getTransaction(transactionId);
      if (res.success) {
        setTransaction(res.transaction);
        setStatusHistory(res.statusHistory || []);
        setBlockchainRecord(res.blockchainRecord || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
        <span>Loading PostgreSQL transaction audit trail...</span>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Transaction Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">
          {error || 'The requested cross-border transaction could not be located in PostgreSQL.'}
        </p>
        <button
          onClick={() => onNavigate('transactions')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700"
        >
          Back to History
        </button>
      </div>
    );
  }

  const steps = ['DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED'];
  const currentStepIdx = steps.indexOf(transaction.status);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back button and quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('transactions')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transaction History</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Hackathon demonstration simulation button */}
          <button
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-teal-400" />
            <span>Simulate Settlement Lifecycle</span>
          </button>

          <button
            onClick={fetchDetails}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh details"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">
              Cross-Border Payment Reference
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
                {transaction.reference_code}
              </h1>
              <StatusBadge status={transaction.status} size="lg" />
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Created on {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(transaction.created_at).toLocaleTimeString()}
            </span>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-emerald-400 uppercase tracking-wider block mb-1">
              Estimated Recipient Amount
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              ₹{Number(transaction.destination_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-400 mt-1 block font-mono">
              Requested: ${Number(transaction.source_amount).toFixed(2)} {transaction.source_currency} (Rate: {Number(transaction.exchange_rate).toFixed(4)})
            </span>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="pt-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-4">
            Payment Clearing State Progression
          </span>

          <div className="grid grid-cols-4 gap-2 relative">
            {steps.map((st, idx) => {
              const isDone = currentStepIdx >= idx;
              const isCurrent = transaction.status === st;

              return (
                <div key={st} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all mb-2 ${
                      isDone
                        ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-teal-300 font-bold'
                        : isDone
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Client Details & Status History (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Client & Payout Beneficiary Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              <span>Client & Payout Beneficiary Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Payer (Client)</span>
                <span className="font-bold text-white text-sm">{transaction.client_name || 'US Client'}</span>
                <span className="text-slate-400 block">{transaction.client_email || 'billing@client.com'}</span>
                <span className="text-slate-400 block text-[11px]">{transaction.client_country || 'United States'}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Beneficiary (Freelancer)</span>
                <span className="font-bold text-white text-sm">{transaction.recipient_beneficiary_name}</span>
                <span className="text-emerald-400 block font-medium">HDFC Bank India (Simulated RTGS)</span>
                <span className="text-slate-400 block font-mono text-[11px]">{transaction.recipient_account_hint || 'HDFC Bank - ••••4821'}</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 block mb-1">Project Milestone</span>
                <span className="text-slate-200 font-semibold">{transaction.project_title || 'Design and Development Services'}</span>
                {transaction.invoice_number && (
                  <span className="text-slate-400 block text-[11px] font-mono mt-0.5">
                    Invoice: {transaction.invoice_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>State Transition Audit Trail</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">PostgreSQL Relational Log</span>
            </div>

            <div className="space-y-4">
              {statusHistory.map((sh, idx) => (
                <div key={sh.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 mt-1 shrink-0" />
                  <div className="flex-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        {sh.from_status ? `${sh.from_status} → ` : ''}
                        <span className="text-teal-300 font-bold">{sh.to_status}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(sh.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{sh.reason || 'Status updated.'}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                      <span>Actor: {sh.actor_role}</span>
                      {sh.is_simulated && (
                        <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                          Simulated Event
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Blockchain Proof Card & Quick Verify (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <BlockchainProofCard
            paymentRef={transaction.reference_code}
            txHash={transaction.blockchain_tx_hash || '0x3d7b82f80164c925890289aef4112e3a1f43405c9288e2cb2ad38e6840776b92'}
            blockNumber={blockchainRecord?.block_number || 14829304}
            metadataHash={blockchainRecord?.metadata_hash || '0x9a83d712f5e042b8941784651347895bc632aef415668102456489379201a742'}
            isSimulated={true}
          />

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Independent Blockchain Verification
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone can independently verify this transaction on the Polygon Amoy blockchain using the payment reference code or transaction hash.
            </p>
            <button
              onClick={() => onNavigate('blockchain-verify', { query: transaction.reference_code })}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Run Verification Check</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settlement Simulation Modal */}
      <SimulationControlModal
        transaction={transaction}
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        onStatusUpdated={fetchDetails}
      />
    </div>
  );
};
