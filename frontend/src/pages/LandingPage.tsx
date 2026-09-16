import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import {
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Award,
  ArrowRight,
  Droplet,
  Layers,
  Zap,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [persona, setPersona] = useState<'CONSUMER' | 'INDUSTRY'>('CONSUMER');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/standards?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredStandards = [
    { isNo: 'IS 10500:2012', title: 'Drinking Water Specifications', sector: 'Water Supply', qco: false, icon: Droplet },
    { isNo: 'IS 14543:2016', title: 'Packaged Drinking Water', sector: 'Food & Beverages', qco: true, icon: Droplet },
    { isNo: 'IS 1786:2008', title: 'High Strength TMT Steel Rebars', sector: 'Steel & Metallurgy', qco: true, icon: Layers },
    { isNo: 'IS 1417:2016', title: 'Gold Hallmarking (HUID 22K/18K)', sector: 'Precious Metals', qco: true, icon: Award },
    { isNo: 'IS 269:2015', title: 'Ordinary Portland Cement (OPC 43/53)', sector: 'Building Materials', qco: true, icon: Building2 },
    { isNo: 'IS 1293:2019', title: 'Household Plugs & Sockets (6A/16A)', sector: 'Electrical Accessories', qco: true, icon: Zap }
  ];

  const quickPrompts = [
    { label: 'Packaged Water (IS 14543)', query: 'What standard applies to packaged drinking water?' },
    { label: 'Gold HUID Verification', query: 'How to verify gold hallmark with 6-digit HUID?' },
    { label: 'TMT Steel Mandatory QCO', query: 'What are the mandatory QCO requirements for TMT steel?' },
    { label: 'Report Fake ISI Mark', query: 'How to report fake ISI mark products on BIS Care app?' },
    { label: 'Toy Safety (IS 9873)', query: 'What is the mandatory standard for children toys?' }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Modern High-Tech Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#07192F] via-[#0B2545] to-[#0D1F38] text-white pt-14 pb-20 border-b border-slate-800">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-amber-300 mb-6 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>National Standards & Certification Intelligence</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15]">
            <span className="text-white">Empowering India with </span>
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              ManakSetu AI
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Authoritative, source-grounded intelligence for 21,000+ Indian Standards (IS), Mandatory QCOs, ISI Mark Licensing, CRS, and Consumer Protection.
          </p>

          {/* Sleek Search & AI Consultation Box */}
          <div className="mt-9 max-w-2xl mx-auto">
            <form
              onSubmit={handleQuickSearch}
              className="relative flex items-center shadow-xl rounded-2xl bg-white/95 backdrop-blur-md p-1.5 border border-amber-400/60 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian Standard, Product, or ask a question (e.g. IS 10500, TMT Steel, Gold HUID)..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-[#0B2545] hover:bg-[#123968] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 shadow-sm"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Prompt Chips */}
            <div className="mt-3.5 flex flex-wrap justify-center items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Trending:</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/chat?q=${encodeURIComponent(p.query)}`)}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border border-white/10"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3.5">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{t('hero.askBtn')}</span>
            </Link>
            <Link
              to="/standards"
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl border border-white/15 backdrop-blur-sm transition-colors text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4 text-slate-300" />
              <span>{t('hero.exploreBtn')}</span>
            </Link>
          </div>

          {/* Key Intelligence Stats Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800 text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-amber-400">21,000+</p>
              <p className="text-[11px] text-slate-400 font-medium">Indian Standards Index</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-emerald-400">100% Grounded</p>
              <p className="text-[11px] text-slate-400 font-medium">Strict Anti-Hallucination</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-blue-400">Bilingual</p>
              <p className="text-[11px] text-slate-400 font-medium">English & हिन्दी Assistance</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-orange-400">Live QCO</p>
              <p className="text-[11px] text-slate-400 font-medium">Gazette Compliance Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Assistance: Consumer vs Industry Pathway */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545]">Tailored Assistance for India</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Select your role to view relevant certification workflows and guidance.</p>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 mt-5 shadow-inner">
            <button
              onClick={() => setPersona('CONSUMER')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                persona === 'CONSUMER'
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>For Indian Consumers</span>
            </button>
            <button
              onClick={() => setPersona('INDUSTRY')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                persona === 'INDUSTRY'
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>For Manufacturers & MSMEs</span>
            </button>
          </div>
        </div>

        {persona === 'CONSUMER' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4 border border-amber-200">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Verify ISI & Gold Hallmarks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check whether standard marks on domestic appliances, packaged water, or 6-digit HUID gold jewelry are genuine before purchase.
              </p>
              <Link to="/chat?q=How+to+verify+genuine+ISI+mark+and+gold+HUID%3F" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>Ask AI Assistant</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-4 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Report Fake Products & Grievance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step guidance on reporting counterfeit ISI marks, under-karatage gold, or non-certified mandatory products via the BIS Care App.
              </p>
              <Link to="/grievance" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>View Grievance Guide</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 border border-emerald-200">
                <Droplet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Understand Quality Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn permissible limits for drinking water purity (IS 10500), toy safety (IS 9873), and electrical shock protection in Hindi or English.
              </p>
              <Link to="/standards" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>Browse Standards</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 border border-blue-200">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Mandatory QCO Compliance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify Quality Control Orders issued by DPIIT, MoRTH, and Steel Ministries that make ISI certification legally mandatory for your goods.
              </p>
              <Link to="/standards?mandatory=true" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>Check Mandatory QCOs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 border border-purple-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Generate Compliance Roadmap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a customized step-by-step factory audit checklist, Scheme of Inspection & Testing (SIT), and documentation packet for licensing.
              </p>
              <Link to="/schemes" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>Launch Checklist Generator</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4 border border-teal-200">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Scheme Navigator (ISI, CRS, FMCS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Navigate the differences between domestic Scheme-I (ISI Mark), Scheme-II (CRS Self-Declaration for IT/Electronics), and FMCS for foreign imports.
              </p>
              <Link to="/schemes" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2545] hover:underline mt-4">
                <span>Explore Schemes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Featured Indian Standards Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B2545]">Featured Indian Standards (IS)</h2>
            <p className="text-xs text-slate-600 mt-0.5">Authoritative records directly from the Bureau of Indian Standards catalogue.</p>
          </div>
          <Link to="/standards" className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 mt-2 sm:mt-0">
            <span>View All Standards</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredStandards.map((std, i) => {
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0B2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {std.isNo}
                    </span>
                    {std.qco ? (
                      <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                        Mandatory QCO
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Voluntary
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{std.title}</h3>
                  <p className="text-xs text-slate-500">Sector: {std.sector}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/chat?q=Explain+requirements+and+testing+for+${encodeURIComponent(std.isNo)}`}
                    className="text-xs font-bold text-[#0B2545] hover:text-blue-700 flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ask AI</span>
                  </Link>
                  <Link
                    to={`/standards/${encodeURIComponent(std.isNo)}`}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RAG & Anti-Hallucination Assurance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#07192F] via-[#0B2545] to-[#123968] text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Strict Anti-Hallucination Grounding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Built on Verified Government Knowledge & Gazette Notifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every answer generated by ManakSetu AI is grounded against authoritative Indian Standards databases. The system never invents standard numbers, fabricated test limits, or fictitious mandatory orders.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-amber-200">
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Exact Clause & Gazette Citations</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-amber-400" />
                <span>SHA-256 Incremental Version Sync</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Bilingual English & Hindi Retrieval</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
