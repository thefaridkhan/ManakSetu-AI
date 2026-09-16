import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, ThumbsUp, ThumbsDown, Bookmark, Sparkles, CheckCircle2, ExternalLink, FileText } from 'lucide-react';
import { ChatMessage, CitationItem } from '../../types/index.js';
import { feedbackApi } from '../../services/api.js';

interface MessageBubbleProps {
  message: ChatMessage;
  onSelectCitation: (citation: CitationItem) => void;
  onSelectSuggestedQuestion: (question: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectCitation,
  onSelectSuggestedQuestion
}) => {
  const isUser = message.role === 'user';
  const [feedbackSent, setFeedbackSent] = useState<number | null>(null);

  const handleFeedback = async (rating: number) => {
    try {
      await feedbackApi.submit({
        messageId: message.id,
        rating,
        citationAccuracy: true
      });
      setFeedbackSent(rating);
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-3 border-slate-200" />;
      }
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace(/^###\s+/, '');
        return (
          <h3 key={idx} className="text-base sm:text-lg font-extrabold text-[#0B2545] mt-4 mb-2 flex items-center space-x-1.5 leading-snug">
            <span>{formatInlineBold(title)}</span>
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        const title = trimmed.replace(/^####\s+/, '');
        return (
          <h4 key={idx} className="text-sm sm:text-base font-bold text-slate-800 mt-3 mb-1.5 leading-snug">
            {formatInlineBold(title)}
          </h4>
        );
      }
      // Checkbox items (e.g. * [x] or * [ ])
      if (trimmed.startsWith('* [x] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('* [ ] ') || trimmed.startsWith('- [ ] ')) {
        const isChecked = trimmed.includes('[x]');
        const itemText = trimmed.replace(/^[\*\-]\s+\[(x|\s)\]\s+/, '');
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 ml-2">
            <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] font-bold ${isChecked ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-400 border border-slate-300'}`}>
              {isChecked ? '✓' : ''}
            </span>
            <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed">
              {formatInlineBold(itemText)}
            </div>
          </div>
        );
      }
      // Numbered list items (e.g. 1. 2. 3.)
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const itemText = numberedMatch[2];
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 ml-2">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
              {num}
            </span>
            <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed">
              {formatInlineBold(itemText)}
            </div>
          </div>
        );
      }
      // Bullet list items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.replace(/^[\*\-]\s+/, '');
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed">
              {formatInlineBold(itemText)}
            </div>
          </div>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm sm:text-[15px] text-slate-800 leading-relaxed mb-2">
          {formatInlineBold(line)}
        </p>
      );
    });
  };

  const formatInlineBold = (text: string) => {
    // Split by **bold text**, [link text](url), `code`, and *italic text*
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\)]+\)|`[^`]+`|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={i} className="font-bold text-[#0B2545]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-blue-700 font-mono text-xs rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center space-x-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 ml-0.5 inline" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex items-start space-x-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#123968] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
      )}

      {/* Message Card */}
      <div
        className={`w-full max-w-3xl lg:max-w-4xl rounded-2xl shadow-sm transition-all ${
          isUser
            ? 'bg-[#0B2545] text-white p-4 sm:p-5 rounded-tr-none'
            : 'bg-white text-slate-900 border border-slate-200/90 p-5 sm:p-6 rounded-tl-none'
        }`}
      >
        {/* Assistant Header Badges */}
        {!isUser && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="font-bold text-[#0B2545] flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ManakSetu Grounded Intelligence</span>
              </span>
              {message.confidence && (
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{Math.round(message.confidence * 100)}% Verified</span>
                </span>
              )}
            </div>
            {message.intent && (
              <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider hidden sm:inline">
                {message.intent.replace('_', ' ')}
              </span>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className={isUser ? 'text-sm sm:text-base text-white leading-relaxed' : 'space-y-0.5'}>
          {isUser ? message.content : formatContent(message.content)}
        </div>

        {/* Official Source & Verification Proof Section */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-5 pt-3.5 border-t border-slate-100 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <Bookmark className="w-4 h-4 text-blue-700" />
                <span>Verified Official Proof & BIS Sources ({message.citations.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Click any source to inspect verified clauses
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, index) => (
                <button
                  key={citation.id || index}
                  onClick={() => onSelectCitation(citation)}
                  className="group flex items-center space-x-2 bg-white hover:bg-blue-50 text-[#0B2545] px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-blue-300 transition-all shadow-2xs hover:shadow-xs text-left"
                  title="Click to view full official clause citation"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold">{citation.identifier}</span>
                  {citation.clauseRef && (
                    <span className="text-slate-500 font-normal text-[11px]">({citation.clauseRef})</span>
                  )}
                  {citation.isMandatoryQCO && (
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">
                      QCO
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Next Actions */}
        {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">Suggested Next Questions</p>
            <div className="flex flex-col space-y-1.5">
              {message.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSelectSuggestedQuestion(q)}
                  className="text-left text-xs sm:text-sm font-semibold text-[#0B2545] hover:text-blue-700 hover:bg-blue-50/70 py-1.5 px-2.5 rounded-lg transition-colors flex items-center space-x-2 border border-slate-100 hover:border-blue-200"
                >
                  <span className="text-amber-500 font-bold">→</span>
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {!isUser && (
          <div className="mt-4 pt-2.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50">
            <span>Was this answer helpful and source-grounded?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFeedback(5)}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${feedbackSent === 5 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'}`}
                title="Helpful and accurate"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback(1)}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${feedbackSent === 1 ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600'}`}
                title="Needs correction"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
