import React from 'react';
import { Shield, FileText, Search, Info, LogOut, Menu, X } from 'lucide-react';
import { AuthSession } from '../types/fir';

interface NavigationProps {
  currentTab: 'home' | 'analyze' | 'reports' | 'about';
  onSelectTab: (tab: 'home' | 'analyze' | 'reports' | 'about') => void;
  session: AuthSession | null;
  onLogout: () => void;
  reportsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  session,
  onLogout,
  reportsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Shield },
    { id: 'analyze' as const, label: 'Analyze FIR', icon: FileText },
    { id: 'reports' as const, label: 'View Reports', icon: Search, badge: reportsCount > 0 ? reportsCount : undefined },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Top Application Bar */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectTab('home')}
              className="text-left group flex items-center space-x-3 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center border border-[#A38F58]">
                <span className="text-[#A38F58] font-bold text-sm tracking-wider">FIR</span>
              </div>
              <div>
                <span className="font-bold tracking-tight text-base sm:text-lg text-black block leading-none">
                  FIR ANALYZER AGENTIC AI
                </span>
                <span className="text-[11px] text-[#A38F58] tracking-widest uppercase font-semibold">
                  Google Gemini Agentic System
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-2 border-b-2 ${
                    isActive
                      ? 'border-[#A38F58] text-black font-semibold bg-[#F8F6F0]'
                      : 'border-transparent text-black/70 hover:text-black hover:border-black/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#A38F58]' : 'text-black/60'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && (
                    <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-sm bg-black text-[#A38F58] font-mono tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Officer Identity & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <div className="text-right border-r border-black/10 pr-4">
                <div className="text-xs font-semibold text-black leading-tight">
                  {session.username}
                </div>
                <div className="text-[10px] text-[#A38F58] font-medium tracking-wide uppercase">
                  {session.role}
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="px-3 py-1.5 border border-black/20 hover:border-black text-xs font-medium text-black flex items-center space-x-1.5 transition-colors hover:bg-black/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-black/20 text-black hover:bg-black/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium flex items-center justify-between border-l-2 ${
                    isActive
                      ? 'border-[#A38F58] text-black font-semibold bg-[#F8F6F0]'
                      : 'border-transparent text-black/70 hover:text-black'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-[#A38F58]" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && (
                    <span className="text-[11px] px-2 py-0.5 bg-black text-[#A38F58] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {session && (
              <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-black">{session.username}</div>
                  <div className="text-[10px] text-[#A38F58]">{session.role}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-1.5 border border-black/20 text-xs font-medium text-black flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
