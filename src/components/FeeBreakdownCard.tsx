import React from 'react';
import { Quote } from '../types';
import { ShieldCheck, Info, ArrowRight, DollarSign, Percent, Clock } from 'lucide-react';

interface FeeBreakdownCardProps {
  quote: Quote;
  showTitle?: boolean;
}

export const FeeBreakdownCard: React.FC<FeeBreakdownCardProps> = ({ quote, showTitle = true }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {showTitle && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-base">Transparent Fee & Conversion Breakdown</h3>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-full font-mono">
            Zero Hidden Margin
          </span>
        </div>
      )}

      {/* Main conversion display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-center md:text-left">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Source Amount</span>
          <div className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-1">
            <span>${quote.sourceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-xs font-normal text-slate-400">{quote.sourceCurrency}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono bg-teal-950/50 border border-teal-800/50 px-3 py-1 rounded-full">
            <span>1 {quote.sourceCurrency} = {quote.exchangeRate.toFixed(4)} {quote.destinationCurrency}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Configured Demonstration Rate</span>
        </div>

        <div className="md:text-right">
          <span className="text-xs text-emerald-400 uppercase tracking-wider block mb-1">Estimated Net Recipient</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-center justify-center md:justify-end gap-1">
            <span>₹{quote.estimatedRecipientAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span className="text-xs font-normal text-emerald-400/80">{quote.destinationCurrency}</span>
          </div>
        </div>
      </div>

      {/* Itemized charges table */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" /> Gross Converted Amount
          </span>
          <span className="font-mono text-slate-200">
            ₹{quote.grossDestinationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {quote.destinationCurrency}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" /> FinGuard Fixed Service Fee
          </span>
          <span className="font-mono text-slate-300">
            -${quote.serviceFeeSource.toFixed(2)} {quote.sourceCurrency}
            <span className="text-xs text-slate-400 ml-1">
              (≈ ₹{(quote.serviceFeeSource * quote.exchangeRate).toFixed(2)})
            </span>
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-2">
            <Percent className="w-4 h-4 text-teal-400" /> Currency Conversion Network Fee (0.35%)
          </span>
          <span className="font-mono text-slate-300">
            -₹{quote.conversionFeeDestination.toFixed(2)} {quote.destinationCurrency}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Intermediary Banking Markups
          </span>
          <span className="font-mono text-emerald-400 font-medium">₹0.00 (Zero Hidden Markups)</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-200 font-semibold">Total Deductions</span>
          <span className="font-mono font-bold text-rose-400">
            ≈ ${quote.totalFeeSourceEquivalent.toFixed(2)} {quote.sourceCurrency}
          </span>
        </div>
      </div>

      {/* Auditability note */}
      <div className="mt-5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-mono text-[11px] leading-relaxed text-slate-300">{quote.formulaDescription}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Rate window guaranteed for 15 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
