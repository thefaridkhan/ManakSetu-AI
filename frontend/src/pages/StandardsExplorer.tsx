import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { standardsApi } from '../services/api.js';
import { Standard } from '../types/index.js';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  X,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';

export const StandardsExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const mandatoryParam = searchParams.get('mandatory');

  const [standards, setStandards] = useState<Standard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [mandatoryOnly, setMandatoryOnly] = useState<boolean>(mandatoryParam === 'true');
  const [sectors, setSectors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  useEffect(() => {
    fetchStandards();
  }, [searchQuery, selectedSector, mandatoryOnly]);

  const loadSectors = async () => {
    try {
      const res = await standardsApi.getSectors();
      if (res.success && res.data) {
        setSectors(res.data);
      }
    } catch (err) {
      console.warn('Could not load sectors:', err);
    }
  };

  const fetchStandards = async () => {
    setIsLoading(true);
    try {
      const res = await standardsApi.search({
        q: searchQuery,
        sector: selectedSector,
        mandatory: mandatoryOnly ? true : undefined,
        limit: 50
      });

      if (res.success && res.data) {
        setStandards(res.data.items);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load standards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Official Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Indian Standards (IS) Directory</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Search, filter, and inspect verified specifications, mandatory QCO orders, and testing parameters.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
          <span className="text-xs text-slate-300">Catalogued Standards</span>
          <p className="text-2xl font-black text-amber-400">{totalCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IS number, title, or product..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
          />
        </div>

        {/* Sector and Mandatory Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((sec, i) => (
              <option key={i} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Mandatory QCO Toggle */}
          <button
            onClick={() => setMandatoryOnly(!mandatoryOnly)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              mandatoryOnly
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Mandatory QCO Only</span>
          </button>
        </div>
      </div>

      {/* Standards List / Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-48 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : standards.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No matching Indian Standards found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search keyword or sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {standards.map(std => (
            <div
              key={std.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F2C59] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {std.isNumber}
                  </span>
                  {std.isMandatoryQCO ? (
                    <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 flex items-center space-x-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>Mandatory QCO</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Voluntary
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2">{std.title}</h3>
                {std.hindiTitle && (
                  <p className="text-xs text-slate-500 mb-2 font-medium">{std.hindiTitle}</p>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                  {std.scope}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Sector:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{std.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amendments:</span>
                    <span className="font-semibold text-slate-700">{std.amendmentsCount} revisions</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedStandard(std)}
                  className="text-xs font-bold text-[#0F2C59] hover:underline"
                >
                  Inspect Clauses →
                </button>
                <Link
                  to={`/chat?q=Explain+requirements+and+testing+for+${encodeURIComponent(std.isNumber)}`}
                  className="flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Detail Modal */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-6 bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    {selectedStandard.isNumber}
                  </span>
                  {selectedStandard.isMandatoryQCO && (
                    <span className="text-xs font-bold uppercase bg-rose-500 text-white px-2 py-0.5 rounded">
                      Mandatory QCO
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold">{selectedStandard.title}</h2>
                {selectedStandard.hindiTitle && (
                  <p className="text-xs text-amber-200 mt-0.5">{selectedStandard.hindiTitle}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Standard Scope</h4>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedStandard.scope}
                </p>
              </div>

              {selectedStandard.keyRequirements && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Key Quality & Test Parameters</h4>
                  <ul className="space-y-1.5 list-disc pl-5">
                    {selectedStandard.keyRequirements.map((req, i) => (
                      <li key={i} className="leading-relaxed font-medium text-slate-800">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Testing Duration</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStandard.testingDays || 7} Days in Lab</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sample Quantity Required</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStandard.sampleSize || 'Representative batch'}</span>
                </div>
              </div>

              {selectedStandard.qcoNotification && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-xl">
                  <h5 className="font-bold text-rose-900">Official Quality Control Order</h5>
                  <p className="text-rose-800 text-[11px] mt-0.5">{selectedStandard.qcoNotification}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <Link
                to={`/chat?q=What+are+all+the+compliance+steps+for+${encodeURIComponent(selectedStandard.isNumber)}%3F`}
                className="bg-[#0F2C59] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Ask AI Compliance Assistant</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
