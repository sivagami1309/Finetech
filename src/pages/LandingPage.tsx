import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  DollarSign,
  Cpu,
  Layers,
  Lock,
  CheckCircle2,
  TrendingDown,
  Globe2,
  FileCode,
  Search,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/15 to-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-teal-500/10 border border-teal-500/30 text-teal-300 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Polygon Amoy Testnet & PostgreSQL Verified Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Transparent and Verifiable <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Cross-Border Payment Tracking
            </span>{' '}
            for Freelancers
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Indian freelancers lose up to 4–7% of earnings to obscured exchange-rate spreads and hidden intermediary deductions. FinGuard provides transparent fee quotes and tamper-proof blockchain attestations on Polygon Amoy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Launch Free Freelancer Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('quote-calculator')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Simulate Fee Breakdown</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Hidden FX Markups</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Public Polygon Amoy Attestation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PostgreSQL Parameterized Queries</span>
            </div>
          </div>
        </div>

        {/* Live Tracking Preview Mock */}
        <div className="max-w-4xl mx-auto mt-14 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono font-bold text-white">FG-2026-USIN-89421</span>
              <span className="text-slate-400">• Apex Horizon Tech Inc. (San Francisco, CA)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
              Settled & Verified On-Chain
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5 text-sm">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Invoice Amount</span>
              <span className="text-xl font-bold text-white font-mono">$1,200.00 USD</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Transparent Rate</span>
              <span className="text-base font-bold text-teal-400 font-mono">1 USD = 83.50 INR</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Itemized Deductions</span>
              <span className="text-base font-bold text-slate-300 font-mono">-$6.69 USD (0.55%)</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-xs text-emerald-400 block mb-1">Credited to Freelancer</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">₹99,850.00 INR</span>
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl flex items-center justify-between text-xs text-purple-200">
            <div className="flex items-center gap-2 font-mono text-[11px] truncate">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">Polygon Amoy Tx: 0x3d7b82f80164c925890289aef4112e3a1f43405c9288e2cb2ad38e6840776b92</span>
            </div>
            <button
              onClick={() => onNavigate('blockchain-verify')}
              className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Verify Attestation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-teal-400 mb-2">
            The Cross-Border Transparency Gap
          </h2>
          <h3 className="text-3xl font-extrabold text-white">
            Traditional Platforms vs. FinGuard TrustFlow
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy Pain Points */}
          <div className="p-8 rounded-2xl bg-rose-950/10 border border-rose-900/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Traditional Wire & Platform Woes</h4>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Unclear Conversion Rates:</strong> Intermediary banks add undisclosed 2.5% to 5% markups onto the real mid-market exchange rate.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Uncertain Net Payouts:</strong> Freelancers create an invoice for $2,000 USD but receive unpredictable INR amounts after hidden correspondent charges.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Black-Box Settlement:</strong> Transactions enter a multi-day limbo with zero real-time progress or milestone visibility.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Dispute Nightmare:</strong> No independent cryptographic receipt when international clients claim funds were dispatched.</span>
              </li>
            </ul>
          </div>

          {/* FinGuard Solution */}
          <div className="p-8 rounded-2xl bg-teal-950/15 border border-teal-800/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">FinGuard Transparent Architecture</h4>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Guaranteed Mathematical Quotes:</strong> Itemizes base exchange rate, platform fee, and conversion surcharge before confirming.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Authoritative PostgreSQL Records:</strong> Strict relational state machine ensuring transitions cannot jump or be bypassed.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Polygon Amoy On-Chain Proofs:</strong> Hashes invoice metadata into Solidity smart contract (80002) for third-party verifiability.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Simulated Sandbox Engine:</strong> Allows hackathon judges and testers to advance clearing lifecycles in real time.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-teal-400 mb-2">
              Step-by-Step Lifecycle
            </h2>
            <h3 className="text-3xl font-extrabold text-white">How FinGuard Tracks Payments</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-3xl font-black text-teal-400/40 mb-3 font-mono">01</div>
              <h4 className="text-base font-bold text-white mb-2">Create Request</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your client information and requested source amount in USD. The backend validates bounds and prepares the quote.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-3xl font-black text-teal-400/40 mb-3 font-mono">02</div>
              <h4 className="text-base font-bold text-white mb-2">Transparent Quote</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review the 15-minute guaranteed conversion quote detailing exact exchange rate, platform fee, and net recipient amount in INR.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-3xl font-black text-teal-400/40 mb-3 font-mono">03</div>
              <h4 className="text-base font-bold text-white mb-2">Lifecycle Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow deterministic state transitions (DRAFT → PENDING → PROCESSING → COMPLETED) backed by PostgreSQL audit logging.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-3xl font-black text-teal-400/40 mb-3 font-mono">04</div>
              <h4 className="text-base font-bold text-white mb-2">Polygon Amoy Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upon completion, a Keccak-256 hash attestation is recorded onto the Polygon Amoy blockchain with an immutable block receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your International Earnings?
          </h3>
          <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8">
            Experience complete fee transparency and blockchain-verifiable cross-border payment tracking built for modern Indian freelancers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20"
            >
              Register Demonstration Account
            </button>
            <button
              onClick={() => onNavigate('help-status')}
              className="px-6 py-3.5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-all"
            >
              View System Architecture & APIs
            </button>
          </div>
        </div>
      </section>

      {/* Footer with Mandatory Disclaimers */}
      <footer className="mt-auto py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-white">FinGuard – TrustFlow</span>
              <span>© {new Date().getFullYear()} Hackathon Demonstration Prototype</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => onNavigate('quote-calculator')} className="hover:text-white">Fee Quote</button>
              <button onClick={() => onNavigate('blockchain-verify')} className="hover:text-white">Polygon Verification</button>
              <button onClick={() => onNavigate('help-status')} className="hover:text-white">System Status</button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
            <strong>Mandatory Fintech & Blockchain Disclaimer:</strong> FinGuard – TrustFlow is a fintech software prototype developed for student hackathon demonstration purposes. It does not independently operate as a licensed bank, deposit-taking institution, money transmitter, or foreign exchange dealer. All payment settlement steps demonstrated are simulated via software state machines. Blockchain attestations are deployed onto the Polygon Amoy Testnet (Chain ID 80002) where test tokens possess zero monetary value.
          </div>
        </div>
      </footer>
    </div>
  );
};
