import React from 'react';
import { Droplet, Layers, ShieldAlert, Cpu, Sparkles, Building2, UserCheck } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  activePersona: 'ALL' | 'CONSUMER' | 'INDUSTRY';
  onPersonaChange: (persona: 'ALL' | 'CONSUMER' | 'INDUSTRY') => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  activePersona,
  onPersonaChange
}) => {
  const consumerPrompts = [
    { text: "What is the standard for Packaged Drinking Water?", icon: Droplet, tag: "Water" },
    { text: "How do I verify 6-digit HUID gold hallmarking on BIS Care app?", icon: Sparkles, tag: "Gold" },
    { text: "How can I report a shop selling fake ISI mark helmets?", icon: ShieldAlert, tag: "Grievance" },
    { text: "पेयजल (Drinking Water) के लिए कौन सा BIS मानक लागू होता है?", icon: Droplet, tag: "Hindi" }
  ];

  const industryPrompts = [
    { text: "What are the yield strength requirements for TMT bars under IS 1786?", icon: Layers, tag: "Steel" },
    { text: "Is Ordinary Portland Cement (OPC 43/53) under mandatory QCO?", icon: Building2, tag: "Cement" },
    { text: "What are the CRS testing standards for Lithium-ion batteries?", icon: Cpu, tag: "Electronics" },
    { text: "Generate compliance checklist for HDPE pipes under IS 4984", icon: Layers, tag: "Checklist" }
  ];

  const prompts = activePersona === 'CONSUMER'
    ? consumerPrompts
    : activePersona === 'INDUSTRY'
    ? industryPrompts
    : [...consumerPrompts.slice(0, 2), ...industryPrompts.slice(0, 2)];

  return (
    <div className="space-y-3">
      {/* Persona Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Inquiries</span>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
          <button
            onClick={() => onPersonaChange('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${activePersona === 'ALL' ? 'bg-white text-[#0F2C59] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All
          </button>
          <button
            onClick={() => onPersonaChange('CONSUMER')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${activePersona === 'CONSUMER' ? 'bg-white text-[#0F2C59] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <UserCheck className="w-3 h-3 text-amber-600" />
            <span>Consumers</span>
          </button>
          <button
            onClick={() => onPersonaChange('INDUSTRY')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${activePersona === 'INDUSTRY' ? 'bg-white text-[#0F2C59] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Building2 className="w-3 h-3 text-blue-600" />
            <span>Manufacturers</span>
          </button>
        </div>
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(p.text)}
              className="group flex items-center justify-between p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all shadow-xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-blue-100/60 flex items-center justify-center text-slate-600 group-hover:text-[#0F2C59] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-[#0F2C59] line-clamp-1">
                  {p.text}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-amber-600 ml-2">
                {p.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
