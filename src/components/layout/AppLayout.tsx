import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, params?: { type?: string }) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Hide sidebar on landing/home, login, register, forgot_password, and reset_password pages
  const isAuthOrLanding =
    currentPage === 'home' ||
    currentPage === 'login' ||
    currentPage === 'register' ||
    currentPage === 'forgot_password' ||
    currentPage === 'reset_password';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />

      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {!isAuthOrLanding && (
          <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        )}

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <Footer />
    </div>
  );
};
