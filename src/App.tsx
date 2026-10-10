/**
 * FIR Analyzer Agentic AI - Main Application Shell
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';
import { api } from './services/api';
import { AuthSession, FIRReport } from './types/fir';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'analyze' | 'reports' | 'about'>('home');
  const [selectedReport, setSelectedReport] = useState<FIRReport | null>(null);
  const [reports, setReports] = useState<FIRReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentSession = await api.getSession();
        if (currentSession?.authenticated) {
          setSession(currentSession);
          setSessionExpiredMsg(null);
        }
      } catch {
        setSession(null);
      } finally {
        setSessionChecking(false);
      }
    }
    checkAuth();

    // Listen for session expiration events from API layer
    const handleExpired = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSession(null);
      setSessionExpiredMsg(
        customEvent.detail || 'Your officer session has expired or is invalid. Please sign in again.'
      );
    };
    window.addEventListener('fir-session-expired', handleExpired);
    return () => window.removeEventListener('fir-session-expired', handleExpired);
  }, []);

  // Fetch reports when authenticated
  const fetchReports = useCallback(async () => {
    if (!session) return;
    setLoadingReports(true);
    try {
      const list = await api.getReports();
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchReports();
    }
  }, [session, fetchReports]);

  // Handle opening a saved report
  const handleOpenReport = async (reportId: string) => {
    try {
      const rep = await api.getReportById(reportId);
      setSelectedReport(rep);
      setCurrentTab('home');
    } catch (err) {
      console.error('Failed to open report:', err);
    }
  };

  const handleReportGenerated = (newReport: FIRReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setSelectedReport(newReport);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    setSession(null);
    setReports([]);
    setSelectedReport(null);
    setCurrentTab('home');
  };

  // Loading initial authentication state
  if (sessionChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black font-mono text-xs">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-black border-t-[#A38F58] rounded-full animate-spin" />
          <p className="uppercase tracking-widest text-[#A38F58] font-bold">
            Verifying Officer Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in: show professional Login page
  if (!session) {
    return (
      <LoginPage
        sessionExpiredNotice={sessionExpiredMsg}
        onLoginSuccess={(auth) => {
          setSession(auth);
          setSessionExpiredMsg(null);
          setCurrentTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black">
      {/* Persistent Navigation Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'home') {
            setSelectedReport(null);
          }
          setCurrentTab(tab);
        }}
        session={session}
        onLogout={handleLogout}
        reportsCount={reports.length}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(currentTab === 'home' || currentTab === 'analyze') && (
          <DashboardPage
            initialReport={selectedReport}
            onReportGenerated={handleReportGenerated}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsPage
            reports={reports}
            loading={loadingReports}
            onRefresh={fetchReports}
            onOpenReport={handleOpenReport}
            onGoToAnalyze={() => {
              setSelectedReport(null);
              setCurrentTab('home');
            }}
          />
        )}

        {currentTab === 'about' && <AboutPage />}
      </main>

      {/* Restrained Application Footer */}
      <footer className="no-print border-t border-black/10 py-4 mt-auto bg-white text-[11px] text-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-black uppercase">FIR Analyzer Agentic AI</span>
            <span>&middot;</span>
            <span>Decision Support System</span>
          </div>
          <div>
            Authorized Police Use Only &middot; Not an Officially Registered FIR
          </div>
        </div>
      </footer>
    </div>
  );
}
