import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { FeeBreakdownCard } from '../components/FeeBreakdownCard';
import { Quote } from '../types';
import { Calculator, ArrowRight, DollarSign, RefreshCw, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

interface FeeQuotePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const FeeQuotePage: React.FC<FeeQuotePageProps> = ({ onNavigate }) => {
  const [amount, setAmount] = useState<number | string>(2500);
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [destinationCurrency, setDestinationCurrency] = useState('INR');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    const num = Number(amount);
    if (isNaN(num) || num < 10) {
      setError('Please enter a valid amount of at least $10.00.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.calculateQuote(num, sourceCurrency, destinationCurrency);
      if (res.success) {
        setQuote(res.quote);
      }
    } catch (err: any) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [amount, sourceCurrency, destinationCurrency]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Transparent Fee & Exchange Rate Quote
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Audit every dollar and rupee with mathematical precision — zero hidden spreads
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800 text-teal-400">
            <Calculator className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">Quote Parameters</h3>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Source Amount
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-teal-400 absolute left-3.5 top-3" />
              <input
                type="number"
                step="50"
                min="10"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                From
              </label>
              <select
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                To
              </label>
              <select
                value={destinationCurrency}
                onChange={(e) => setDestinationCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2 text-slate-300">
            <span className="font-semibold text-teal-300 block">Transparent Fee Guarantee:</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flat $2.50 USD service charge</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>0.35% network conversion fee</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No SWIFT intermediary surprises</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('create-request')}
            className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span>Generate Official Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Breakdown Column (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {quote ? (
            <FeeBreakdownCard quote={quote} />
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
              Calculating rate assumptions...
            </div>
          )}

          {/* Mathematical Formula Explanation Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Info className="w-4 h-4 text-teal-400" />
              <span>Audit Calculation Formula</span>
            </div>
            <p className="leading-relaxed">
              <strong>Gross Destination:</strong> <code className="text-teal-300 font-mono">gross = sourceAmount × exchangeRate</code>
            </p>
            <p className="leading-relaxed">
              <strong>Total Applicable Deductions:</strong> <code className="text-teal-300 font-mono">fees = (serviceFeeUSD × exchangeRate) + (gross × 0.0035)</code>
            </p>
            <p className="leading-relaxed">
              <strong>Final Net Recipient:</strong> <code className="text-emerald-400 font-mono">netPayout = gross - fees</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
