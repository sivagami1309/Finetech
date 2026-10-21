import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { PaymentRequest, Quote } from '../types';
import { FeeBreakdownCard } from '../components/FeeBreakdownCard';
import { useToast } from '../contexts/ToastContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Building,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface PaymentConfirmationPageProps {
  paymentRequest?: PaymentRequest;
  onNavigate: (page: string, params?: any) => void;
}

export const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({
  paymentRequest,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!paymentRequest?.id) {
      showToast('Payment request ID missing.', 'error');
      return;
    }

    try {
      setConfirming(true);
      setError(null);
      const res = await ApiService.confirmPaymentRequest(paymentRequest.id);
      showToast(`Request confirmed! Reference: ${res.transaction.referenceCode}`, 'success');
      onNavigate('transaction-details', { id: res.transaction.id });
    } catch (err: any) {
      setError(err.message || 'Confirmation failed.');
    } finally {
      setConfirming(false);
    }
  };

  if (!paymentRequest) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No active request to confirm</h3>
        <p className="text-xs text-slate-400 mb-6">
          Please create a payment request first to obtain a locked exchange rate.
        </p>
        <button
          onClick={() => onNavigate('create-request')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400"
        >
          Create Payment Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('create-request')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request Edit</span>
        </button>

        {/* Guaranteed Rate Expiration Window */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Locked Rate Expires In: {formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Review & Confirm Payment Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Lock in this quote and transition your transaction into the PENDING settlement lifecycle
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Request Summary (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" />
            <span>Client & Invoice Summary</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">International Client</span>
              <span className="font-bold text-white text-sm">{paymentRequest.client_name}</span>
              <span className="text-slate-400 block text-[11px]">{paymentRequest.client_email}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Project Deliverable</span>
              <span className="font-semibold text-slate-200">{paymentRequest.project_title}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Invoice #</span>
                <span className="font-mono text-teal-300 font-bold">{paymentRequest.invoice_number || 'INV-2026-N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Country</span>
                <span className="text-slate-200 font-medium">{paymentRequest.client_country || 'United States'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Freelancer Payout Account (Simulated)</span>
              <span className="font-medium text-emerald-400 block">HDFC Bank India (RTGS/NEFT)</span>
              <span className="font-mono text-[11px] text-slate-400">Account: ••••4821 (IFSC: HDFC0001842)</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {confirming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Confirming Transaction...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Lock Rate</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Locked Fee Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {paymentRequest.quote ? (
            <FeeBreakdownCard quote={paymentRequest.quote} />
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              No detailed quote attached.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
