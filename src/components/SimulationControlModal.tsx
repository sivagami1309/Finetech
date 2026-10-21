import React, { useState } from 'react';
import { Transaction } from '../types';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PlayCircle, ShieldCheck, ArrowRight, X, AlertCircle, RefreshCw } from 'lucide-react';

interface SimulationControlModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const SimulationControlModal: React.FC<SimulationControlModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const validTargets: Record<string, string[]> = {
    DRAFT: ['PENDING', 'CANCELLED'],
    PENDING: ['PROCESSING', 'CANCELLED', 'FAILED'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
    CANCELLED: [],
  };

  const availableOptions = validTargets[transaction.status] || [];

  const handleAdvance = async () => {
    if (!targetStatus) {
      showToast('Please select a target status to advance.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await ApiService.simulateStatus(
        transaction.id,
        targetStatus,
        reason || `Hackathon demonstration settlement progression to ${targetStatus}`
      );

      showToast(`Transaction advanced to ${targetStatus} successfully!`, 'success');
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to advance transaction status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Hackathon Settlement Simulator</h3>
            <span className="text-xs text-slate-400">Advance Cross-Border Clearing Lifecycle</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs mb-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">Transaction Reference:</span>
            <span className="font-mono font-bold text-teal-300">{transaction.reference_code}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">Current Status:</span>
            <span className="font-semibold text-white">{transaction.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Net Recipient:</span>
            <span className="font-mono text-emerald-400 font-bold">
              ₹{Number(transaction.destination_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {transaction.destination_currency}
            </span>
          </div>
        </div>

        {availableOptions.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
            <p className="text-sm text-slate-300">
              This transaction has reached its final settlement state ({transaction.status}). No further state transitions are permitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Next State Transition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTargetStatus(opt)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                      targetStatus === opt
                        ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-md ring-1 ring-teal-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Simulation Note / Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Automated Clearing House clearing batch settled"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {targetStatus === 'COMPLETED' && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Advancing to <strong>COMPLETED</strong> will automatically generate and register an immutable cryptographic attestation on the <strong>Polygon Amoy Testnet</strong>!
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdvance}
                disabled={submitting || !targetStatus}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Simulation...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Settlement Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
