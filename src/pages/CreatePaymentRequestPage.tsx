import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { FeeBreakdownCard } from '../components/FeeBreakdownCard';
import { Quote } from '../types';
import { useToast } from '../contexts/ToastContext';
import {
  PlusCircle,
  DollarSign,
  ArrowRight,
  User,
  Mail,
  Globe,
  FileText,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface CreatePaymentRequestPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CreatePaymentRequestPage: React.FC<CreatePaymentRequestPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [sourceAmount, setSourceAmount] = useState<number | string>(1500);
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [destinationCurrency, setDestinationCurrency] = useState('INR');
  const [clientName, setClientName] = useState('Apex Horizon Tech Inc.');
  const [clientEmail, setClientEmail] = useState('billing@apexhorizon.io');
  const [clientCountry, setClientCountry] = useState('United States');
  const [projectTitle, setProjectTitle] = useState('Full-Stack Design System & API Architecture');
  const [description, setDescription] = useState('Phase 1 delivery of UI tokens, React components, and Node.js microservices.');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

  const [liveQuote, setLiveQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch live quote calculation whenever amount changes
  useEffect(() => {
    const num = Number(sourceAmount);
    if (!isNaN(num) && num >= 10 && num <= 100000) {
      setQuoteLoading(true);
      setError(null);
      ApiService.calculateQuote(num, sourceCurrency, destinationCurrency)
        .then((res) => {
          if (res.success) setLiveQuote(res.quote);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setQuoteLoading(false));
    } else {
      setLiveQuote(null);
    }
  }, [sourceAmount, sourceCurrency, destinationCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(sourceAmount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Amount must be at least $10.00 USD.');
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !projectTitle.trim()) {
      setError('Please provide client name, client email, and project title.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await ApiService.createPaymentRequest({
        sourceAmount: numAmount,
        sourceCurrency,
        destinationCurrency,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientCountry: clientCountry.trim(),
        projectTitle: projectTitle.trim(),
        description: description.trim(),
        invoiceNumber: invoiceNumber.trim(),
      });

      showToast('Payment request created! Review your fee quote to confirm.', 'success');
      onNavigate('payment-confirmation', { paymentRequest: res.paymentRequest });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Create Cross-Border Payment Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Lock in transparent exchange rates and generate verifiable payment requests for international clients
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            {/* Amount Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Requested Invoice Amount
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative">
                  <DollarSign className="w-5 h-5 text-teal-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max="100000"
                    value={sourceAmount}
                    onChange={(e) => setSourceAmount(e.target.value)}
                    required
                    placeholder="1500.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <select
                    value={sourceCurrency}
                    onChange={(e) => setSourceCurrency(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Destination Currency: <strong>{destinationCurrency} (Indian Rupee)</strong>
              </span>
            </div>

            {/* Client Details Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">International Client Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Client / Organization Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      placeholder="e.g. Apex Horizon Tech"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Client Billing Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                      placeholder="billing@client.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Client Country
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={clientCountry}
                      onChange={(e) => setClientCountry(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Invoice Reference #
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Project / Scope Description */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Project Title / Milestone
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  required
                  placeholder="e.g. Next.js Architecture and API Integration"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Scope Description / Deliverables
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the delivered work..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !liveQuote}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Locking Quote in PostgreSQL...</span>
                </>
              ) : (
                <>
                  <span>Review & Lock Fee Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Live Fee Breakdown Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Live Fee Calculation
            </h3>
            {quoteLoading && (
              <span className="text-xs text-teal-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
          </div>

          {liveQuote ? (
            <FeeBreakdownCard quote={liveQuote} />
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Enter a valid invoice amount (≥ $10) to view the live fee and conversion breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
