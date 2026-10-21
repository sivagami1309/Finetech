import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Calculator,
  History,
  ShieldCheck,
  User,
  Activity,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-request', label: 'Create Request', icon: PlusCircle, badge: 'New' },
    { id: 'quote-calculator', label: 'Fee & Rate Quote', icon: Calculator },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'blockchain-verify', label: 'Polygon Verification', icon: ShieldCheck, badge: 'Amoy' },
    { id: 'profile', label: 'Profile & Payouts', icon: User },
    { id: 'help-status', label: 'System Health & APIs', icon: Activity },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900/95 border-r border-slate-800 text-slate-300 w-64 p-4">
      {/* Title / Section Header */}
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Navigation
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/40 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    item.badge === 'Amoy'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Infrastructure Card in Sidebar */}
      <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>PostgreSQL Authoritative</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight space-y-1">
            <div className="flex justify-between">
              <span>Migrations:</span>
              <span className="text-emerald-400 font-mono">001 Applied</span>
            </div>
            <div className="flex justify-between">
              <span>State Engine:</span>
              <span className="text-teal-300 font-mono">Deterministic</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs">
          <div className="flex items-center gap-2 text-purple-200 font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Polygon Amoy #80002</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Immutable hashes recorded via ethers.js and Solidity.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
