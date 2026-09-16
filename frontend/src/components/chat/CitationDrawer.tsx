import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertCircle, Bookmark } from 'lucide-react';
import { CitationItem } from '../../types/index.js';

interface CitationDrawerProps {
  citation: CitationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, isOpen, onClose }) => {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm">Authoritative Source Citation</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Standard Number & Status */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#0F2C59] px-2 py-0.5 rounded border border-blue-200">
                  {citation.identifier}
                </span>
                {citation.isMandatoryQCO && (
                  <span className="text-xs font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Mandatory QCO</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {citation.title}
              </h2>
            </div>

            {/* Clause Reference if present */}
            {citation.clauseRef && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cited Clause: {citation.clauseRef}</span>
                </div>
                <p className="text-xs text-amber-800">
                  This specific clause defines the mandatory testing boundaries and tolerances required for compliance under BIS assessment.
                </p>
              </div>
            )}

            {/* Source Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Origin & Integrity</h4>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Publisher:</span>
                  <span className="font-semibold text-slate-800">Bureau of Indian Standards</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repository:</span>
                  <span className="font-semibold text-slate-800">Official Standards Gazette & e-BIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grounding Status:</span>
                  <span className="text-emerald-700 font-bold">Verified Fact</span>
                </div>
              </div>
            </div>

            {/* External Links */}
            {citation.sourceUrl && (
              <a
                href={citation.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0F2C59] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <span>Open Full BIS Gazette Reference</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              Information extracted from permitted public Bureau of Indian Standards catalogues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
