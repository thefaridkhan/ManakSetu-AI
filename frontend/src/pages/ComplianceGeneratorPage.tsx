import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schemesApi } from '../services/api.js';
import { CertificationScheme, ComplianceRoadmap } from '../types/index.js';
import {
  CheckSquare,
  Building2,
  FileText,
  Clock,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ComplianceGeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stdQuery = searchParams.get('std') || 'IS 14543';
  const prodQuery = searchParams.get('prod') || 'Packaged Drinking Water';

  const [schemes, setSchemes] = useState<CertificationScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<CertificationScheme | null>(null);

  // Generator form state
  const [standardNo, setStandardNo] = useState(stdQuery);
  const [productName, setProductName] = useState(prodQuery);
  const [scale, setScale] = useState<'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');
  const [generatedChecklist, setGeneratedChecklist] = useState<ComplianceRoadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSchemes();
    // Auto generate for default
    handleGenerate();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await schemesApi.getSchemes();
      if (res.success && res.data) {
        setSchemes(res.data);
        if (res.data.length > 0) {
          setSelectedScheme(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    }
  };

  const handleGenerate = async () => {
    if (!standardNo.trim()) return;
    setIsGenerating(true);
    try {
      const res = await schemesApi.generateChecklist({
        standardNo: standardNo.trim(),
        productName: productName.trim(),
        scale
      });
      if (res.success && res.data) {
        setGeneratedChecklist(res.data);
      }
    } catch (err) {
      console.error('Failed to generate compliance roadmap:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <CheckSquare className="w-4 h-4" />
          <span>Manufacturer Roadmap & Licensing Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">BIS Schemes & Compliance Generator</h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl">
          Understand official BIS Conformity Assessment schemes and generate tailor-made factory audit roadmaps, test equipment matrices, and SIT checklists.
        </p>
      </div>

      {/* Interactive Compliance Wizard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Custom Compliance Roadmap Wizard</h2>
            <p className="text-xs text-slate-500">Enter your product standard to generate an actionable licensing roadmap.</p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Indian Standard No.</label>
            <input
              type="text"
              value={standardNo}
              onChange={(e) => setStandardNo(e.target.value)}
              placeholder="e.g. IS 14543, IS 1786, IS 269"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Description</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Packaged Drinking Water"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enterprise Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 focus:outline-none"
            >
              <option value="MICRO">Micro Enterprise (Udyam &lt; ₹1 Cr)</option>
              <option value="SMALL">Small Enterprise (₹1 - ₹10 Cr)</option>
              <option value="MEDIUM">Medium Enterprise (₹10 - ₹50 Cr)</option>
              <option value="LARGE">Large Industry (&gt; ₹50 Cr)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#0F2C59] hover:bg-[#1E40AF] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Roadmap & Checklist'}</span>
          </button>
        </div>

        {/* Generated Roadmap Result */}
        {generatedChecklist && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/60 p-4 rounded-xl border border-blue-200 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-[#0F2C59]">{generatedChecklist.standardNo}</span>
                  {generatedChecklist.isMandatoryQCO && (
                    <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                      Mandatory QCO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{generatedChecklist.title}</p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Timeline: {generatedChecklist.estimatedTimeline}</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 text-[#0F2C59] hover:text-[#1E40AF] font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export</span>
                </button>
              </div>
            </div>

            {/* 5-Phase Roadmap Stepper */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step-by-Step Licensing Phases</h3>
              <div className="space-y-3">
                {generatedChecklist.roadmapSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-xs text-[#0F2C59] mb-2 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-[#0F2C59] text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step.phase}</span>
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pl-7">
                      {step.tasks.map((task, tidx) => (
                        <li key={tidx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Matrix */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mandatory Application Dossier Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedChecklist.requiredDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official BIS Schemes Directory Tabs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#0F2C59]">Bureau of Indian Standards Conformity Schemes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {schemes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScheme(s)}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedScheme?.id === s.id
                  ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-bold uppercase text-amber-400 mb-0.5">
                {s.schemeCode.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] line-clamp-2 leading-tight">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Scheme Detail Box */}
        {selectedScheme && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase mb-1">
                <Award className="w-4 h-4" />
                <span>{selectedScheme.schemeCode.replace(/_/g, ' ')}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedScheme.title}</h3>
              {selectedScheme.hindiTitle && (
                <p className="text-xs text-slate-500 font-medium">{selectedScheme.hindiTitle}</p>
              )}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedScheme.description}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Eligible Applicants</span>
              <p className="text-xs font-semibold text-slate-800">{selectedScheme.eligibleEntities}</p>
            </div>

            {/* Steps in Scheme */}
            {selectedScheme.procedureSteps && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Licensing Lifecycle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(selectedScheme.procedureSteps as any[]).map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0F2C59] font-bold flex items-center justify-center text-xs mb-2">
                        {step.stepNo}
                      </span>
                      <h5 className="font-bold text-slate-900 mb-1">{step.title}</h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed mb-2">{step.description}</p>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Est: {step.timeEstimate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fee Structure */}
            {selectedScheme.feeStructure && (
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-950">
                <h5 className="font-bold text-amber-900 uppercase text-[11px]">Fee Schedule Outline</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Application Fee:</span>
                    <span className="font-bold">{selectedScheme.feeStructure.applicationFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Inspection / Audit:</span>
                    <span className="font-bold">{selectedScheme.feeStructure.inspectionFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Annual Marking Fee:</span>
                    <span className="font-bold">{selectedScheme.feeStructure.markingFee}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <a
                href={selectedScheme.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0F2C59] hover:bg-[#1E40AF] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Open Official Portal ({selectedScheme.portalUrl.replace('https://', '')}) →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
