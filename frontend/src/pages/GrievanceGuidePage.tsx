import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grievanceApi } from '../services/api.js';
import { GrievanceGuide } from '../types/index.js';
import {
  AlertTriangle,
  Smartphone,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Scale,
  Award,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export const GrievanceGuidePage: React.FC = () => {
  const [guides, setGuides] = useState<GrievanceGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GrievanceGuide | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, [selectedCategory]);

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const res = await grievanceApi.getGuides(selectedCategory);
      if (res.success && res.data) {
        setGuides(res.data);
        if (res.data.length > 0) {
          setSelectedGuide(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load grievance guides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Consumer Rights & Enforcement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Consumer Grievance & Enforcement Guide</h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Report fake ISI marks, under-karatage gold hallmarking, and non-certified products. Learn how the BIS Care App protects Indian consumers.
        </p>
      </div>

      {/* BIS Care App Feature Spotlight */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-[#0F2C59] px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Official Mobile Tool</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Download BIS Care App for 1-Tap Verification</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The **BIS Care App** allows consumers to verify authentic 7-digit CM/L license numbers, 8-digit CRS registration codes, and 6-digit Hallmark Unique Identification (HUID) on gold ornaments in real time.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="https://play.google.com/store/apps/details?id=com.bis.mobileapp"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0F2C59] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
            >
              <span>Get on Android / Google Play</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
              <PhoneCall className="w-4 h-4 text-amber-600" />
              <span>National Toll-Free: 1800 11 1204</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <h4 className="font-bold text-slate-800 uppercase text-[11px]">Enforcement Penalties</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Under <strong>Section 14, 15 & 29 of the BIS Act, 2016</strong>, unauthorized use of ISI mark or sale of uncertified mandatory goods carries fines up to <strong>₹5 Lakhs</strong> and imprisonment up to <strong>2 Years</strong>.
          </p>
        </div>
      </div>

      {/* Grievance Topics Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Topics List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grievance Categories</h3>
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGuide(g)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                selectedGuide?.id === g.id
                  ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                {g.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs line-clamp-2">{g.topic}</span>
            </button>
          ))}
        </div>

        {/* Right Topic Detail & Reporting Steps */}
        {selectedGuide && (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {selectedGuide.category.replace(/_/g, ' ')}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedGuide.topic}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedGuide.description}</p>
            </div>

            {/* Step-by-Step Reporting Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">How to File a Complaint</h4>
              <div className="space-y-2">
                {(selectedGuide.stepsToReport as string[]).map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0F2C59] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 leading-relaxed font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-1 text-xs text-amber-950">
              <span className="font-bold text-amber-900 uppercase text-[10px] block">BIS Care App Flow</span>
              <p className="font-medium">{selectedGuide.bisCareAppAction}</p>
            </div>

            {selectedGuide.legalProvisions && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Legal Standing:</span>
                <span>{selectedGuide.legalProvisions}</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to={`/chat?q=How+do+I+file+a+complaint+for+${encodeURIComponent(selectedGuide.topic)}%3F`}
                className="bg-[#0F2C59] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Ask AI to Guide Me</span>
              </Link>
              <a
                href={selectedGuide.onlinePortalUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
              >
                <span>Open e-BIS Grievance Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
