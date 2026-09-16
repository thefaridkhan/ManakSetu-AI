import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, UserCheck, Building2, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-[#1E40AF] text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-[#0F2C59]">Sign in to BIS Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Access personalized Indian Standards intelligence</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F2C59] hover:bg-[#1E40AF] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Assistant</span>}
          </button>
        </form>

        {/* 1-Click Demo Credentials */}
        <div className="pt-4 border-t border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block text-center mb-2">1-Click Demo Profiles</span>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@bis.gov.in', 'bisadmin123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-center text-slate-700 font-semibold"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 mx-auto mb-1" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('industry@example.com', 'user123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-center text-slate-700 font-semibold"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 mx-auto mb-1" />
              <span>Industry</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('consumer@example.com', 'user123')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-center text-slate-700 font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
              <span>Consumer</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-[#0F2C59] hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
