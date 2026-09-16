import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { BrandLogo } from '../common/BrandLogo.js';
import {
  BookOpen,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Sparkles,
  LogOut,
  Menu,
  X,
  Globe,
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Streamlined, focused navigation items (no clutter)
  const navItems = [
    { label: t('nav.home'), path: '/', icon: Home },
    { label: t('nav.standards'), path: '/standards', icon: BookOpen },
    { label: t('nav.schemes'), path: '/schemes', icon: CheckSquare },
    { label: t('nav.grievance'), path: '/grievance', icon: AlertTriangle },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Official Government Banner */}
      <div className="bg-gradient-to-r from-[#07192F] via-[#0B2545] to-[#123968] text-white py-1 px-4 text-[11px] font-medium border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-slate-300">
              National Helpline: <strong className="text-amber-300">1800 11 1204</strong>
            </span>
            {/* Bilingual Toggle Pill */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors border border-white/10"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{language === 'en' ? '🇮🇳 हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-blue-50/90 text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#0B2545] hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Telemetry Link (Clean & subtle) */}
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive('/admin')
                  ? 'bg-slate-100 text-[#0B2545] font-bold'
                  : 'text-slate-500 hover:text-[#0B2545] hover:bg-slate-100/70'
              }`}
              title="System Telemetry & Ingestion"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </Link>
          </nav>

          {/* Right Action: AI Chat Button + Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Primary Glowing AI Assistant CTA */}
            <Link
              to="/chat"
              className="relative group inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
              <span>Ask AI Assistant</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
            </Link>

            {/* Auth Buttons / Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-[#0B2545] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#123968] rounded-lg shadow-xs transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              to="/chat"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  active ? 'bg-blue-50 text-[#0B2545] font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Admin Telemetry</span>
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-red-600 font-semibold"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-[#0B2545] border border-slate-200 rounded-lg"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-[#0B2545] rounded-lg"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
