import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  User,
  Mail,
  Building,
  Globe,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
  const [defaultSourceCurrency, setDefaultSourceCurrency] = useState(user?.defaultSourceCurrency || 'USD');
  const [defaultDestinationCurrency, setDefaultDestinationCurrency] = useState(user?.defaultDestinationCurrency || 'INR');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBusinessName(user.businessName || '');
      setWalletAddress(user.walletAddress || '');
      setDefaultSourceCurrency(user.defaultSourceCurrency || 'USD');
      setDefaultDestinationCurrency(user.defaultDestinationCurrency || 'INR');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await ApiService.updateProfile({
        name,
        businessName,
        walletAddress,
        defaultSourceCurrency,
        defaultDestinationCurrency,
      });
      await refreshUser();
      showToast('Profile and payout settings updated successfully.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Freelancer Profile & Payout Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your verified freelancer identity, default settlement currencies, and simulated bank account
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-400" />
            <span>Personal & Business Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Registered Email (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-sm text-slate-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Freelancer / Studio Entity Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Studio LLP"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Country of Tax Residency
              </label>
              <input
                type="text"
                value={user?.country || 'India'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-sm text-slate-300 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Currency & Payout Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-400" />
            <span>Default Currencies & Simulated Payout Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Default Invoicing Currency
              </label>
              <select
                value={defaultSourceCurrency}
                onChange={(e) => setDefaultSourceCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Default Payout Currency
              </label>
              <select
                value={defaultDestinationCurrency}
                onChange={(e) => setDefaultDestinationCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-teal-300 block">Simulated Domestic Clearing Route:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Bank Partner</span>
                <span>HDFC Bank Limited</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                <span className="font-mono">HDFC0001842</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Account Mask</span>
                <span className="font-mono">•••• •••• 4821</span>
              </div>
            </div>
          </div>
        </div>

        {/* Web3 / Polygon Wallet Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            <span>Polygon Amoy Testnet Wallet (Optional)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Public Wallet Address (0x...)
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x71C83a48e7C9fAc8aE8908dCeC005F999D543210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Used as the verified recorder identity on Polygon Amoy. Never enters or requires your private keys.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
