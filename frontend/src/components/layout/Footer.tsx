import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, ExternalLink, Award } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07192F] text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & About */}
          <div className="space-y-3">
            <BrandLogo variant="dark" size="sm" />
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              National Standards Body Intelligence Platform for harmonious development of standardization, marking, and quality certification of goods under the BIS Act, 2016.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="inline-flex items-center space-x-1 bg-blue-950 text-amber-300 text-[10px] font-semibold px-2 py-1 rounded border border-blue-800">
                <Award className="w-3 h-3 text-amber-400" />
                <span>BIS Care Mobile App Ready</span>
              </span>
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/standards" className="hover:text-amber-400 transition-colors">Indian Standards Directory (IS)</Link></li>
              <li><Link to="/products" className="hover:text-amber-400 transition-colors">Product-to-Standard Matcher</Link></li>
              <li><Link to="/schemes" className="hover:text-amber-400 transition-colors">ISI Mark & CRS Schemes</Link></li>
              <li><Link to="/grievance" className="hover:text-amber-400 transition-colors">Consumer Grievance & Fake ISI Report</Link></li>
              <li><Link to="/chat" className="hover:text-amber-400 transition-colors">AI Intelligence Assistant</Link></li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Official BIS Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.services.bis.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-amber-400">
                  <span>e-BIS Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.manakonline.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-amber-400">
                  <span>Manakonline (Scheme I & FMCS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.crsbis.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-amber-400">
                  <span>CRS Portal (IT & Electronics)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.services.bis.gov.in/php/BIS_2.0/lab-home" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-amber-400">
                  <span>BIS Laboratory Network (LIMS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: National Helpline */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Helpline & Support</h4>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <PhoneCall className="w-4 h-4" />
                <span>1800 11 1204 (Toll Free)</span>
              </div>
              <p className="text-[11px] text-slate-400">Monday - Friday: 9:00 AM - 5:30 PM</p>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5" />
                <span>complaints@bis.gov.in</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ManakSetu AI • Bureau of Indian Standards (BIS) Intelligence.</p>
          <p className="mt-2 sm:mt-0 text-[11px] text-slate-400">
            Source-Grounded Knowledge Engine with Strict Anti-Hallucination Guard.
          </p>
        </div>
      </div>
    </footer>
  );
};
