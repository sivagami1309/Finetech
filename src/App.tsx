import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePaymentRequestPage } from './pages/CreatePaymentRequestPage';
import { FeeQuotePage } from './pages/FeeQuotePage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { TransactionDetailsPage } from './pages/TransactionDetailsPage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { HelpStatusPage } from './pages/HelpStatusPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Parse initial page or query parameters (?page=... or ?autostart=1)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    const autostart = searchParams.get('autostart');

    if (pageParam) {
      setCurrentPage(pageParam);
    } else if (autostart === '1') {
      setCurrentPage('dashboard');
    }
  }, []);

  // When user signs in or out, automatically route logically
  useEffect(() => {
    if (!loading) {
      if (user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
        setCurrentPage('dashboard');
      } else if (!user && (currentPage === 'dashboard' || currentPage === 'create-request' || currentPage === 'profile')) {
        setCurrentPage('landing');
      }
    }
  }, [user, loading]);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
          Initializing FinGuard TrustFlow...
        </span>
      </div>
    );
  }

  const isPublicStandalone = currentPage === 'landing' || currentPage === 'login' || currentPage === 'register';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onToggleMobileNav={!isPublicStandalone ? () => setMobileNavOpen(!mobileNavOpen) : undefined}
      />

      {/* Main Container */}
      {isPublicStandalone ? (
        <main className="flex-1">
          {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
          {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
        </main>
      ) : (
        <div className="flex-1 flex w-full">
          {/* Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isOpenMobile={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />

          {/* Authenticated / App Content */}
          <main className="flex-1 min-w-0 pb-16 overflow-y-auto">
            {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
            {currentPage === 'create-request' && <CreatePaymentRequestPage onNavigate={handleNavigate} />}
            {currentPage === 'quote-calculator' && <FeeQuotePage onNavigate={handleNavigate} />}
            {currentPage === 'payment-confirmation' && (
              <PaymentConfirmationPage
                paymentRequest={pageParams.paymentRequest}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'transactions' && <TransactionHistoryPage onNavigate={handleNavigate} />}
            {currentPage === 'transaction-details' && (
              <TransactionDetailsPage
                transactionId={pageParams.id || 'tx_dev_001'}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'blockchain-verify' && (
              <BlockchainVerificationPage
                initialQuery={pageParams.query || 'FG-2026-USIN-89421'}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'profile' && <ProfileSettingsPage />}
            {currentPage === 'help-status' && <HelpStatusPage />}
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
