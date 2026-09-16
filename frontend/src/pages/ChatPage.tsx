import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatApi } from '../services/api.js';
import { ChatMessage, CitationItem, Conversation } from '../types/index.js';
import { MessageBubble } from '../components/chat/MessageBubble.js';
import { CitationDrawer } from '../components/chat/CitationDrawer.js';
import { SuggestedPrompts } from '../components/chat/SuggestedPrompts.js';
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  ShieldCheck,
  Sparkles,
  Loader2,
  RefreshCw,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<'ALL' | 'CONSUMER' | 'INDUSTRY'>('ALL');
  
  // Drawer state
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load past conversation threads
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle URL query parameter if launched from search
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      // Remove param from URL
      setSearchParams({});
    }
  }, [initialQuery]);

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.warn('Could not load conversations:', err);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      setCurrentConversationId(convId);
      const res = await chatApi.getConversation(convId);
      if (res.success && res.data && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputQuery('');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await chatApi.deleteConversation(convId);
      setConversations(conversations.filter(c => c.id !== convId));
      if (currentConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage({
        message: textToSend.trim(),
        conversationId: currentConversationId || undefined
      });

      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          id: res.data.messageId,
          role: 'assistant',
          content: res.data.answer,
          language: res.data.language,
          intent: res.data.intent,
          citations: res.data.citations,
          confidence: res.data.confidence,
          suggestedQuestions: res.data.suggestedQuestions,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMsg]);
        setCurrentConversationId(res.data.conversationId);
        loadConversations();
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error Processing Request**: ${err.message || 'Unable to retrieve BIS knowledge records. Please check database and server connectivity.'}`,
        confidence: 0,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCitation = (citation: CitationItem) => {
    setSelectedCitation(citation);
    setIsDrawerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#123968] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#0B2545]">ManakSetu AI Assistant</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">Grounded RAG</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Source-Grounded Retrieval • Bilingual Hindi & English • Strict Anti-Hallucination Guard</p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center space-x-1.5 bg-[#0B2545] hover:bg-[#123968] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* Main Workspace: Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Left Sidebar: Conversation History */}
        <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col hidden md:flex">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#0F2C59]" />
              <span>Past Sessions</span>
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No past consultations yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-blue-100/70 text-[#0F2C59] font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-[#1E40AF] text-white flex items-center justify-center shadow-lg mb-4">
                  <ShieldCheck className="w-9 h-9 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-[#0F2C59] mb-1">
                  How can the Bureau of Indian Standards assist you?
                </h2>
                <p className="text-xs text-slate-500 mb-6 max-w-md">
                  Ask in English, Hindi, or Hinglish. Every response is verified against the official Indian Standards repository and gazette Quality Control Orders.
                </p>

                {/* Suggested Prompts Grid */}
                <div className="w-full text-left">
                  <SuggestedPrompts
                    onSelectPrompt={(p) => handleSendMessage(p)}
                    activePersona={activePersona}
                    onPersonaChange={setActivePersona}
                  />
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id || idx}
                    message={msg}
                    onSelectCitation={handleOpenCitation}
                    onSelectSuggestedQuestion={(q) => handleSendMessage(q)}
                  />
                ))}

                {/* Loading / Thinking Indicator */}
                {isLoading && (
                  <div className="flex items-start space-x-3 my-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center shadow-sm">
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-md">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-[#0F2C59]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>Searching BIS Standards & Gazette Knowledge Base...</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Synthesizing verified clauses, QCO mandates, and scheme procedures...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2.5"
            >
              <div className="flex-1 relative rounded-xl border border-slate-300 focus-within:border-[#0B2545] focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-slate-50/50">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about Indian Standards, ISI Mark, Factory Setup, Fees, Testing, or Grievances in English or हिन्दी..."
                  className="w-full px-4 py-3.5 text-sm sm:text-base text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 font-normal"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-3.5 bg-[#0B2545] hover:bg-[#123968] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-all flex items-center justify-center flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> : <Send className="w-5 h-5 text-amber-400" />}
              </button>
            </form>
            <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
              Responses are source-grounded in verified Bureau of Indian Standards public catalogues and Gazette Notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Citation Detail Slide-Over Drawer */}
      <CitationDrawer
        citation={selectedCitation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
